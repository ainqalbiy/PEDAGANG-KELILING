# PEDAGANG KELILING
**Pixel Art Algorithm Adventure — Game Edukasi Algoritma Pencarian Jalur**

---

## 🎮 Cara Menjalankan

Karena game ini menggunakan `<script src="...">` (file terpisah), **wajib dijalankan lewat HTTP server**, bukan buka file langsung (file://).

### Opsi 1 — Python (paling mudah)
```bash
cd PEDAGANG_KELILING
python -m http.server 5500
# Buka: http://localhost:5500
```

### Opsi 2 — Node.js / npx
```bash
cd PEDAGANG_KELILING
npx serve .
# atau
npx http-server . -p 5500
```

### Opsi 3 — VS Code Live Server
Install ekstensi **Live Server**, klik kanan `index.html` → *Open with Live Server*.

---

## 📁 Struktur Folder

```
PEDAGANG_KELILING/
│
├── index.html                  ← Entry point utama
│
├── css/
│   ├── style.css               ← Style global, variabel CSS, splash, animasi
│   ├── game.css                ← HUD, tombol, notifikasi
│   ├── popup.css               ← Dialog box, modal overlay, kartu, quiz
│   └── algorithm.css           ← Panel visualisasi algoritma
│
└── js/
    ├── utils/
    │   ├── constants.js        ← CONST (canvas size, warna, level XP)
    │   ├── helper.js           ← H.* (clamp, lerp, rand, format, dll.)
    │   └── spriteGenerator.js  ← Sprite.* (pixel art procedural)
    │
    ├── data/
    │   ├── cities.js           ← CITIES[], EDGES[], TERRAIN_INFO
    │   ├── mission.js          ← MISSION_TEMPLATES, generateMissions()
    │   ├── vehicles.js         ← VEHICLES[], getVehicle()
    │   └── achievements.js     ← ACHIEVEMENTS[]
    │
    ├── algorithms/
    │   ├── PriorityQueue.js    ← Min-heap priority queue
    │   ├── Graph.js            ← Wrapper graf dengan heuristic & reconstruct
    │   ├── AStar.js            ← A* Search (F = G + H)
    │   ├── Dijkstra.js         ← Dijkstra (G saja, jalur termurah)
    │   └── GreedyBestFirst.js  ← Greedy BFS (H saja, cepat tapi tidak optimal)
    │
    ├── core/
    │   ├── audioManager.js     ← Web Audio API: SFX + BGM prosedural
    │   └── sceneManager.js     ← SceneManager: register/switch/update/render
    │
    ├── systems/
    │   ├── SaveSystem.js       ← Save/load state via localStorage
    │   ├── EconomySystem.js    ← Uang, XP, level up, buka kota
    │   ├── MissionSystem.js    ← Generate & selesaikan misi
    │   └── AchievementsSystem.js ← Cek & beri prestasi
    │
    ├── ui/
    │   ├── DialogBox.js        ← Dialog gaya Pokemon + Notify toast
    │   └── ModalUI.js          ← Modal: Toko, Akademi, Prestasi, Perbandingan
    │
    ├── visualizer/
    │   └── Visualizer.js       ← Visualisasi step-by-step algoritma di canvas
    │
    └── scenes/
        ├── main.js             ← Bootstrap: game loop, input, splash loading
        ├── MainMenu.js         ← Scene menu utama
        ├── MapScene.js         ← Scene peta utama (gameplay inti)
        ├── DeliveryScene.js    ← Scene animasi pengiriman
        └── LearningScene.js    ← Scene akademi algoritma
```

---

## 🕹️ Cara Bermain

1. **Pilih Algoritma** — Klik tombol `A*`, `Dijkstra`, atau `Greedy` di panel bawah kiri
2. **Pilih Misi** — Klik salah satu misi di panel kiri bawah (tertera item, rute, dan bayaran)
3. **Klik Kota Tujuan** — Klik kota yang sesuai di peta → algoritma berjalan otomatis
4. **Lihat Visualisasi** — Panel kanan menampilkan langkah-langkah algoritma (G, H, F, Open/Closed)
5. **Kumpulkan Reward** — Dapatkan 💰 uang dan 🎯 XP, naik level, buka kota baru
6. **Eksplorasi Fitur** — Buka 📚 Akademi, 📊 Banding algoritma, 🛒 Toko kendaraan, 🏆 Prestasi

---

## ⚙️ Teknologi

- **Vanilla JavaScript** (ES6+, tanpa framework)
- **HTML5 Canvas** untuk rendering game
- **Web Audio API** untuk sound effects & BGM prosedural
- **localStorage** untuk save/load progress
- **CSS3** dengan font pixel (Press Start 2P + VT323)

---

## 🐛 Bug yang Diperbaiki

| File | Bug | Fix |
|------|-----|-----|
| `index.html` | Script `missions.js` → file tidak ada | Diubah ke `mission.js` |
| `index.html` | Script `AchievementSystem.js` → file tidak ada | Diubah ke `AchievementsSystem.js` |
| `index.html` | 6 file hilang (Visualizer, scenes, main.js) | Semua file dibuat lengkap |
| `MissionSystem.js` | `state.missions.length` crash jika `null` | Ditambah `Array.isArray()` check |
| `audioManager.js` | `Audio` shadows native Web API constructor | Ditambah alias `AudioMgr` |
