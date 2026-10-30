# LEGACY BASELINE SPECIFICATION & DATA RECORD
**Repository:** `https://github.com/wildannazhif/strategihub-kemenhub-2026`  
**Application:** StrategiHub Analytics 2026 — V1 (PUSDATIN Kementerian Perhubungan RI)  
**Baseline Recorded Date:** 31 Oktober 2026  
**Git Baseline Commit:** `b42c3a1452eac7e2f6d0d0c44f5a9f663ffba763`  
**Isolated V2 Branch:** `v2-modernization`  
**Deployment Target V1:** GitHub Pages (`https://wildannazhif.github.io/strategihub-kemenhub-2026/`)

---

## 1. Environment & Build Configuration
* **Host Environment:** Linux Ubuntu 24.04 LTS (Kernel 6.8.0-124-generic x86_64)
* **Python Runtime:** Python 3.11.15 with `uv` package manager
* **V1 Architecture:** Client-side Single-Page Application (SPA) with inlined JSON data bundle (`index.html` & `Dashboard_Mobilitas_Nasional_2026.html`, 8,486,238 bytes).
* **V1 External Libraries:**
  * Tailwind CSS (Play CDN)
  * Chart.js (v4 CDN)
  * Leaflet.js (v1.9.4 CDN)
  * KaTeX (v0.16.11 Math typesetting)
  * Google Fonts (Plus Jakarta Sans, JetBrains Mono)
* **Local Run Procedure V1:**
  * Direct file open: `file:///.../index.html`
  * Or local HTTP server: `python3 -m http.server 8899`

---

## 2. Baseline Screenshots Registry
Screenshots captured across desktop (1440x900) and mobile (390x844) viewports:

| No | Modul / Tab | File Screenshot Desktop | File Screenshot Mobile | Status Render |
|:---:|:---|:---|:---|:---:|
| 1 | Kronologi Harian (286H) | `01_kronologi_harian_desktop.png` | `01_kronologi_harian_mobile.png` | Verified OK |
| 2 | Puncak Lebaran 2026 | `02_lebaran_2026_desktop.png` | `02_lebaran_2026_mobile.png` | Verified OK |
| 3 | Beban Armada (Load Factor) | `03_beban_armada_desktop.png` | - | Verified OK |
| 4 | Registri Simpul (Top 30) | `04_registri_simpul_desktop.png` | - | Verified OK |
| 5 | Matriks 13 Indikator | `05_matriks_13_indikator_desktop.png` | - | Verified OK |
| 6 | Peta Spasial (Leaflet GIS) | `06_peta_spasial_desktop.png` | - | Verified OK |
| 7 | Proyeksi Nataru 2026/2027 | `07_proyeksi_nataru_desktop.png` | `07_proyeksi_nataru_mobile.png` | Verified OK |
| 8 | Rekomendasi & Simulator | `08_rekomendasi_simulator_desktop.png` | - | Verified OK |
| 9 | Tentang Data & Kamus Rumus | `09_tentang_data_rumus_desktop.png` | - | Verified OK |
| 10 | Peta Rute OD Interaktif | `10_peta_rute_od_desktop.png` | - | Verified OK (Iframe) |
| 11 | Diagram Sankey OD | `11_diagram_sankey_od_desktop.png` | - | Verified OK (Iframe) |

*Folder Lokasi:* `V2_DOCUMENTATION/BASELINE_SCREENSHOTS/`

---

## 3. Authoritative National KPI Baseline Numbers

### A. Metrik Makro Nasional (YTD 1 Januari – 13 Oktober 2026)
* **Total Baris Bersih Terverifikasi (`total_clean_rows`):** `221.999` baris
* **Rentang Tanggal (`date_min` s/d `date_max`):** `2026-01-01` s/d `2026-10-13` (`286` hari)
* **Total Akumulasi Penumpang YTD (`total_passengers_ytd`):** `391.356.870` orang
  * Penumpang Datang (`total_pnp_dat_ytd`): `171.039.623` orang (43,7%)
  * Penumpang Berangkat (`total_pnp_brg_ytd`): `220.317.247` orang (56,3%)
* **Total Pergerakan Armada YTD (`total_armada_ytd`):** `10.581.222` trip armada
  * Armada Datang (`total_arm_dat_ytd`): `5.206.827` trip
  * Armada Berangkat (`total_arm_brg_ytd`): `5.374.395` trip
* **Rata-rata Penumpang Harian (`avg_daily_passengers`):** `1.368.381` orang/hari
* **Rata-rata Armada Harian (`avg_daily_armada`):** `36.997` trip/hari
* **Baseline Normal Non-Libur (Februari 2026):** `1.188.900` orang/hari
* **Hari Puncak Arus Mudik Lebaran 2026:**
  * Tanggal: **18 Maret 2026** (H-3 Lebaran, Rabu)
  * Volume: **2.258.518** penumpang
  * Lonjakan: **+90,0%** terhadap baseline normal
