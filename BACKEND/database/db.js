const path = require("path");
const fs = require("fs");

let db = null;

async function initDatabase() {
  const initSqlJs = require("sql.js");

  const SQL = await initSqlJs();

  const dbPath = path.join(__dirname, "game.db");

  // Kalau file game.db sudah ada, load dari file
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
    console.log("✅ Database loaded dari file game.db");
  } else {
    // Kalau belum ada, buat database baru
    db = new SQL.Database();
    console.log("✅ Database baru dibuat");
  }

  // Buat tabel kalau belum ada
  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      score       INTEGER NOT NULL,
      efficiency  REAL,
      rounds_won  INTEGER,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS round_history (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id    TEXT,
      round         INTEGER,
      player_score  INTEGER,
      dp_score      INTEGER,
      items_chosen  TEXT,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Tabel leaderboard & round_history siap");

  // Simpan ke file setiap kali ada perubahan
  saveDatabase();
}

// Fungsi simpan database ke file
function saveDatabase() {
  const dbPath = path.join(__dirname, "game.db");
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Fungsi query SELECT — mengembalikan array of objects
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Fungsi run INSERT / UPDATE / DELETE
function run(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
}

module.exports = { initDatabase, query, run, saveDatabase };