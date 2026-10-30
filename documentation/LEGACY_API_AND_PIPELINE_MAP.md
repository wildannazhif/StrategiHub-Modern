# LEGACY API AND PIPELINE MAP
**StrategiHub Analytics 2026** — Kementerian Perhubungan RI  

---

## 1. Arsitektur Pipeline Pengolahan Data V1

Pipeline pengolahan data V1 berjalan di sisi server/lokal menggunakan Python untuk memproses file mentah CSV dari SIASATI Kemenhub, melakukan deduplikasi, standardisasi, imputasi spasial, komputasi metrik Lebaran, permodelan time series, dan membundel seluruh dataset ke dalam format JSON/HTML:

```text
[Raw Datasets Kemenhub]
  ├── siasati_udara_2026.csv   (59.159 baris)
  ├── siasati_ka_2026.csv      (49.219 baris)
  ├── siasati_bus_2026.csv     (36.545 baris)
  ├── siasati_asdp_2026.csv    (19.875 baris)
  └── siasati_laut_2026.csv    (46.563 baris)
         │
         ▼
[Preprocessing & Audit Pipeline]
  ├── scripts/preprocess_siasati.py
  ├── scripts/update_multimoda_data_13okt.py
  └── scripts/process_mobility_data_updated.py
         │  • Deduplikasi baris persis identik
         │  • Agregasi sum untuk duplikat biasa beda nilai
         │  • Audit koordinat kosong (196 simpul)
         │  • Standarisasi nama moda: Udara, Kereta Api, Jalan (Bus), Penyeberangan (ASDP), Laut
         ▼
[Unified Clean Dataset]
  ├── data/siasati_multimoda_2026_clean_13okt.csv (221.999 baris bersih)
  └── siasati_ringkasan_harian_multimoda_2025.csv (365 baris baseline 2025)
         │
         ├──► [Forecasting Engine]
         │      ├── scripts/generate_nataru_forecast.py
         │      ├── scripts/benchmark_all_models.py
         │      └── scripts/train_provincial_automodel_nataru.py
         │           • Holt-Winters Multiplicative Damped (phi=0.98, s=7)
         │           • Nataru Calendar Shock Adjustment (18 Hari)
         │           • 3 Skenario Proyeksi (Moderat, Optimis, Konservatif)
         │
         ├──► [Fleet Capacity Simulator Engine]
         │      ├── scripts/generate_simpul_recommendations.py
         │      ├── scripts/apply_prelebaran_baseline.py
         │      └── scripts/update_all_baseline_to_median.py
         │           • Simulasi penambahan armada di 1.010 simpul
         │
         ▼
[Data Bundler Engine]
  └── scripts/build_updated_bundle_and_dashboard.py
         │  • Menggabungkan seluruh hasil agregasi ke JSON bundle
         ▼
[Data Distribution Contract]
  ├── data/mobility_data_bundle.json (8.136.243 bytes)
  └── scripts/mobility_data_bundle.json
         │
         ▼
[HTML Compiler (Legacy V1 Deployment)]
  └── scripts/build_production_dashboard_sidebar.py
         │  • Meng-inline-kan JSON bundle langsung ke dalam <script> tag
         ▼
[Production V1 Artifacts]
  ├── index.html (8.486.238 bytes)  --> Live di GitHub Pages
  └── Dashboard_Mobilitas_Nasional_2026.html (Identik)
```

---

## 2. Peta Skrip Analitik dan Tugas Operasional

| Nama Skrip | Fungsi & Output Utama | Dependensi Python |
| :--- | :--- | :--- |
| `scripts/build_production_dashboard_sidebar.py` | Compiler utama HTML V1 yang menggabungkan UI Tailwind + Chart.js + JSON bundle menjadi `index.html`. | `json`, `os` |
| `scripts/generate_nataru_forecast.py` | Engine peramalan 100 hari Nataru 2026/2027 menggunakan model Holt-Winters Multiplicative Damped. | `pandas`, `numpy`, `statsmodels`, `scipy` |
| `scripts/benchmark_all_models.py` | Menguji komparasi 11 algoritma time series (HW, SARIMA, ARIMA, SES, Naive, Linear Reg). | `pandas`, `numpy`, `statsmodels` |
| `scripts/generate_simpul_recommendations.py` | Menghitung rasio beban normal vs puncak dan kebutuhan armada di 1.010 simpul prasarana. | `pandas`, `numpy` |
| `scripts/update_province_growth_multi_metric.py`| Mengagregasi metrik pertumbuhan bulanan per provinsi untuk visualisasi bar chart dan choropleth. | `pandas`, `numpy` |
| `scripts/implement_spatial_choropleth_heatmap.py`| Memetakan data pergerakan ke GeoJSON 38 provinsi (`indonesia_38_provinces.geojson`). | `json`, `geopandas`/`shapely` |
| `scripts/generate_descriptive_analysis.py` | Menghasilkan ringkasan statistik deskriptif mean, median, IQR, skewness, kurtosis per moda. | `pandas`, `scipy.stats` |

---

## 3. Strategi Modernisasi Menuju V2 Architecture

Sesuai instruksi Fase 2 dan 3:
1. **Frontend Modern:**
   * Dibangun dengan **Next.js 14/15 App Router + React + TypeScript + Tailwind CSS**.
   * Komponen UI menggunakan **shadcn/ui** untuk tampilan instansional yang restrained, bersih, elegan, dan tanpa *AI-slop*.
   * Chart engine dimigrasikan ke **Apache ECharts** (mendukung WebGL, interaktivitas tinggi, responsive auto-resize, tooltip dinamis, dan rendering time-series tanpa lag).
   * Peta spasial menggunakan **React Leaflet** atau integrasi ECharts GeoJSON choropleth yang melestarikan seluruh 1.214 simpul dan batas provinsi.
2. **Data & API Contract:**
   * Mempertahankan `data/mobility_data_bundle.json` sebagai sumber data otoritatif terpadu sehingga **TIDAK ADA SATUPUN ANGKA YANG BERUBAH ATAU FABRIKASI**.
   * Jika dijalankan secara standalone/statis untuk GitHub Pages (seperti deployment V1), V2 dapat di-export via `next build` (Static HTML Export `output: 'export'`) atau didukung oleh backend Python FastAPI jika user menginginkan runtime API dinamis.
   * Tetap menjaga seluruh skrip Python di `scripts/` agar bisa dieksekusi kapan saja bila ada pembaruan data mentah dari SIASATI Kemenhub.
