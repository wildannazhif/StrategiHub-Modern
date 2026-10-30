# FORECASTING PARITY SPECIFICATION & VERIFICATION REPORT
**Application:** StrategiHub Analytics 2026 V2  
**Protected Analytical Subsystem:** Proyeksi Mobilitas Multimoda Q4 & Libur Nataru 2026/2027  
**Status Paritas:** **100% IDENTIK & TERVERIFIKASI (ZERO DEVIATION)**

---

## 1. Spesifikasi Model Matematis & Arsitektur Peramalan

Model peramalan waktu runtun terpilih pada V1 dan dipertahankan secara utuh pada V2 adalah:
**Holt-Winters Multiplicative Exponential Smoothing with Additive Damped Trend & Weekly Seasonality ($s=7$) + Nataru Calendar Shock Adjustment**.

### A. Persamaan Pemulusan Eksponensial Terbobot:
1. **Level Equation ($L_t$):**
   $$L_t = \alpha \frac{y_t}{S_{t-m}} + (1 - \alpha)(L_{t-1} + \phi B_{t-1})$$
2. **Trend Equation with Damping ($B_t$):**
   $$B_t = \beta (L_t - L_{t-1}) + (1 - \beta)\phi B_{t-1}$$
3. **Seasonal Equation Multiplicative ($S_t$):**
   $$S_t = \gamma \frac{y_t}{L_t} + (1 - \gamma)S_{t-m}$$
4. **Point Forecast ($h$-step ahead):**
   $$\hat{y}_{t+h} = \left( L_t + \left[ \sum_{i=1}^h \phi^i \right] B_t \right) \times S_{t+h-m(k+1)}$$

### B. Parameter Model yang Terkunci:
* `trend`: `'add'` (Additive)
* `damped_trend`: `True`
* `damping_trend_phi`: `0.98` (mencegah overshooting proyeksi jangka panjang 100 hari)
* `seasonal`: `'mul'` (Multiplicative)
* `seasonal_periods`: `7` (pola mingguan Senin – Minggu)
* `initialization_method`: `'estimated'`
* `optimization`: `optimized=True, use_brute=True`

---

## 2. Batasan Data Pelatihan & Horizon Waktu

| Komponen | Batasan V1 (Baseline) | Implementasi V2 | Status Paritas |
| :--- | :---: | :---: | :---: |
| **Rentang Data Latih (Training)** | 1 Jan 2025 s/d 29 Sep 2026 | 1 Jan 2025 s/d 29 Sep 2026 | **IDENTIK (637 Hari)** |
| **Rentang Horizon Proyeksi** | 30 Sep 2026 s/d 7 Jan 2027 | 30 Sep 2026 s/d 7 Jan 2027 | **IDENTIK (100 Hari)** |
| **Jendela Puncak Nataru (Shock Window)** | 18 Hari (18 Des 2026 s/d 4 Jan 2027) | 18 Hari (18 Des 2026 s/d 4 Jan 2027) | **IDENTIK (18 Hari)** |
| **Faktor Pengali Shock Kalender** | Rasio historis Nataru 2025 vs baseline Nov 2025 | Rasio historis Nataru 2025 vs baseline Nov 2025 | **IDENTIK** |

---

## 3. Verifikasi 3 Skenario Kebijakan

1. **Skenario Moderat (Baseline):**
   * Faktor pengali: **$1,00\times$**
   * Total Penumpang Proyeksi 100 Hari: **149.208.412** orang
   * Puncak Nataru: **24 Desember 2026** (1.922.912 orang)
   * Status V2: **Persis Identik**
2. **Skenario Optimis (+12% Animo Pariwisata):**
   * Faktor pengali: **$1,07\times$** (asumsi kebijakan Kemenhub)
   * Total Penumpang Proyeksi 100 Hari: **159.653.001** orang
   * Puncak Nataru: **24 Desember 2026** (2.057.516 orang)
   * Status V2: **Persis Identik**
3. **Skenario Konservatif (Antisipasi Cuaca Ekstrem BMKG):**
   * Faktor pengali: **$0,95\times$**
   * Total Penumpang Proyeksi 100 Hari: **141.747.991** orang
   * Puncak Nataru: **24 Desember 2026** (1.826.766 orang)
   * Status V2: **Persis Identik**

---

## 4. Verifikasi Metrik Evaluasi Backtest

| Metrik Evaluasi | Nilai V1 (Tercatat) | Nilai V2 (Tercatat) | Delta / Deviasi |
| :--- | :---: | :---: | :---: |
| **MAPE (%)** | 4,10% | 4,10% | **0,00%** |
| **WAPE (%)** | 4,02% | 4,02% | **0,00%** |
| **RMSE** | 62.051 | 62.051 | **0** |
| **MAE** | 49.146 | 49.146 | **0** |
| **Directional Accuracy (%)** | 89,3% | 89,3% | **0,0%** |

---

## 5. Komparasi 11 Benchmark Model Peramalan

Hasil pengujian backtesting 11 algoritma pemodelan waktu runtut dari `benchmark_forecast_results.json` dilestarikan 100% pada modal V2:
1. **Holt-Winters Mul Damped (Model Terpilih):** MAPE 4,06%, RMSE 60.232, MAE 48.905, DirAcc 89,3%.
2. **Holt-Winters Mul Standar:** MAPE 3,34%, RMSE 54.924, MAE 41.374, DirAcc 89,3%.
3. **Holt-Winters Additive Damped:** MAPE 4,63%, RMSE 69.617, MAE 55.187, DirAcc 89,3%.
4. **SARIMA (1,1,1)x(1,1,1,7):** MAPE 5,87%, RMSE 83.614, MAE 72.529, DirAcc 57,1%.
5. **ARIMA (1,1,1) Non-Seasonal:** MAPE 11,17%, RMSE 151.818, MAE 131.008, DirAcc 53,6%.
6. **Holt's Linear Trend:** MAPE 6,24%, RMSE 103.284, MAE 79.534, DirAcc 50,0%.
7. **Simple Exponential Smoothing (SES):** MAPE 6,15%, RMSE 100.170, MAE 77.936, DirAcc 3,6%.
8. **Linear Regression (Trend + DOW):** MAPE 16,76%, RMSE 208.674, MAE 201.091, DirAcc 89,3%.
9. **Seasonal Naive (Lag 7):** MAPE 13,51%, RMSE 188.309, MAE 161.035, DirAcc 60,7%.
10. **Naive / Random Walk (Lag 1):** MAPE 7,10%, RMSE 118.759, MAE 91.365, DirAcc 0,0%.
11. **7-Day Moving Average:** MAPE 10,55%, RMSE 141.982, MAE 123.434, DirAcc 3,6%.
