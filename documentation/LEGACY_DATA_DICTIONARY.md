# LEGACY DATA DICTIONARY (KAMUS DATA KEMENHUB 2026)
**StrategiHub Analytics 2026** — Kementerian Perhubungan RI  
**Dataset Utama:** `data/siasati_multimoda_2026_clean_13okt.csv` & `data/mobility_data_bundle.json`

---

## 1. Skema Tabel Primer (`siasati_multimoda_2026_clean_13okt.csv`)
Total Baris: **221.999 baris**, 15 Kolom Standar:

| No | Nama Kolom | Tipe Data | Satuan | Deskripsi & Semantik Bisnis | Aturan Null / Anomali |
|:---:|:---|:---:|:---:|:---|:---|
| 1 | `tanggal` | String (YYYY-MM-DD) | Hari | Tanggal pelaporan operasional (2026-01-01 s/d 2026-10-13). | Tidak boleh null. Format ISO-8601. |
| 2 | `moda` | String (Categorical) | - | Moda transportasi: `UDARA`, `KA`, `BUS`, `ASDP`, `LAUT`. | Terstandarisasi 5 nilai unik. |
| 3 | `id_prasarana` | String / Integer | - | Kode unik simpul prasarana (stasiun, bandara, pelabuhan, terminal). | Dipertahankan sesuai feed hulu. |
| 4 | `nama_prasarana`| String | - | Nama resmi prasarana transportasi (misal: "Soekarno-Hatta", "Merak"). | Nama bersih, strip whitespace. |
| 5 | `provinsi` | String | - | Provinsi lokasi simpul (38 provinsi Indonesia). | Standar nama BPS/Kemendagri. |
| 6 | `tipe` | String | - | Klasifikasi tipe prasarana (Bandara, Terminal Tipe A, Stasiun KA, Pelabuhan). | Kategori subsektor. |
| 7 | `caturwulan` | String | - | Periode kuartal tahunan (`T1`, `T2`, `T3`). | T1 (Jan-Apr), T2 (Mei-Agu), T3 (Sep-Des). |
| 8 | `lat` | Float | Derajat | Koordinat lintang geografis WGS-84. | 1.018 valid, 196 kosong (`null/empty`). Jangan dipalsukan! |
| 9 | `lon` | Float | Derajat | Koordinat bujur geografis WGS-84. | Berpasangan dengan `lat`. |
| 10 | `penumpang_datang` | Integer | Orang | Volume penumpang yang tiba di simpul tersebut. | Nilai $\ge 0$. |
| 11 | `penumpang_berangkat` | Integer | Orang | Volume penumpang yang berangkat meninggalkan simpul. | Nilai $\ge 0$. *Catatan KA: gunakan `pnp_datang` untuk baseline riil.* |
| 12 | `armada_datang` | Integer | Trip | Frekuensi sarana/kendaraan datang (trip pesawat/bus/kapal/kereta). | Nilai $\ge 0$. |
| 13 | `armada_berangkat` | Integer | Trip | Frekuensi sarana/kendaraan berangkat. | Nilai $\ge 0$. |
| 14 | `total_penumpang` | Integer | Orang | Agregat dua arah: `penumpang_datang + penumpang_berangkat`. | Konsisten matematis. |
| 15 | `total_armada` | Integer | Trip | Agregat dua arah: `armada_datang + armada_berangkat`. | Konsisten matematis. |

---

## 2. Struktur Data Bundle JSON (`data/mobility_data_bundle.json`)

### A. `meta` (Objek Metadata Global)
* `total_clean_rows`: 221.999
* `total_passengers_ytd`: 391.356.870
* `total_armada_ytd`: 10.581.222
* `total_pnp_dat_ytd`: 171.039.623
* `total_pnp_brg_ytd`: 220.317.247
* `total_arm_dat_ytd`: 5.206.827
* `total_arm_brg_ytd`: 5.374.395
* `date_min`: "2026-01-01", `date_max`: "2026-10-13", `days_count`: 286
* `all_time_peak_date`: "2026-03-24", `all_time_peak_val`: 2.415.296, `all_time_peak_surge_pct`: 103.2
* `peak_mudik_date`: "2026-03-18", `peak_mudik_val`: 2.258.518, `peak_mudik_surge_pct`: 90.0
* `baseline_feb_avg`: 1.188.900
* `valid_latlon_count`: 1.018, `empty_latlon_count`: 196, `total_nodes_count`: 1.214

