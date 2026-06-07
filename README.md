# Nusantara Kaldera - React + Vite

Project ini adalah versi revisi dari peta interaktif worldbuilding Nusantara Kaldera.

## Perubahan utama
- Fokus UI diubah: **faksi → list karakter**, bukan per kota dulu.
- Ada **6 faksi besar**: Varath, Silven, Azurra, Thornwall, Ashkari, dan **Liga Bajak Laut Karang Selatan**.
- Ada beberapa faksi tambahan: Orc, Demon, Ras Kuno Arkael, Eldara, Klan Mesin Karat, dan Kultus Bulan Hitam.
- Wilayah bebas tetap kosong dan bebas: **Ngarai Abu, Air Terjun Rahasia, Celah Angin, Lembah Hujan Abadi, Gua Kristal Abadi**.
- Ada **tempat random berpindah** per turn.
- Ada **pengembara random** yang berpindah lokasi per turn.
- Peta dibuat lebih bertekstur ala **medieval parchment**, dengan jalan, gunung, hutan, sungai, dan kontur teritorial.

## Jalankan project

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
```

## Struktur file

```txt
src/
├─ App.jsx
├─ styles.css
├─ data/
│  ├─ factions.js
│  ├─ locations.js
│  ├─ roads.js
│  └─ characters.js
└─ utils/
   └─ randomPlaces.js
```
