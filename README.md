# 🇮🇩 StrategiHub Analytics 2026 (Version 2)
**Pusat Data dan Informasi (PUSDATIN) — Kementerian Perhubungan Republik Indonesia**  
*Full-Stack Modernization, Next.js 14, Apache ECharts, Leaflet GIS & Strict Legacy Parity*

---

## 🌐 Live Deployment
Aplikasi terdeploy secara otomatis ke GitHub Pages menggunakan GitHub Actions:
👉 **[https://wildannazhif.github.io/strategihub-v2/](https://wildannazhif.github.io/strategihub-v2/)**

---

## 🚀 Fitur & Modul Utama (11 Modul)

1. **Kronologi Harian (286 Hari):** Deret waktu harian interaktif 5 moda transportasi (Udara, KA, Bus, ASDP, Laut) + Total Multimoda (1 Jan – 13 Okt 2026).
2. **Puncak Lebaran 2026 (1447H):** Kalender interaktif 17 hari (H-8 s/d H+8, Hari H: 21 Mar 2026), matriks heatmap lonjakan volume (*Surge Rate %*), dan dinamika pangsa pasar (*modal share*).
3. **Kinerja Load Factor (Rasio Beban Armada):** Analisis rasio penumpang per trip sarana (P/A) di hari normal vs hari puncak untuk 38 provinsi di Indonesia.
4. **Registri Simpul Transportasi (Top 30 Hubs):** Peringkat dan performa 30 simpul terpadat nasional (bandara, stasiun, terminal, pelabuhan) pada periode Lebaran dan YTD.
5. **Matriks 13 Indikator Operasional:** Cross-tabulation resmi 13 indikator kinerja utama Kementerian Perhubungan.
6. **Peta Spasial Simpul (Leaflet GIS):** Pemetaan interaktif 1.214 simpul prasarana dengan basemap CartoDB/OSM, filter skala, dan inspektur profil simpul.
7. **Proyeksi Mobilitas Nataru 2026/2027 (Horizon 100 Hari):**
   * Model Time Series: **Holt-Winters Multiplicative Damped Trend ($\phi=0,98$) + Weekly Seasonality ($s=7$) + Nataru Calendar Shock**.
   * 3 Skenario Kebijakan: Moderat ($1,00\times$), Optimis ($1,07\times$), Konservatif ($0,95\times$).
   * Interval Kepercayaan: 95% Confidence Interval ($CI = \hat{y} \pm 1,96 \times RMSE$).
   * Evaluasi Akurasi: MAPE 4,10%, RMSE 62.051, MAE 49.146, Directional Accuracy 89,3%.
8. **Simulator Kapasitas Armada:** Simulator kebutuhan tambahan trip armada di 1.010 simpul agar beban puncak setara hari normal.
9. **Peta Rute OD Interaktif:** Visualisasi busur rute alir penerbangan domestik nasional (WebGL & Canvas).
10. **Diagram Sankey OD Multimoda:** Aliran pergerakan penumpang antarmoda dan antarpulau.
11. **Tentang Data & Kamus Rumus (KaTeX):** Kompendium matematis lengkap rumus baku Kemenhub dan rekam jejak audit data.

---

## 🛠️ Arsitektur Teknologi

* **Frontend Framework:** Next.js 14 App Router, React 18, TypeScript (Strict).
* **Styling & Design Tokens:** Tailwind CSS, Institutional Slate/Navy Theme (Zero AI-slop, kontras tinggi).
* **Charting Engine:** Apache ECharts (Canvas & WebGL) – performa time-series ultra-cepat tanpa lag.
* **Geospatial:** Leaflet GIS & GeoJSON 38 Provinsi.
* **Math Typesetting:** KaTeX (LaTeX equation rendering).
* **Data Contract:** Asynchronous static contract (`public/data/mobility_data_bundle.json`).

---

## 💻 Menjalankan Secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/wildannazhif/strategihub-v2.git
cd strategihub-v2

# 2. Install dependensi
npm install

# 3. Jalankan mode pengembangan
npm run dev
# Buka http://localhost:3000

# 4. Membangun untuk produksi
npm run build
npm run start
```

---

*Hak Cipta © 2026 PUSDATIN Kementerian Perhubungan Republik Indonesia.*