### B. `daily_timeline` (Array 286 Hari)
Setiap item mewakili 1 hari kalender:
* `date`: "YYYY-MM-DD"
* `UDARA`, `KA`, `BUS`, `ASDP`, `LAUT`: Masing-masing memiliki sub-objek:
  * `pnp_tot`, `pnp_dat`, `pnp_brg`, `arm_tot`, `arm_dat`, `arm_brg`
* `TOTAL`: Agregat kelima moda pada hari tersebut.

### C. `monthly_summary` (Array 10 Bulan)
* `month`: Integer (1 s/d 10)
* `month_name`: "Januari" s/d "Oktober"
* Breakdown per moda untuk total penumpang dan armada bulanan.

### D. `lebaran_daily` (Array 17 Hari Puncak H-8 s/d H+8)
* `date`: 2026-03-13 s/d 2026-03-29
* `h_tag`: "H-8", "H-7", ..., "Hari H" (2026-03-21), ..., "H+8"
* Volume harian dan rincian per moda.

### E. `surge_summary` (Objek Ringkasan Lonjakan per Moda)
* `baseline`: Volume rata-rata harian normal non-libur (Februari 2026).
* `peak_mudik`: Volume tertinggi fase mudik (H-8 s/d H-1).
* `surge_mudik_pct`: Persentase lonjakan arus mudik.
* `peak_balik1`: Volume tertinggi arus balik gelombang 1 (H+1 s/d H+4).
* `surge_balik1_pct`: Persentase lonjakan balik 1.
* `peak_balik2`: Volume tertinggi arus balik gelombang 2 (H+5 s/d H+8).
* `surge_balik2_pct`: Persentase lonjakan balik 2.

### F. `load_factor_stats` (Statistik Kepadatan Beban Sarana)
* `baseline_lf`: Rata-rata rasio $\frac{\text{penumpang}}{\text{armada}}$ di hari normal (Februari).
* `peak_lf`: Rasio tertinggi saat periode Lebaran.
* `surge_lf_pct`: Persentase lonjakan kepadatan fisik sarana.
* Disertai breakdown rinci per 38 provinsi di `by_province`.

### G. `forecast_nataru` (Proyeksi 100 Hari Nataru 2026/2027)
* `horizon_days`: 100 hari (2026-09-30 s/d 2027-01-07).
* `summaries`:
  * `moderat`: Skenario baseline ($1,00 \times$).
  * `optimis`: Skenario animo pariwisata tinggi ($1,07 \times$).
  * `konservatif`: Skenario mitigasi cuaca ekstrem ($0,95 \times$).
* `metrics`: Evaluasi performa model (MAPE 4,1%, RMSE 62.051, MAE 49.146, WAPE 4,02%, DirAcc 89,3%).
* `shock_factors`: Faktor kalender Natal 2026 dan Tahun Baru 2027 berbasis runtun waktu historis 2025.

### H. `simpul_recommendations` (Array 1.010 Simpul Prasarana)
* `id`: ID unik simpul (misal "simpul_1")
* `name`: Nama simpul (misal "Bakauheni", "Merak", "Pasar Senen")
* `prov`: Provinsi
* `moda`: Moda transportasi
* `pnpBiasa`, `armBiasa`: Volume dan armada hari biasa
* `pnpPuncak`, `armPuncak`: Volume dan armada hari puncak
* `lfBiasa`, `lfPuncak`: Rasio beban biasa vs puncak
* `loadRatio`: Rasio kenaikan kelipatan beban
* `pctTambah`: Persentase penambahan armada yang disimulasikan agar beban sama seperti hari biasa
* `addArm`: Jumlah penambahan trip armada rekomendasi
* `totalArm`: Total armada yang dibutuhkan saat puncak
* `statusText`: Kategori kesibukan ("Sangat Kritis", "Padat Tinggi", "Sibuk Terkendali", "Stabil/Normal")
* `fieldAction`: Standar Operasional Prosedur (SOP) aksi lapangan spesifik.
