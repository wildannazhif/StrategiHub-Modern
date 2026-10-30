# LEGACY FEATURE INVENTORY (V1 COMPLETE AUDIT)
**StrategiHub Analytics 2026** — Kementerian Perhubungan RI  
**Audited Artifacts:** `index.html`, `data/mobility_data_bundle.json`, `scripts/`, `data/`

---

## 1. Navigasi & Struktur Tab (11 Modul Utama)

1. **Tab 1: Kronologi Harian (286 Hari)**
   * ID: `tab-timeline`
   * Komponen:
     * Header & KPI Utama: Total Penumpang YTD, Total Armada YTD, Rata-rata Harian, Puncak All-Time (24 Mar 2026), Puncak Mudik (18 Mar 2026).
     * Global Mode Selector: All, Udara, Kereta Api, Jalan (Bus), Penyeberangan (ASDP), Laut.
     * Metric & Direction Toggles: Penumpang (Total, Datang, Berangkat), Armada (Total, Datang, Berangkat).
     * Time-Range Presets: All (286H), T1 (Jan-Apr), T2 (Mei-Agu), T3 (Sep-Okt), Lebaran 2026, Custom Date Range.
     * Grafik Deret Waktu Utama (`chartTimelineCanvas`): Multi-line time series (5 moda + Total).
     * Workspace Pertumbuhan Provinsi (`chartProvinceGrowthCanvas`): Bar chart pertumbuhan bulanan per provinsi vs baseline.
     * Tabel Ringkasan Bulanan: Tabel rekap 10 bulan (Jan – Okt 2026) dengan subtotal dan kolom metrik interaktif.
     * Workspace Pola Hari Mingguan (Day-of-Week): Bar chart dan tabel 7 hari (Senin s/d Minggu) dengan indeks deviasi.

2. **Tab 2: Puncak Lebaran 2026 (H-8 s/d H+8)**
   * ID: `tab-lebaran`
   * Komponen:
     * Tanggal Acara: 13 – 29 Maret 2026 (Hari H: 21 Maret 2026).
     * Kalender Interaktif 17 Hari: H-8 s/d H+8 (klik tanggal untuk drilldown volume harian).
     * Grafik Komparasi H-8 s/d H+8 (`chartLebaranLineCanvas`): 5 garis moda + garis Total.
     * Heatmap Lonjakan Penumpang (`surge-heatmap-panel`): Gradasi warna merah muda hingga merah pekat per moda vs baseline.
     * Tabel Komparasi Detail Arus Mudik vs Balik 1 vs Balik 2 dengan angka riil dan persentase lonjakan.
     * Pangsa Pasar (*Modal Share*): Area chart stacked komposisi 5 moda selama Lebaran + Donut chart hari normal vs hari puncak.

3. **Tab 3: Kinerja Load Factor (Rasio Beban Armada)**
   * ID: `tab-load-factor`
   * Komponen:
     * Filter Wilayah: Dropdown 38 Provinsi + Opsi Nasional.
     * KPI Load Factor: Rasio Beban Normal (Februari), Rasio Beban Puncak (Lebaran), Persentase Lonjakan Kepadatan Fisik.
     * Grafik Kepadatan Fisik (`chartLoadFactorCanvas`): Bar chart komparasi pnp/armada per moda.
     * Tabel Deteksi Anomali Operasional: Daftar rute/simpul dengan rasio muatan ekstrem.

4. **Tab 4: Registri Simpul Transportasi (Top 30 Hubs)**
   * ID: `tab-top-hubs`
   * Komponen:
     * Filter Moda: Udara, KA, Jalan (Bus), ASDP, Laut.
     * Toggle Periode: Puncak Lebaran vs Akumulasi YTD.
     * Kolom Pencarian Simpul (*Live Search Filter*).
     * Tabel Top 30 Simpul: Rank, Nama Simpul, Provinsi, Tipe, Total Penumpang, Total Armada, Rasio Beban, Status Kesibukan.

5. **Tab 5: Matriks Rekapitulasi 13 Indikator**
   * ID: `tab-matrix`
   * Komponen:
     * Matriks cross-tabulation resmi 13 indikator Kemenhub:
       1. Penumpang Datang, 2. Penumpang Berangkat, 3. Total Penumpang, 4. Armada Datang, 5. Armada Berangkat, 6. Total Armada, 7. Rasio Beban Datang, 8. Rasio Beban Berangkat, 9. Rasio Beban Total, 10. Pangsa Penumpang (%), 11. Pangsa Armada (%), 12. Volume Puncak, 13. Tanggal Puncak.
     * Disajikan per moda (Udara, KA, Bus, ASDP, Laut) dan kolom agregat Nasional.

