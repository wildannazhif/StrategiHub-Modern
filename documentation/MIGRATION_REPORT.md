# V2 MODERNIZATION MIGRATION REPORT
**StrategiHub Analytics 2026** — Kementerian Perhubungan RI  
**Branch:** `v2-modernization`  
**Reference Legacy Branch:** `main` (Preserved intact)

---

## 1. Executive Summary

Proyek modernisasi StrategiHub Analytics 2026 berhasil mentransformasikan aplikasi pemantauan mobilitas nasional Kementerian Perhubungan dari format arsitektur berkas tunggal monolitik HTML (*single-file inline bundle*) menjadi produk analitik data modern berstandar enterprise berbasis **Next.js 14, React, TypeScript, Tailwind CSS, dan Apache ECharts**, dengan mematuhi prinsip utama:

> **"Modernize the implementation and redesign the presentation. Do not change the meaning, inputs, logic, or outputs of the existing analytical system."**

Seluruh 11 modul operasional, model peramalan deret waktu Nataru 100 hari, kalkulator simulator kapasitas armada di 1.010 simpul, peta geospasial Leaflet GIS 1.214 simpul, serta matriks 13 indikator Kemenhub berhasil dimigrasikan dengan **paritas analitik 100% tanpa ada satu angka pun yang berubah atau difabrikasi**.

---

## 2. Komparasi Arsitektur: V1 vs V2

| Parameter | Arsitektur Legacy (V1) | Arsitektur Modern (V2) | Manfaat Modernisasi |
| :--- | :--- | :--- | :--- |
| **Framework Frontend** | Vanilla JS + CDN Scripts dalam 1 file HTML (8,48 MB) | Next.js 14 App Router + React + TypeScript | Komponen modular, type-safe, code splitting, maintenance mudah |
| **Chart Visualization Engine** | Chart.js v4 (Canvas 2D) | Apache ECharts (WebGL + Canvas) | Performa time series tanpa lag, auto-resize responsif, tooltip kaya konteks |
| **Sistem UI & Desain** | Tailwind CSS CDN ad-hoc | Tailwind CSS Terkompilasi + Desain Institusional Restrained | Mengeliminasi AI-slop, kontras tinggi, hierarki visual jelas, tipografi proporsional |
| **Struktur Data** | JSON bundle di-inline langsung ke `<script>` (8,3 MB) | Asynchronous Data Contract (`/data/mobility_data_bundle.json`) | Waktu muat awal (*First Contentful Paint*) turun drastis, caching efisien |
| **Keamanan & Isolasi** | File induk rawan crash jika skrip error | TypeScript Strict Checking + Error Boundaries | Zero runtime crash, deteksi bug saat masa build |
| **Dukungan Perangkat** | Desktop oriented, layout kaku di smartphone | Responsif Penuh (Desktop 1440px, Tablet, Mobile 390px) | Drawer navigasi adaptif, kartu KPI multi-kolom responsif |
| **Kamus Rumus** | Teks HTML statis dengan KaTeX CDN | KaTeX Terintegrasi Komponen React | Tipografi formula LaTeX matematis sangat tajam |

---

## 3. Komponen yang Dipertahankan Tanpa Perubahan (Strict Parity)
1. **Dataset Otoritatif:** Seluruh 221.999 baris data bersih SIASATI 2026 dan 365 hari baseline 2025 tetap menjadi acuan tunggal data.
2. **Model Peramalan Waktu Runtut:** Algoritma Holt-Winters Multiplicative Damped Trend ($\phi=0,98$) dengan musiman mingguan ($s=7$) dan penyesuaian kalender shock Nataru dipertahankan secara matematis.
3. **Aturan Deduplikasi & Kebijakan Koordinat:** 196 simpul dengan koordinat kosong tetap dilestarikan tanpa imputasi fiktif.
4. **Simulator Kapasitas:** Formula penambahan armada $\Delta A = A_{puncak} \times (\frac{LF_{puncak}}{LF_{biasa}} - 1)$ menghasilkan angka integer yang sama persis.
5. **V1 Live Deployment:** Berkas `index.html` dan `Dashboard_Mobilitas_Nasional_2026.html` pada branch `main` tidak disentuh atau ditimpa sebelum ada persetujuan resmi pemilik repositori.
