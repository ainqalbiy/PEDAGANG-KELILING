/* Pedagang Keliling - Constants */
const CONST = {
  CANVAS_W: 960,
  CANVAS_H: 600,
  COLORS: {
    grass: '#6dd06d',
    grassDark: '#3e8c3e',
    grassDarker: '#2d6a2d',
    water: '#4ab8e6',
    waterDeep: '#2e7fbd',
    sand: '#f0d68c',
    road: '#c79a6b',
    roadDark: '#8d6a44',
    sky: '#b6e7ff',
    night: '#2a1f4d',
    warm: '#ffd966',
    orange: '#ff8c42',
    red: '#ff5b6e',
    purple: '#a784e0',
    pink: '#ffaecf',
    cream: '#fff4d6',
    textDark: '#2d1b3d',
    forest: '#1f5e3a',
    mountain: '#9e8b7a',
    mountainTop: '#e8e4ed'
  },
  ALGO_COLORS: {
    current: '#ffd966',
    open: '#4ab8e6',
    closed: '#ff5b6e',
    path: '#ffae00',
    start: '#5fd66e',
    goal: '#a784e0',
    idle: '#fff4d6'
  },
  LEVELS: [
    { name: 'Pedagang Pemula', xpReq: 0 },
    { name: 'Pedagang Desa', xpReq: 200 },
    { name: 'Pedagang Kota', xpReq: 600 },
    { name: 'Pedagang Regional', xpReq: 1500 },
    { name: 'Pedagang Nasional', xpReq: 3500 },
    { name: 'Pedagang Legendaris', xpReq: 7000 }
  ]
};