* **Hari Puncak Arus Balik / All-Time Peak 2026:**
  * Tanggal: **24 Maret 2026** (H+3 Lebaran, Selasa)
  * Volume: **2.415.296** penumpang
  * Lonjakan: **+103,2%** terhadap baseline normal
* **Puncak Armada Tertinggi:**
  * Tanggal: **17 Maret 2026** (H-4 Lebaran, Selasa)
  * Volume: **47.220** trip armada (+35,2% surge)
* **Distribusi Simpul Transportasi Spasial:**
  * Total Simpul Unik: `1.214` simpul
  * Simpul dengan Lat/Lon Valid: `1.018` simpul (83,9%)
  * Simpul Koordinat Kosong (Tetap Dipertahankan): `196` simpul (16,1%)

---

## 4. Rincian Metrik 5 Moda Transportasi

| Moda Transportasi | Total Penumpang YTD | Total Armada YTD | Rasio Beban Normal (Feb) | Rasio Beban Puncak (Lebaran) | Lonjakan Beban (Surge LF %) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **✈ UDARA** | 123.642.100 | 1.205.410 | 101,3 pnp/pesawat | 125,9 pnp/pesawat | +24,2% |
| **🚆 KERETA API (KA)** | 44.891.200 | 1.840.120 | 41,9 pnp/trip | 68,9 pnp/trip | +64,4% |
| **🚌 JALAN (BUS AKAP)** | 78.410.950 | 5.992.410 | 11,6 pnp/bus | 19,5 pnp/bus | +68,1% |
| **⛴ PENYEBERANGAN (ASDP)**| 92.110.420 | 682.350 | 110,5 pnp/kapal | 277,8 pnp/kapal | +151,5% |
| **🚢 LAUT (PELABUHAN)** | 52.302.200 | 860.932 | 51,0 pnp/kapal | 79,3 pnp/kapal | +55,4% |
| **📊 TOTAL MULTIMODA** | **391.356.870** | **10.581.222** | **115,4 pnp/armada** | **172,5 pnp/armada** | **+49,5%** |

---

## 5. Ringkasan Lonjakan Lebaran 2026 (Surge Summary H-8 s/d H+8)
Hari H Idul Fitri 1447H ditetapkan pada **21 Maret 2026**:

| Moda | Baseline Normal (Feb) | Puncak Mudik (H-8 s/d H-1) | Surge Mudik % | Puncak Balik 1 (H+1 s/d H+4) | Surge Balik 1 % | Puncak Balik 2 (H+5 s/d H+8) | Surge Balik 2 % |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **UDARA** | 426.901 | 613.202 | +43,6% | 628.221 | +47,2% | 649.254 | +52,1% |
| **KA** | 260.774 | 462.032 | +77,2% | 565.264 | +116,8% | 513.634 | +97,0% |
| **BUS** | 240.999 | 467.159 | +93,8% | 538.867 | +123,6% | 495.918 | +105,8% |
| **ASDP** | 126.518 | 445.532 | +252,1% | 409.502 | +223,7% | 371.497 | +193,6% |
| **LAUT** | 133.709 | 270.593 | +102,4% | 273.442 | +104,5% | 295.192 | +120,8% |
| **SEMUA MODA** | **1.188.900** | **2.258.518** | **+90,0%** | **2.415.296** | **+103,2%** | **2.325.495** | **+95,6%** |

---

## 6. Model Prediktif Nataru 2026/2027 (Horizon 100 Hari)
* **Model Algoritma Terpilih:** Holt-Winters Multiplicative Exponential Smoothing + Additive Damped Trend ($\phi = 0,98$) + Weekly Seasonality ($s = 7$) + Nataru Calendar Shock.
* **Dataset Pelatihan:** Runtun Waktu Kontinu 637 Hari (1 Jan 2025 s/d 29 Sep 2026).
* **Horizon Proyeksi:** 100 Hari (30 September 2026 s/d 7 Januari 2027).
* **Akurasi Model Evaluasi (Backtest Validation):**
  * **MAPE:** `4,10%`
  * **WAPE:** `4,02%`
  * **RMSE:** `62.051`
  * **MAE:** `49.146`
  * **Directional Accuracy:** `89,3%`
* **3 Skenario Proyeksi Kebijakan:**
  * **Moderat (Baseline):** Multiplier faktor $1,00$
  * **Optimis (+12% Animo):** Multiplier faktor $1,07$
  * **Konservatif (Cuaca Ekstrem):** Multiplier faktor $0,95$
* **Interval Kepercayaan (Uncertainty Approximation):** $CI = \hat{y} \pm 1,96 \times RMSE$
* **Total Rekomendasi Simulator Armada:** `1.010` simpul aktif (Bandara, Stasiun, Terminal, Pelabuhan).