6. **Tab 6: Peta Spasial Simpul (Leaflet GIS)**
   * ID: `tab-spatial-map`
   * Komponen:
     * Peta interaktif Leaflet.js dengan basemap OpenStreetMap / CartoDB Positron & Dark Matter.
     * 1.214 Simpul Terdaftar (1.018 berkoordinat valid, 196 koordinat kosong terdata aman di audit).
     * Filter Marker per Moda dan Skala Metrik (Penumpang / Armada).
     * Lapisan Choropleth 38 Provinsi berbasis GeoJSON (`indonesia_38_provinces.geojson`).
     * Node Inspector Panel: Klik marker memunculkan kartu detail simpul, statistik harian, dan grafik ringkas.

7. **Tab 7: Proyeksi Mobilitas Nataru 2026/2027 (Horizon 100 Hari)**
   * ID: `tab-forecasting`
   * Komponen:
     * Model Algoritma: Holt-Winters Multiplicative Damped Trend ($\phi=0,98$) + Weekly Seasonality ($s=7$) + Nataru Calendar Shock.
     * 3 Skenario Proyeksi: Moderat (1,00x), Optimis (1,07x), Konservatif (0,95x).
     * Grafik Prediksi Time Series (`chartForecastCanvas`): Garis Aktual Historis 2025-2026 + Garis Proyeksi 100 Hari + Pita Interval Kepercayaan (95% CI).
     * Kartu Metrik Evaluasi: MAPE (4,1%), WAPE (4,02%), RMSE (62.051), MAE (49.146), Directional Accuracy (89,3%).
     * Tabel Proyeksi Harian 100 Hari dengan filter rentang (Semua, Q4, Nataru Window 18 Hari).
     * Modal Benchmark 11 Model Peramalan: Tabel komparasi performa 11 algoritma time series.

8. **Tab 8: Rekomendasi & Simulator Kapasitas Armada**
   * ID: `tab-rekomendasi`
   * Komponen:
     * 1.010 Simpul Transportasi Terkatalog (Bakauheni, Merak, Ketapang, Pasar Senen, Gambir, Ngurah Rai, Purabaya, dll).
     * Simulator Interaktif: Menghitung persentase penambahan armada kapal/pesawat/kereta/bus agar rasio beban hari puncak setara dengan hari normal.
     * Filter Status: Sangat Kritis (95-99%), Padat Tinggi/Siaga (85-94%), Sibuk Terkendali (65-84%), Stabil/Normal (<65%).
     * Pagination dan Pencarian Simpul.
     * Rekomendasi Aksi Lapangan Terstruktur (TBB, buffer zone, penambahan gerbong/flight/bus).

9. **Tab 9: Tentang Data & Kamus Rumus**
   * ID: `tab-tentang-data`
   * Komponen:
     * Kompendium formula matematis lengkap dengan KaTeX LaTeX rendering:
       - Rumus Load Factor ($LF = \frac{P}{A}$)
       - Rumus Modal Share ($MS_i = \frac{P_i}{\sum P}$)
       - Rumus Lebaran Surge Rate ($SR = \frac{P_{peak} - P_{base}}{P_{base}} \times 100\%$)
       - Rumus Holt-Winters Damped ($L_t, B_t, S_t, \hat{y}_{t+h}$)
       - Rumus Simulasi Penambahan Armada ($\Delta A = A_{puncak} \times (\frac{LF_{puncak}}{LF_{biasa}} - 1)$)
     * Glosarium terminologi, sumber data SIASATI PUSDATIN, dan catatan audit kualitas data.

10. **Tab 10: Peta Rute OD Interaktif (Origin-Destination)**
    * ID: `tab-od-map`
    * Komponen:
      * Iframe embed dari `peta_rute_od_interaktif.html` (atau alternatif `peta_rute_od_echarts.html`).
      * Visualisasi busur rute penerbangan domestik antarkota Indonesia dengan filter volume dan animasi arus.

11. **Tab 11: Diagram Sankey OD & Unduh Data CSV**
    * ID: `tab-od-sankey`
    * Komponen:
      * Iframe embed dari `sankey_diagram_od.html`.
      * Diagram alir pergerakan penumpang antar-pulau dan antarmoda.
      * Tombol ekspor dataset CSV resmi.
