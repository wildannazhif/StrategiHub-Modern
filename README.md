# 🇮🇩 StrategiHub Analytics 2026 (Version 2)
**Pusat Data dan Informasi (PUSDATIN) — Kementerian Perhubungan Republik Indonesia**  
*Full-Stack Modernization, Next.js 14, Apache ECharts, Leaflet GIS, Machine Learning (LightGBM) & Strict Legacy Parity*

---

## 🌐 Live Deployment
Aplikasi terdeploy secara otomatis ke GitHub Pages:  
👉 **[https://wildannazhif.github.io/StrategiHub-Modern/](https://wildannazhif.github.io/StrategiHub-Modern/)**

---

## 📊 Ringkasan Dataset Resmi 2026 (Hingga 31 Oktober 2026)
Dashboard ditenagai oleh agregasi 15 endpoint API resmi PUSDATIN Kemenhub (Triwulan 1, 2, dan 3):
* **Cakupan Waktu:** **304 Hari Kalender Penuh** (1 Januari – 31 Oktober 2026 • 10 Bulan).
* **Total Baris Data Bersih:** **235.219 baris** tervalidasi setelah deduplikasi dan rekonsiliasi.
* **Akumulasi Mobilitas Penumpang YTD:** **413.000.942 orang** (Keberangkatan: 232,73M | Kedatangan: 180,27M).
* **Total Trip Operasional Armada YTD:** **11.224.097 trip** (Rata-rata: 18.757 trip/hari).
* **Cakupan Wilayah & Simpul:** **38 Provinsi di Indonesia** dan **1.214 Simpul Transportasi** (1.018 simpul koordinat valid & 1.010 simpul operasional).

---

## 🚀 Fitur & Modul Utama (11 Modul Lengkap)

### 1. Kronologi Harian (304 Hari • 10 Bulan Penuh)
* Deret waktu harian interaktif 5 moda transportasi (Udara, Perkeretaapian, Bus/Jalan, Penyeberangan ASDP, Laut) serta Agregat Multimoda Nasional dari 1 Januari s.d. 31 Oktober 2026.
* Dilengkapi timeline slider dinamis, zoom rentang waktu, dan tooltip detail pergerakan harian.

### 2. Puncak Lebaran 2026 (1447H • 17 Hari Posko)
* **Tata Letak Paritas 1:1 Versi 1 (2 Kolom Berdampingan):**
  * **Kolom Kiri:** Grafik Garis Dinamika Harian 5 Moda Angkutan Lebaran (H-8 s/d H+8, Hari H: 21 Maret 2026).
  * **Kolom Kanan:** **Heatmap Persentase Lonjakan (%) terhadap Baseline Normal (Median 1 Jan – 12 Mar 2026)** mencakup puncak Mudik (18 Mar / H-3), Balik 1 (24 Mar / H+3), dan Balik 2 (29 Mar / H+8).
* **Tabel Evaluasi Lonjakan Puncak Lebaran:** Komparasi komprehensif baseline terhadap 3 titik puncak arus.

### 3. Kinerja Load Factor (Rasio Okupansi Armada)
* **Tata Letak Paritas 1:1 Versi 1 (2 Kolom Berdampingan):**
  * **Kolom Kiri:** Grafik Batang Rasio Kepadatan Penumpang per Armada (Normal vs Mudik vs Balik).
  * **Kolom Kanan:** **Tabel Evaluasi Utilisasi Armada** (6 Kolom: Moda, Normal, Mudik, Balik, Lonjakan Mudik %, Lonjakan Balik %).

### 4. Registri Simpul Transportasi (Top 30 Hubs)
* Peringkat 30 simpul prasarana terpadat nasional (bandara, stasiun kereta, terminal bus, pelabuhan laut, dermaga ASDP) berdasarkan volume hari puncak mudik, puncak balik, dan akumulasi YTD.

### 5. Matriks 13 Indikator Operasional
* Rekapitulasi tabulasi silang (*cross-tabulation*) 13 indikator kinerja utama Kementerian Perhubungan lintas 5 moda transportasi dan total nasional selama 304 hari operasional.

### 6. Peta Spasial Simpul (Leaflet GIS)
* Pemetaan interaktif 1.214 simpul prasarana di 38 provinsi dengan layer batas wilayah GeoJSON, *clipping-free fixed radius markers*, dan *inspector popup* profil kapasitas simpul.

### 7. Peta Rute OD Interaktif
* Visualisasi dinamis busur alir asal-tujuan (*Origin-Destination*) penerbangan domestik Indonesia berbasis WebGL GPU particles & glowing animated arcs.

### 8. Diagram Sankey OD Multimoda
* Komponen SVG murni (tanpa iframe) dengan auto-layout dinamis menampilkan distribusi aliran penumpang dari koridor asal menuju 40 bandara destinasi di seluruh kepulauan Indonesia.

### 9. Proyeksi Mobilitas Nataru 2026/2027 (Horizon 100 Hari: 1 Nov 2026 – 8 Feb 2027)
* **Data Latih Kontinu 1.035 Hari:** Mengintegrasikan data historis kontinu 2024 (366H) + 2025 (365H) + 2026 (304H) langsung tersambung ke 100 hari proyeksi.
* **Model Champion Juara 1: LightGBM Regressor (Machine Learning)**
  * *Objective:* L1 loss (`regression_l1`) dengan fitur kalender (`dow`, `month`, `day`, `is_weekend`), autoregresif (`lag_1`, `lag_2`, `lag_7`, `lag_14`), dan rolling statistics (`mean_7`, `std_7`).
  * *Akurasi Evaluasi Nasional (Testing 18 Hari Nataru):* **MAPE 3,29% (Juara 1)**, **RMSE 59.271**, **WAPE 3,24%**, **MAE 40.241**, **Directional Accuracy 89,3%**.
* **Integrasi Menyeluruh:** Model LightGBM dilatih dan dievaluasi di **seluruh 38 Provinsi** dan **seluruh 5 Moda Transportasi**.
* **Grafik Batang Komparasi 3 Tahun Nataru:** Visualisasi komparasi volume 18 hari (Realisasi 2024 vs Realisasi 2025 vs Proyeksi 2026) dilengkapi tombol *Minimize/Expand*.
* **Tabel Benchmark Turnamen 12 Model Peramalan:** Evaluasi perbandingan LightGBM terhadap Holt-Winters Damped, SARIMA, ARIMA, Linear Regression, SES, Naive, dll.

### 10. Simulator Kapasitas Armada
* Simulator penambahan kapasitas angkutan armada harian di 1.010 simpul nasional agar tingkat kepadatan saat lonjakan hari puncak tetap berada dalam ambang batas kenyamanan hari normal.

### 11. Tentang Data, Kamus Rumus & Dokumentasi Model (KaTeX)
* Dokumentasi ensiklopedis 8 bab lengkap dengan persamaan matematis KaTeX ($\LaTeX$): formula metrik dasar, formulasi ke-12 model peramalan, metodologi *middle-holdout*, formula defisit armada, dan kamus glosarium singkatan resmi.

---

## 🎛️ Sistem Filter Global (6 Permutasi)
Bilah kontrol filter analitik di bagian atas dashboard menyinkronkan data secara reaktif ke seluruh grafik:
* **Metrik:** Penumpang ($P$) vs Armada ($A$)
* **Arah Mobilitas:** Berangkat ($P_{\text{brg}}$), Datang ($P_{\text{dat}}$), atau Total Dua Arah ($P_{\text{tot}}$)

---

## 🛠️ Arsitektur Teknologi

* **Frontend Framework:** Next.js 14 (App Router), React 18, TypeScript (Strict Mode).
* **Komposisi Styling:** Tailwind CSS, Institutional Slate/Navy Theme dengan dukungan Dark & Light Mode.
* **Visualisasi Deret Waktu & GIS:** Apache ECharts 5 (Canvas & WebGL), Leaflet 1.9, GeoJSON 38 Provinsi Indonesia.
* **Persamaan Matematika:** KaTeX (LaTeX typesetting engine).
* **Machine Learning Pipeline:** Python 3.11, LightGBM, Statsmodels, Scikit-Learn, Pandas.
* **Hosting & CI/CD:** GitHub Actions dengan auto-deploy ke GitHub Pages (`gh-pages`).

---

## 💻 Menjalankan Secara Lokal

```bash
# 1. Clone repository
git clone git@github.com:wildannazhif/StrategiHub-Modern.git
cd StrategiHub-Modern

# 2. Install dependensi
npm install

# 3. Jalankan server pengembangan lokal
npm run dev
# Buka http://localhost:3000 pada browser

# 4. Bangun static export untuk produksi
npm run build
```

---

*Hak Cipta © 2026 PUSDATIN — Kementerian Perhubungan Republik Indonesia.*
