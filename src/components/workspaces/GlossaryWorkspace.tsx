'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Cpu,
  BarChart2,
  Calculator,
  Database,
  MapPin,
  Network,
  Layers,
  Award,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Users,
  Mail,
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaBlockProps {
  title: string;
  math: string;
  explanation: string;
  example?: string;
  badge?: string;
}

const FormulaBlock: React.FC<FormulaBlockProps> = ({ title, math, explanation, example, badge }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [math]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          {title}
        </h4>
        {badge && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {badge}
          </span>
        )}
      </div>
      <div className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg overflow-x-auto text-slate-900 dark:text-white">
        <div ref={containerRef} />
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{explanation}</p>
      {example && (
        <div className="text-[11px] font-mono text-slate-500 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
          <strong className="text-slate-700 dark:text-slate-300">Contoh / Kasus Riil:</strong> {example}
        </div>
      )}
    </div>
  );
};

export const GlossaryWorkspace: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('all');

  const SECTIONS = [
    { id: 'all', label: 'Semua Materi' },
    { id: 'sec-metrik', label: '1. Metrik Dasar & Filter' },
    { id: 'sec-load-factor', label: '2. Load Factor & Okupansi' },
    { id: 'sec-lebaran', label: '3. Arus Lebaran & Surge' },
    { id: 'sec-forecasting-models', label: '4. 12 Model Peramalan' },
    { id: 'sec-ml-features', label: '5. Rekayasa 13 Fitur ML' },
    { id: 'sec-akurasi', label: '6. Evaluasi Akurasi' },
    { id: 'sec-simulator', label: '7. Rekomendasi Armada' },
    { id: 'sec-gis-od', label: '8. Geospasial & OD' },
    { id: 'sec-audit', label: '9. Audit Data & Glosarium' },
    { id: 'sec-credits', label: '10. Credit Pembuat Dashboard' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. HEADER UTAMA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Tentang Data, Kamus Formula Matematis & Dokumentasi Model Dashboard
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dokumentasi komprehensif seluruh indikator, formulasi matematis, arsitektur 12 model peramalan, metodologi train-test holdout, dan audit kualitas data operasional PUSDATIN Kemenhub.
            </p>
          </div>
        </div>

        {/* QUICK NAV PILLS */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-slate-400 mr-1 flex-shrink-0 font-semibold text-[11px]">Navigasi Cepat:</span>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors border ${
                activeSection === sec.id
                  ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: METRIK DASAR & MASTER FILTER */}
      {(activeSection === 'all' || activeSection === 'sec-metrik') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              1. Metrik Operasional Dasar & Permutasi Filter Dashboard
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormulaBlock
              title="Total Mobilitas Penumpang & Armada"
              math="P_{\text{tot}} = P_{\text{datang}} + P_{\text{berangkat}}, \quad A_{\text{tot}} = A_{\text{datang}} + A_{\text{berangkat}}"
              explanation="Menghitung akumulasi pergerakan orang dan trip sarana kendaraan. Dashboard menyediakan toggle arah Berangkat, Datang, dan Total Dua Arah."
              example="Akumulasi YTD 2026: 220,3 Juta Berangkat + 171,0 Juta Datang = 391,35 Juta Penumpang Dua Arah (10,58 Juta Trip Armada)."
              badge="Overview & KPI"
            />

            <FormulaBlock
              title="Pangsa Pasar Antarmoda (Modal Share %)"
              math="MS_m = \left( \frac{P_m}{\sum_{k=1}^{5} P_k} \right) \times 100\%"
              explanation="Proporsi kontribusi volume moda ke-m (Udara, KA, Bus, ASDP, Laut) terhadap total mobilitas nasional. Dihitung dinamis mengikuti arah filter aktif."
              example="Pangsa YTD 2026: Udara (31,6%), Kereta Api (28,8%), Bus (23,1%), ASDP Penyeberangan (10,3%), Laut (6,2%)."
              badge="Modal Share"
            />

            <FormulaBlock
              title="Rata-rata Harian & Baseline Normal Februari"
              math="\bar{P}_{\text{harian}} = \frac{1}{N} \sum_{t=1}^{N} P_t, \quad P_{\text{baseline}} = \frac{1}{28} \sum_{t \in \text{Feb 2026}} P_t"
              explanation="Bulan Februari 2026 (28 hari) ditetapkan sebagai baseline operasional resmi karena tidak memiliki libur panjang nasional (kondisi kerja stabil)."
              example="Baseline Februari 2026: 1.188.900 orang/hari (Dua Arah) atau 652.504 orang/hari (Keberangkatan)."
              badge="Baseline Kalender"
            />

            <FormulaBlock
              title="Sistem Sinkronisasi 6 Permutasi Filter"
              math="\mathcal{P} \in \{P, A\} \times \{\text{Berangkat}, \text{Datang}, \text{Total}\}"
              explanation="Filter terpadu di bagian atas dashboard mengontrol 6 permutasi data secara serentak ke KPI, Tren Harian, Tren Bulanan Provinsi, dan Monitoring Lebaran tanpa tumpukan tombol duplikat."
              example="Beralih dari 'Penumpang Berangkat' ke 'Armada Datang' seketika mengganti skala data dan satuan dari 'orang' ke 'trip'."
              badge="Filter Analitik"
            />
          </div>
        </div>
      )}

      {/* SECTION 2: LOAD FACTOR & RASIO OKUPANSI */}
      {(activeSection === 'all' || activeSection === 'sec-load-factor') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-amber-600 pl-3">
            <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              2. Kinerja Load Factor (Rasio Okupansi Armada per Trip)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormulaBlock
              title="Rasio Okupansi Fisik (Load Factor Proxy)"
              math="LF = \frac{P}{A} = \frac{\text{Volume Penumpang}}{\text{Jumlah Trip Armada}} \quad (\text{satuan: pnp/trip})"
              explanation="Mengukur tingkat keterisian sarana per satu kali trip perjalanan. Menjadi indikator utama deteksi kepadatan (*overcrowding*) sarana di simpul transportasi."
              example="Pelabuhan ASDP Merak: 115.459 penumpang / 130 trip kapal feri = 888,1 pnp/trip saat puncak mudik Lebaran."
              badge="Load Factor"
            />

            <FormulaBlock
              title="Rasio Okupansi Berdasarkan Arah Mobilitas"
              math="LF_{\text{brg}} = \frac{P_{\text{brg}}}{A_{\text{brg}}}, \quad LF_{\text{dat}} = \frac{P_{\text{dat}}}{A_{\text{dat}}}, \quad LF_{\text{tot}} = \frac{P_{\text{tot}}}{A_{\text{tot}}}"
              explanation="Dihitung secara terpisah antara arah arus keberangkatan dan kedatangan untuk mendeteksi ketimpangan beban arah (*directional imbalance*) saat musim mudik."
              example="Saat Arus Mudik H-3: LF Keberangkatan Udara melonjak ke 124,8 pnp/trip, sementara LF Kedatangan berada di 98,2 pnp/trip."
              badge="Directional Balance"
            />
          </div>
        </div>
      )}

      {/* SECTION 3: ARUS LEBARAN & SURGE ANALYSIS */}
      {(activeSection === 'all' || activeSection === 'sec-lebaran') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              3. Monitoring Khusus Angkutan Lebaran 2026 (1447H) & Surge Analysis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormulaBlock
              title="Persentase Lonjakan Volume (Surge Rate %)"
              math="\text{Surge} = \left( \frac{P_{\text{peak}} - P_{\text{baseline}}}{P_{\text{baseline}}} \right) \times 100\%"
              explanation="Mengukur kelipatan lonjakan permintaan mobilitas pada hari puncak terhadap rata-rata hari normal Februari 2026."
              example="Puncak Arus Balik H+3 (24 Mar 2026): (2.415.296 - 1.188.900) / 1.188.900 × 100% = +103,2% (Nasional Dua Arah)."
              badge="Surge %"
            />

            <FormulaBlock
              title="Rentang Pemantauan Posko 17 Hari Lebaran"
              math="T_{\text{Lebaran}} = \{H-8, H-7, \dots, H-1, \text{Hari-H}, H+1, \dots, H+8\}"
              explanation="Periode evaluasi resmi posko Kemenhub selama 17 hari kalender (13 Maret s.d. 29 Maret 2026). Mencakup fase arus mudik, hari raya, dan fase arus balik."
              example="Puncak Mudik terjadi pada H-3 (18 Mar: 2.258.518 pnp) dan Rekor Arus Balik pada H+3 (24 Mar: 2.415.296 pnp)."
              badge="Posko 17 Hari"
            />
          </div>
        </div>
      )}

      {/* SECTION 4: 12 MODEL PERAMALAN (+LIGHTGBM MODEL TERBAIK) */}
      {(activeSection === 'all' || activeSection === 'sec-forecasting-models') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-l-4 border-indigo-600 pl-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                4. Dokumentasi Lengkap 12 Model Peramalan
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              🏆 Model Terbaik: LightGBM Regressor (MAPE 2,86% Nataru • 3,15% Lebaran)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. LIGHTGBM REGRESSOR */}
            <FormulaBlock
              title="1. LightGBM Regressor (Model Terbaik • 13 Fitur Terstandarisasi)"
              math="\hat{y}_t^{(M)} = \hat{y}_t^{(0)} + \sum_{m=1}^{M} \eta f_m(\mathbf{x}_t), \quad \min_{f} \sum_{t} |y_t - \hat{y}_t| + \lambda \Omega(f)"
              explanation="Model Machine Learning berbasis Gradient Boosted Decision Trees (GBDT) dengan fungsi objektif L1 (MAE loss). Dilatih menggunakan 13 fitur terstandarisasi: 4 fitur kalender (DOW, day, month, weekend), 3 fitur tanggal merah kalender Indonesia resmi SKB 3 Menteri (is_holiday, is_tanggal_merah, is_holiday_start penanda awal mudik/libur), 4 lag historis (lag 1, 2, 7, 14), dan 2 rolling window (mean 7H, std 7H)."
              example="Hasil Evaluasi Empiris: MAPE 2,86% (Nataru) dan 3,15% (Lebaran), RMSE 32.884, Akurasi Arah 89,3%. Fitur tanggal merah di awal terbukti menangkap lonjakan arus mudik orang-orang pulang kampung."
              badge="Rank 1 • Model Terbaik"
            />

            {/* 2. HOLT-WINTERS MUL DAMPED */}
            <FormulaBlock
              title="2. Holt-Winters Multiplicative Damped Trend (phi=0.98)"
              math="\hat{y}_{t+h} = \left( \ell_t + \left[ \sum_{i=1}^h \phi^i \right] b_t \right) \times s_{t+h-m(k+1)} \times \prod W_{\text{shock}}"
              explanation="Pemulusan eksponensial tripel dengan faktor redaman tren phi=0,98 untuk mencegah lonjakan tren divergen pada horizon 100 hari, dipadukan siklus musiman mingguan (s=7) dan kalibrasi shock Nataru."
              example="Hasil Uji: MAPE 4,10%, RMSE 62.051, MAE 49.146, Akurasi Arah 89,3%."
              badge="Rank 3 • Alternatif Kuat"
            />

            {/* 3. HOLT-WINTERS MUL STANDAR */}
            <FormulaBlock
              title="3. Holt-Winters Multiplicative Standar (No Damping)"
              math="\hat{y}_{t+h} = (\ell_t + h \cdot b_t) \times s_{t+h-m(k+1)}"
              explanation="Model Holt-Winters multiplikatif klasik tanpa faktor redaman tren. Akurat untuk horizon pendek, namun rawan overshooting linier pada horizon 100 hari."
              example="Hasil Uji: MAPE 3,80%, RMSE 63.185, MAE 47.535, Akurasi Arah 89,3%."
              badge="Rank 2 • Alternatif"
            />

            {/* 4. HOLT-WINTERS ADD DAMPED */}
            <FormulaBlock
              title="4. Holt-Winters Additive Damped"
              math="\hat{y}_{t+h} = \ell_t + \left[ \sum_{i=1}^h \phi^i \right] b_t + s_{t+h-m(k+1)}"
              explanation="Model Holt-Winters dengan komponen musiman aditif (besaran lonjakan bernilai konstan absolut, bukan persentase kelipatan volume)."
              example="Hasil Uji: MAPE 4,15%, RMSE 63.601, MAE 49.672, Akurasi Arah 89,3%."
              badge="Rank 4 • Alternatif"
            />

            {/* 5. SARIMA */}
            <FormulaBlock
              title="5. SARIMA (1,1,1) x (1,1,1,7)"
              math="\Phi_1(B^7)\phi_1(B)(1-B)(1-B^7) y_t = \Theta_1(B^7)\theta_1(B)\varepsilon_t"
              explanation="Seasonal AutoRegressive Integrated Moving Average dengan diferensiasi non-musiman d=1 dan musiman mingguan D=1 (periode s=7)."
              example="Hasil Uji: MAPE 5,87%, RMSE 83.614, MAE 72.529, Akurasi Arah 57,1%."
              badge="Rank 5 • Alternatif"
            />

            {/* 6. SIMPLE EXPONENTIAL SMOOTHING */}
            <FormulaBlock
              title="6. Simple Exponential Smoothing (SES)"
              math="\hat{y}_{t+h} = \ell_t = \alpha y_t + (1-\alpha)\ell_{t-1}"
              explanation="Pemulusan eksponensial tunggal tanpa tren dan tanpa musiman; menghasilkan garis proyeksi mendatar (flat baseline). Digunakan sebagai baseline batas bawah."
              example="Hasil Uji: MAPE 6,14%, RMSE 99.790, MAE 77.797, Akurasi Arah 3,6%."
              badge="Rank 6 • Baseline"
            />

            {/* 7. NAIVE RANDOM WALK */}
            <FormulaBlock
              title="7. Naive / Random Walk (Lag 1)"
              math="\hat{y}_{t+h} = y_t"
              explanation="Memproyeksikan persis nilai realisasi hari terakhir pengamatan secara statis ke seluruh horizon masa depan."
              example="Hasil Uji: MAPE 7,10%, RMSE 118.759, MAE 91.365, Akurasi Arah 0,0%."
              badge="Rank 7 • Baseline Acuan"
            />

            {/* 8. HOLT'S LINEAR TREND */}
            <FormulaBlock
              title="8. Holt's Linear Trend (Double Exp Smoothing)"
              math="\ell_t = \alpha y_t + (1-\alpha)(\ell_{t-1}+b_{t-1}), \quad \hat{y}_{t+h} = \ell_t + h \cdot b_t"
              explanation="Pemulusan eksponensial ganda yang memodelkan tren linier berkelanjutan tanpa siklus musiman mingguan."
              example="Hasil Uji: MAPE 8,86%, RMSE 143.307, MAE 113.258, Akurasi Arah 50,0%."
              badge="Rank 8 • Alternatif"
            />

            {/* 9. SEASONAL NAIVE */}
            <FormulaBlock
              title="9. Seasonal Naive (Lag 7)"
              math="\hat{y}_{t+h} = y_{t+h - 7k}, \quad k = \lfloor (h-1)/7 \rfloor + 1"
              explanation="Mengulang persis pola pergerakan 7 hari terakhir (hari Senin mengikuti Senin lalu, Minggu mengikuti Minggu lalu) tanpa estimasi parameter."
              example="Hasil Uji: MAPE 9,17%, RMSE 134.838, MAE 109.005, Akurasi Arah 75,0%."
              badge="Rank 9 • Baseline Siklus"
            />

            {/* 10. 7-DAY MOVING AVERAGE */}
            <FormulaBlock
              title="10. 7-Day Moving Average (MA7)"
              math="\hat{y}_{t+h} = \frac{1}{7} \sum_{i=0}^{6} y_{t-i}"
              explanation="Meramalkan masa depan menggunakan nilai rata-rata bergerak 7 hari terakhir untuk meratakan fluktuasi acak harian."
              example="Hasil Uji: MAPE 10,55%, RMSE 141.982, MAE 123.434, Akurasi Arah 3,6%."
              badge="Rank 10 • Baseline MA"
            />

            {/* 11. ARIMA NON-SEASONAL */}
            <FormulaBlock
              title="11. ARIMA (1,1,1) Non-Seasonal"
              math="(1 - \phi_1 B)(1 - B) y_t = c + (1 + \theta_1 B)\varepsilon_t"
              explanation="Model autoregresif terintegrasi bergerak linear tanpa memasukkan siklus mingguan 7 hari."
              example="Hasil Uji: MAPE 11,17%, RMSE 151.818, MAE 131.008, Akurasi Arah 53,6%."
              badge="Rank 11 • Tidak Disarankan"
            />

            {/* 12. LINEAR REGRESSION */}
            <FormulaBlock
              title="12. Linear Regression (Trend + DOW Dummy)"
              math="y_t = \beta_0 + \beta_t \cdot t + \sum_{j=1}^{6} \beta_j \cdot \text{DOW}_{j,t} + \varepsilon_t"
              explanation="Regresi linier Ordinary Least Squares (OLS) berbasis indeks waktu dan variabel boneka hari (Senin s.d. Minggu). Rentan deviasi besar pada event shock."
              example="Hasil Uji: MAPE 16,76%, RMSE 208.674, MAE 201.091, Akurasi Arah 89,3%."
              badge="Rank 12 • Tidak Disarankan"
            />
          </div>
        </div>
      )}

      {/* SECTION 5: REKAYASA FITUR MACHINE LEARNING (13 FITUR TERSTANDARISASI) */}
      {(activeSection === 'all' || activeSection === 'sec-ml-features' || activeSection === 'sec-forecasting-models') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-l-4 border-indigo-600 pl-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                5. Rekayasa Fitur Machine Learning (13 Fitur Terstandarisasi LightGBM)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              100% Direct-Trained 38 Provinsi & 5 Moda (1.035H)
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-2xs space-y-5">
            {/* Overview & Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-1.5">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Mengapa LightGBM Mengungguli Model Klasik?
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Model statistik univariat klasik (ARIMA, Holt-Winters) hanya mengamati deret angka historis dirinya sendiri secara terisolasi. LightGBM mengombinasikan inersia autoregresif dengan <strong>variabel eksogen kalender nasional resmi SKB 3 Menteri</strong>, memungkinkan pohon regresi membedakan hari kerja biasa dengan hari libur nasional.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-1.5">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Peran Kritis Fitur Tanggal Merah & Mudik
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Masyarakat Indonesia tidak menunggu hari H libur untuk bepergian. Fitur pemicu mudik <strong><code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded text-emerald-800 dark:text-emerald-300 font-mono">is_holiday_start</code></strong> secara khusus mendeteksi hari pertama klaster libur atau 1 hari menjelang tanggal merah (H-1). Ini memangkas galat MAPE Nataru dari 3,30% ke <strong>2,86%</strong> dan RMSE dari 59.271 ke <strong>32.884 pnp/hari</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  Integritas Bebas Kebocoran (Zero Leakage)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Seluruh fitur statistik jendela bergerak (<em>rolling mean</em> dan <em>rolling std</em>) serta fitur lag dihitung secara ketat menggunakan pergeseran <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">.shift(1)</code>. Model tidak pernah mengintip data masa depan pada saat proses pelatihan maupun peramalan rekursif multi-langkah.
                </p>
              </div>
            </div>

            {/* TABEL 13 FITUR LENGKAP */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Matriks 13 Fitur Terstandarisasi LightGBM
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  Total: 13 Input Features • Objective: regression_l1 (MAE Loss)
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 font-mono text-[10.5px] text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-2.5 w-8">#</th>
                      <th className="py-2.5 px-2.5">Variabel &amp; Tipe</th>
                      <th className="py-2.5 px-2.5">Kategori</th>
                      <th className="py-2.5 px-2.5">Formulasi</th>
                      <th className="py-2.5 px-2.5">Peran &amp; Dampak Prediksi</th>
                      <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Split Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                    {/* GROUP 1: KALENDER DASAR */}
                    <tr className="bg-indigo-50/20 dark:bg-indigo-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-indigo-600">1</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">dow</div>
                        <div className="text-[10px] font-mono text-slate-400">Int [0–6]</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold whitespace-nowrap inline-block">Kalender Siklus</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">dt.dayofweek</td>
                      <td className="py-2 px-2.5">Menangkap variasi hari kerja vs akhir pekan dalam siklus 7 hari.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-600 whitespace-nowrap">#2 (214)</td>
                    </tr>
                    <tr className="bg-indigo-50/20 dark:bg-indigo-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-indigo-600">2</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">day</div>
                        <div className="text-[10px] font-mono text-slate-400">Int [1–31]</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold whitespace-nowrap inline-block">Kalender Tanggal</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">dt.day</td>
                      <td className="py-2 px-2.5">Menangkap dinamika awal bulan (gajian) vs akhir bulan.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-500 whitespace-nowrap">#7 (178)</td>
                    </tr>
                    <tr className="bg-indigo-50/20 dark:bg-indigo-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-indigo-600">3</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">month</div>
                        <div className="text-[10px] font-mono text-slate-400">Int [1–12]</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold whitespace-nowrap inline-block">Kalender Makro</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">dt.month</td>
                      <td className="py-2 px-2.5">Menangkap tren musiman semesteran dan liburan sekolah Juni–Juli.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-500 whitespace-nowrap">#9 (85)</td>
                    </tr>
                    <tr className="bg-indigo-50/20 dark:bg-indigo-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-indigo-600">4</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">is_weekend</div>
                        <div className="text-[10px] font-mono text-slate-400">Bin [0/1]</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold whitespace-nowrap inline-block">Kalender Biner</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">1 if dow in [5,6]</td>
                      <td className="py-2 px-2.5">Penanda percepatan perjalanan rekreasi dan lonjakan akhir pekan.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-400 whitespace-nowrap">Baseline</td>
                    </tr>

                    {/* GROUP 2: TANGGAL MERAH SKB 3 MENTERI */}
                    <tr className="bg-rose-50/30 dark:bg-rose-950/20">
                      <td className="py-2 px-2.5 font-mono font-bold text-rose-600">5</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-rose-700 dark:text-rose-400">is_holiday</div>
                        <div className="text-[10px] font-mono text-slate-400">Bin [0/1]</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-semibold whitespace-nowrap inline-block">SKB 3 Menteri</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">t in Libur Nasional</td>
                      <td className="py-2 px-2.5">Menandai hari libur resmi keagamaan &amp; cuti bersama (98 tanggal).</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-rose-600 whitespace-nowrap">16 split</td>
                    </tr>
                    <tr className="bg-rose-50/30 dark:bg-rose-950/20">
                      <td className="py-2 px-2.5 font-mono font-bold text-rose-600">6</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-rose-700 dark:text-rose-400">is_tanggal_merah</div>
                        <div className="text-[10px] font-mono text-slate-400">Bin [0/1]</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-semibold whitespace-nowrap inline-block">Tanggal Merah</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">is_hol | is_wknd</td>
                      <td className="py-2 px-2.5">Menandai seluruh hari non-kerja resmi di kalender nasional Indonesia.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-rose-600 whitespace-nowrap">12 split</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/30">
                      <td className="py-2 px-2.5 font-mono font-bold text-rose-600">7</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-rose-600 dark:text-rose-300">is_holiday_start ★</div>
                        <div className="text-[10px] font-mono text-slate-400">Bin [0/1]</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold whitespace-nowrap inline-block">Pemicu Mudik</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">(red_t &amp; !red_t-1) | (!red_t &amp; red_t+1)</td>
                      <td className="py-2 px-2.5"><strong>Triger Arus Mudik</strong>: Menangkap keberangkatan awal pulang kampung sebelum hari H (H-3/H-2 Lebaran &amp; H-1 Natal).</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-amber-600 whitespace-nowrap">#10 (51)</td>
                    </tr>

                    {/* GROUP 3: AUTOKORELASI LAG */}
                    <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-emerald-600">8</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">lag_1</div>
                        <div className="text-[10px] font-mono text-slate-400">Float (y_t-1)</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold whitespace-nowrap inline-block">Inersia H-1</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">y.shift(1)</td>
                      <td className="py-2 px-2.5"><strong>Fitur Terpenting</strong>: Menjadi jangkar level volume harian terkini.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-600 whitespace-nowrap">#1 (330)</td>
                    </tr>
                    <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-emerald-600">9</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">lag_2</div>
                        <div className="text-[10px] font-mono text-slate-400">Float (y_t-2)</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold whitespace-nowrap inline-block">Momentum</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">y.shift(2)</td>
                      <td className="py-2 px-2.5">Mengonfirmasi percepatan atau perlambatan tren 2 hari terakhir.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-500 whitespace-nowrap">#8 (155)</td>
                    </tr>
                    <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-emerald-600">10</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">lag_7</div>
                        <div className="text-[10px] font-mono text-slate-400">Float (y_t-7)</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold whitespace-nowrap inline-block">Siklus 7H</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">y.shift(7)</td>
                      <td className="py-2 px-2.5">Menjaga kepatuhan ritme hari yang sama pekan lalu (Senin ke Senin).</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-600 whitespace-nowrap">#5 (181)</td>
                    </tr>
                    <tr className="bg-emerald-50/20 dark:bg-emerald-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-emerald-600">11</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">lag_14</div>
                        <div className="text-[10px] font-mono text-slate-400">Float (y_t-14)</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold whitespace-nowrap inline-block">Inersia 2W</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">y.shift(14)</td>
                      <td className="py-2 px-2.5">Memvalidasi konsistensi tren multi-minggu pada horizon panjang.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-600 whitespace-nowrap">#3 (212)</td>
                    </tr>

                    {/* GROUP 4: ROLLING STATS */}
                    <tr className="bg-purple-50/20 dark:bg-purple-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-purple-600">12</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">rolling_mean_7</div>
                        <div className="text-[10px] font-mono text-slate-400">Float64</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-semibold whitespace-nowrap inline-block">Rerata 7H</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">shift(1).roll(7).mean()</td>
                      <td className="py-2 px-2.5">Baseline tren halus terkini tanpa data leakage untuk deteksi deviasi.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-500 whitespace-nowrap">#6 (179)</td>
                    </tr>
                    <tr className="bg-purple-50/20 dark:bg-purple-950/10">
                      <td className="py-2 px-2.5 font-mono font-bold text-purple-600">13</td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">rolling_std_7</div>
                        <div className="text-[10px] font-mono text-slate-400">Float64</div>
                      </td>
                      <td className="py-2 px-2.5"><span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-semibold whitespace-nowrap inline-block">Volatilitas 7H</span></td>
                      <td className="py-2 px-2.5 font-mono text-[10.5px]">shift(1).roll(7).std()</td>
                      <td className="py-2 px-2.5">Mengukur dispersi harian; mendeteksi transisi menuju fase posko padat.</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-600 whitespace-nowrap">#4 (187)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* HYPERPARAMETER SETTING BOX */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300">Hyperparameter Seragam:</span>
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400">objective=&apos;regression_l1&apos;</code>
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">lr=0.04</code>
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">num_leaves=11</code>
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">n_est=180</code>
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">min_child_samples=5</code>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Sumber Kalender: SKB 3 Menteri 2024–2027 (98 Hari Terverifikasi)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: METRIK AKURASI & METODOLOGI VALIDASI PARTISI */}
      {(activeSection === 'all' || activeSection === 'sec-akurasi' || activeSection === 'sec-forecasting-models') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-rose-600 pl-3">
            <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              6. Formula Metrik Akurasi & Metodologi Validasi Partisi (Train-Test-Retrain)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormulaBlock
              title="MAPE (Mean Absolute Percentage Error)"
              math="\text{MAPE} = \frac{100\%}{n} \sum_{t=1}^{n} \left| \frac{y_t - \hat{y}_t}{y_t} \right|"
              explanation="Metrik evaluasi utama turnamen. Mengukur persentase rata-rata deviasi kesalahan ramalan terhadap realisasi riil lapangan."
              example="Akurasi LightGBM 13 Fitur: 2,86% Nataru & 3,15% Lebaran (Kategori Presisi Sangat Tinggi / Superior di bawah 5%)."
              badge="Metrik Utama"
            />

            <FormulaBlock
              title="RMSE (Root Mean Squared Error)"
              math="\text{RMSE} = \sqrt{\frac{1}{n} \sum_{t=1}^{n} (y_t - \hat{y}_t)^2}"
              explanation="Mengukur standar deviasi galat dalam satuan riil (orang/hari atau trip/hari). Memberikan penalti kuadratik yang lebih berat terhadap kesalahan tebakan ekstrem."
              example="RMSE LightGBM 13 Fitur: 32.884 orang/hari (berkurang 44,5% dari model 10 fitur lama yang 59.271 pnp/hari)."
              badge="Penalti Kuadratik"
            />

            <FormulaBlock
              title="WAPE & MAE"
              math="\text{WAPE} = \frac{\sum |y_t - \hat{y}_t|}{\sum y_t} \times 100\%, \quad \text{MAE} = \frac{1}{n} \sum_{t=1}^{n} |y_t - \hat{y}_t|"
              explanation="WAPE mengukur persentase kesalahan terbobot volume untuk mencegah bias pada hari bervolume rendah. MAE mengukur rerata kesalahan absolut harian."
              example="WAPE LightGBM: 3,24% (10-fitur) / 3,88% (13-fitur keberangkatan) | MAE: 27.194 orang/hari."
              badge="Bobot Volume"
            />

            <FormulaBlock
              title="Akurasi Arah Tren (Directional Accuracy %)"
              math="\text{DirAcc} = \frac{1}{n-1} \sum_{t=2}^{n} \mathbf{1}\left( \text{sgn}(y_t - y_{t-1}) == \text{sgn}(\hat{y}_t - y_{t-1}) \right) \times 100\%"
              explanation="Mengukur seberapa sering model berhasil menebak dengan tepat apakah volume esok hari akan naik atau turun dibanding hari ini."
              example="Akurasi Arah LightGBM: 89,3% (tepat memetakan titik balik puncak mudik & balik)."
              badge="Deteksi Arah"
            />
          </div>

          {/* DOKUMENTASI PARTISI NASIONAL VS PROVINSI */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Mengapa Rentang Pengujian Train–Test Berbeda Antara Nasional dan Provinsi?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Tingkat Nasional (Murni 2024–2026):</span>
                <p>
                  Menggunakan <strong>Skema 4: Middle-Holdout Nataru 2025/2026 (18 Hari: 18 Des 2025 – 4 Jan 2026)</strong>. Model dilatih data kontinu 717 hari (2024–2025) untuk diuji kemampuannya menebak masa posko Nataru tahun sebelumnya. Setelah model terbukti juara, seluruh data digabungkan (<strong>Retrain 1.035 Hari</strong> s.d. 31 Okt 2026) untuk meramal 100 hari ke depan.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Tingkat Provinsi (38 Provinsi):</span>
                <p>
                  Karena data mentah lapangan 2024 dan 2025 dari API Hubnet tidak memiliki rincian daerah, evaluasi akurasi provinsi menggunakan <strong>Temporal Holdout 28 Hari (2 – 29 Sep 2026)</strong> dari 304 hari data manifest riil 2026. Ini menjamin RMSE dan MAPE dihitung 100% dari fakta observasi nyata tanpa bias sirkular rekonstruksi top-down.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: SIMULATOR DEFISIT ARMADA */}
      {(activeSection === 'all' || activeSection === 'sec-simulator') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              7. Formula Rekomendasi Kebutuhan Penambahan Armada Simpul (Anti-Overcrowding)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormulaBlock
              title="Kebutuhan Penambahan Armada Simpul"
              math="\Delta A = \frac{P_{\text{puncak}}}{LF_{\text{biasa}}} - A_{\text{puncak}} = A_{\text{puncak}} \times \left( \frac{LF_{\text{puncak}}}{LF_{\text{biasa}}} - 1 \right)"
              explanation="Menghitung defisit trip armada kapal, bus, kereta, atau pesawat yang harus dioperasikan saat hari puncak agar rasio kepadatan beban penumpang kembali ke tingkat kenyamanan hari biasa."
              example="Pelabuhan Merak saat puncak mudik: P=115.459 pnp, LF normal=235,9 pnp/kapal, armada beroperasi=130 kapal. Kebutuhan ideal: 115.459 / 235,9 = 489 kapal (Defisit: +359 kapal cadangan)."
              badge="Anti-Overcrowding"
            />

            <FormulaBlock
              title="Rasio Stres Kepadatan Simpul (Stress Ratio)"
              math="\text{Stress Ratio} = \frac{LF_{\text{puncak}}}{LF_{\text{biasa}}}"
              explanation="Indikator kelipatan beban fisik simpul. Jika Stress Ratio > 2,0x, simpul berada dalam zona merah darurat yang memerlukan penambahan jadwal atau rekayasa operasional."
              example="Stasiun Pasar Senen: LF puncak 1.018 pnp/KA vs LF normal 422 pnp/KA -> Stress Ratio = 2,41x (Darurat Antrean)."
              badge="Status Kepadatan"
            />
          </div>
        </div>
      )}

      {/* SECTION 8: GEOSPASIAL, OD & SANKEY */}
      {(activeSection === 'all' || activeSection === 'sec-gis-od') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-sky-600 pl-3">
            <Network className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              8. Geospasial Leaflet, Peta Busur OD ECharts & Diagram Alir Sankey
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormulaBlock
              title="Peta Spasial Simpul & Choropleth Heatmap (Leaflet GIS)"
              math="R_i = \text{clamp}\left( 3.2, \, 3.2 + \sqrt{\frac{P_i}{P_{\max}}} \times 4.3, \, 7.5 \right) \quad (\text{pixel})"
              explanation="Radius titik simpul dibatasi tetap di rentang 3,2px s.d. 7,5px agar proporsional saat peta di-zoom in/out. Intensitas warna provinsi (Choropleth) merefleksikan volume akumulasi pergerakan wilayah."
              example="Sebanyak 1.018 simpul prasarana dengan koordinat lintang/bujur valid terpetakan lengkap di 38 provinsi."
              badge="Leaflet GIS"
            />

            <FormulaBlock
              title="Diagram Alir Sankey & Rute Asal-Tujuan (OD)"
              math="H_n = \max\left( H_{\min}, \, \frac{V_n}{\sum V} \times H_{\text{kontainer}} \right), \quad Y_{t+1} = Y_t + H_n + \text{gap}"
              explanation="Diagram alir bipartite Sankey menghubungkan 5 bandara origin utama (CGK, SUB, DPS, UPG, KNO) ke 40 bandara destinasi. Tinggi pita dan simpul adaptif otomatis menjamin zero label clipping."
              example="Koridor Udara Primadona: Rute Jakarta (CGK) -> Surabaya (SUB) dengan volume 623.140 penumpang YTD."
              badge="Origin-Destination"
            />
          </div>
        </div>
      )}

      {/* SECTION 9: DATA QUALITY AUDIT & GLOSARIUM SINGKATAN */}
      {(activeSection === 'all' || activeSection === 'sec-audit') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-emerald-600 pl-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              9. Audit Integritas Data & Glosarium Singkatan Resmi PUSDATIN Kemenhub
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Rekam Jejak Pembersihan & Audit Kualitas Data (Data Quality Audit)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block mb-1">1. Deduplikasi Baris Persis:</strong>
                Sebanyak 2 baris duplikat persis identik telah dibersihkan secara otomatis oleh pipeline ETL tanpa kehilangan data substansial.
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block mb-1">2. Konsolidasi Logbook:</strong>
                Sebanyak 2.792 baris dengan tanggal, moda, dan simpul sama namun berbeda catatan manifest logbook diagregasikan secara matematis (*sum consolidation*).
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block mb-1">3. Integritas Geospasial:</strong>
                Dari 1.214 simpul, 1.018 simpul memiliki koordinat geospasial valid. 196 simpul non-koordinat tetap tercatat utuh di database analitik (*zero data loss*).
              </div>
            </div>

            {/* TABEL GLOSARIUM SINGKATAN */}
            <div className="pt-2">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
                Daftar Glosarium & Singkatan Resmi Dashboard
              </h5>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 px-3 w-28">Singkatan</th>
                      <th className="py-2 px-3 w-56">Kepanjangan</th>
                      <th className="py-2 px-3">Definisi & Konteks Operasional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-sans">
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">PUSDATIN</td>
                      <td className="py-2 px-3 font-semibold">Pusat Data dan Informasi</td>
                      <td className="py-2 px-3">Unit kerja Sekretariat Jenderal Kementerian Perhubungan RI pengelola infrastruktur analitik data transportasi nasional.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">LF</td>
                      <td className="py-2 px-3 font-semibold">Load Factor (Proxy Okupansi)</td>
                      <td className="py-2 px-3">Rasio rata-rata jumlah penumpang per satu trip armada sarana (pnp/trip).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">OD</td>
                      <td className="py-2 px-3 font-semibold">Origin - Destination</td>
                      <td className="py-2 px-3">Matriks alur pergerakan penumpang dari simpul simpul asal (origin) ke simpul tujuan (destination).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">LightGBM</td>
                      <td className="py-2 px-3 font-semibold">Light Gradient Boosting Machine</td>
                      <td className="py-2 px-3">Algoritma Machine Learning berbasis pohon keputusan dengan komputasi cepat dan akurasi tinggi (Model Terpilih/Terbaik).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">MAPE</td>
                      <td className="py-2 px-3 font-semibold">Mean Absolute Percentage Error</td>
                      <td className="py-2 px-3">Rata-rata persentase galat absolut prediksi terhadap data riil. Nilai &lt;5% menunjukkan presisi peramalan superior.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">RMSE</td>
                      <td className="py-2 px-3 font-semibold">Root Mean Squared Error</td>
                      <td className="py-2 px-3">Akar kuadrat dari rerata selisih kuadrat prediksi terhadap aktual dalam satuan orang/hari atau trip/hari.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">YTD</td>
                      <td className="py-2 px-3 font-semibold">Year to Date</td>
                      <td className="py-2 px-3">Akumulasi volume operasional terhitung sejak 1 Januari 2026 sampai dengan tanggal pengamatan berjalan.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">ASDP</td>
                      <td className="py-2 px-3 font-semibold">Angkutan Sungai, Danau, dan Penyeberangan</td>
                      <td className="py-2 px-3">Moda transportasi penyeberangan kapal feri ro-ro antarpulau (misal: Merak–Bakauheni, Ketapang–Gilimanuk).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 10: CREDIT PEMBUAT DASHBOARD */}
      {(activeSection === 'all' || activeSection === 'sec-credits') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              10. Credit Pembuat Dashboard
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Dashboard analitik intelijen transportasi <strong>StrategiHub Analytics</strong> dikembangkan oleh:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    WN
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      Wildan Nazhif Irsyadi
                    </h5>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      Pengembang Dashboard
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs font-mono">
                  <a
                    href="mailto:wildannnazhifirsyadi@gmail.com"
                    className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>wildannnazhifirsyadi@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    ND
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      Novianda Dwi Tanti Ramdani
                    </h5>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Pengembang Dashboard
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs font-mono">
                  <a
                    href="mailto:noviandadwitantiramdani@gmail.com"
                    className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>noviandadwitantiramdani@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
