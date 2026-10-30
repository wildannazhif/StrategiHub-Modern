# BACKEND & PIPELINE PARITY VERIFICATION
**Application:** StrategiHub Analytics 2026 V2  
**Scope:** Data Preprocessing, Cleaning Rules, Deduplication Logic, and Python Pipeline Preservation  
**Status Paritas:** **100% PRESERVED & FUNCTIONAL**

---

## 1. Pelestarian Dataset Sumber Otoritatif

Seluruh file data mentah dan data olahan dipertahankan tanpa modifikasi nilai:
1. `data/siasati_multimoda_2026_clean_13okt.csv` (**221.999 baris bersih**, 15 kolom).
2. `siasati_ringkasan_harian_multimoda_2025.csv` (**365 baris baseline 2025**).
3. `siasati_udara_2026.csv` (59.159 baris).
4. `siasati_ka_2026.csv` (49.219 baris).
5. `siasati_bus_2026.csv` (36.545 baris).
6. `siasati_asdp_2026.csv` (19.875 baris).
7. `siasati_laut_2026.csv` (46.563 baris).
8. `data/mobility_data_bundle.json` (**8.136.243 bytes**, kontrak distribusi data terpadu).

---

## 2. Aturan Bisnis & Deduplikasi Data (Data Cleansing Rules)

Aturan baku preprocessing Kemenhub V1 dilestarikan secara eksak:
* **Deduplikasi Identik:** Baris yang memiliki seluruh kolom sama persis dihapus redundansinya (`drop_duplicates()`). Terdapat 2 baris tercatat di `data_duplikat_sama_persis.csv`.
* **Deduplikasi Beda Nilai:** Baris yang memiliki `[tanggal, moda, id_prasarana]` sama namun berbeda nilai logbook diagregasikan dengan fungsi penjumlahan `sum()` pada kolom numerik (`armada_datang`, `penumpang_datang`, `armada_berangkat`, `penumpang_berangkat`). Terdapat 2.792 baris tercatat di `data_duplikat_biasa_beda_nilai.csv`.
* **Kebijakan Koordinat Kosong (Zero Data Loss):** Sebanyak 196 simpul dengan koordinat kosong (`null/empty`) **TIDAK DIBUANG DAN TIDAK DIISI KOORDINAT PALSU**. Seluruh simpul tersebut tetap masuk dalam agregasi volume nasional, tabel matriks, dan tercatat transparan di `daftar_prasarana_unik_lat_lon_kosong.csv`.

---

## 3. Skrip Analitik Python yang Tersedia & Teruji

Seluruh 40+ skrip di folder `scripts/` tetap utuh dan dapat dijalankan dengan Python runtime:
* `scripts/generate_nataru_forecast.py`: Menghasilkan peramalan 100 hari Nataru.
* `scripts/benchmark_all_models.py`: Menguji 11 model time series.
* `scripts/generate_simpul_recommendations.py`: Menghasilkan simulator kapasitas armada 1.010 simpul.
* `scripts/build_production_dashboard_sidebar.py`: Generator dashboard HTML V1 (tetap operasional jika ingin kompilasi ulang V1).
* `scripts/process_mobility_data_updated.py`: Pengolahan data harian multimoda.

---

## 4. Arsitektur Distribusi Kontrak Data V2

Pada V2, data didistribusikan melalui:
1. **Static Data Contract (Fast & Zero Overhead):**  
   File `v2/public/data/mobility_data_bundle.json` diload secara asinkron di browser melalui standard Fetch API dengan HTTP caching headers, menghilangkan overhead inlining 8.3 MB ke dalam satu file HTML dan memungkinkan rendering bertahap yang jauh lebih gegas.
2. **FastAPI Adapter Ready:**  
   Bila instansi membutuhkan endpoint REST API dinamis (misalnya `/api/v2/metrics`, `/api/v2/forecast`, `/api/v2/simpul`), fungsi-fungsi di `scripts/` dapat dibungkus langsung di balik controller FastAPI tanpa mengubah satu baris pun logika perhitungan matematika yang ada.
