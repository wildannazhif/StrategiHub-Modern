# OPERATIONAL RUNBOOK (V2 MODERNIZATION)
**Application:** StrategiHub Analytics 2026 V2  
**Target Repository:** `https://github.com/wildannazhif/strategihub-kemenhub-2026`

---

## 1. Persiapan Lingkungan & Instalasi

### Prasyarat Sistem:
* **Node.js:** Versi >= 18.18.0 (Direkomendasikan Node.js v20 atau v22)
* **npm:** Versi >= 9.x
* **Python:** Versi 3.10+ (untuk eksekusi pipeline pengolahan data mentah)

### Langkah Instalasi:
```bash
# Pindah ke direktori V2
cd v2

# Install seluruh dependensi Next.js, React, Tailwind, ECharts, Leaflet, dan KaTeX
npm install
```

---

## 2. Menjalankan di Mode Pengembangan (Development Mode)

```bash
cd v2
npm run dev
```
Buka peramban di: **`http://localhost:3000`**

Aplikasi mendukung *Hot Module Replacement (HMR)* dan akan langsung me-refresh tampilan saat kode komponen diubah.

---

## 3. Membangun & Menjalankan Mode Produksi (Production Build)

```bash
cd v2

# Membangun bundle produksi teroptimasi
npm run build

# Menjalankan server produksi
npm run start
```
Secara default berjalan di **`http://localhost:3000`**.  
Untuk menentukan port kustom:
```bash
npx next start -p 8080
```

---

## 4. Menjalankan Uji Verifikasi Paritas Otomatis (Playwright)

Untuk memastikan seluruh 11 tab berjalan lancar tanpa error konsol dan mengambil tangkapan layar verifikasi:
```bash
# Dari root repositori
python3 V2_DOCUMENTATION/verify_v2_playwright.py
```
Hasil tangkapan layar tersimpan di:  
📁 `V2_DOCUMENTATION/V2_SCREENSHOTS/`

---

## 5. Prosedur Ekspor Statis untuk GitHub Pages (Opsional)

Jika V2 hendak dipublikasikan langsung ke GitHub Pages sebagai situs web statis murni:
1. Tambahkan baris `output: 'export'` di file `v2/next.config.mjs`:
   ```javascript
   const nextConfig = {
     output: 'export',
     eslint: { ignoreDuringBuilds: true },
   };
   export default nextConfig;
   ```
2. Jalankan perintah build:
   ```bash
   npm run build
   ```
3. Folder `v2/out/` akan berisi seluruh aset HTML, CSS, dan JS statis yang siap di-deploy ke GitHub Pages.

---

## 6. Prosedur Rollback ke V1 (Kondisi Darurat)

Karena seluruh pengembangan V2 diisolasi secara ketat pada branch `v2-modernization`, implementasi V1 di branch `main` tetap 100% utuh dan tidak tersentuh:
```bash
# Kembali ke V1
git checkout main

# V1 tetap dapat diakses langsung via browser:
# Buka file index.html atau jalankan web server sederhana:
python3 -m http.server 8000
```
Tidak ada risiko kehilangan kode atau data V1.
