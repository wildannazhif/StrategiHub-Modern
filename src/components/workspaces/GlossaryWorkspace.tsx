'use client';

import React, { useEffect, useRef } from 'react';
import { HelpCircle, ShieldCheck } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaBlockProps {
  title: string;
  math: string;
  explanation: string;
  example?: string;
}

const FormulaBlock: React.FC<FormulaBlockProps> = ({ title, math, explanation, example }) => {
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
      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-600" />
        {title}
      </h4>
      <div className="py-2 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg overflow-x-auto text-slate-900 dark:text-white">
        <div ref={containerRef} />
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{explanation}</p>
      {example && (
        <div className="text-[11px] font-mono text-slate-500 bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded border border-slate-100 dark:border-slate-800">
          <strong>Contoh Riil:</strong> {example}
        </div>
      )}
    </div>
  );
};

export const GlossaryWorkspace: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Tentang Data & Kamus Formula Matematis Dashboard
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Dokumentasi rumus baku, metodologi statistik, dan rekam jejak audit kualitas data operasional SIASATI PUSDATIN Kemenhub 2026.
        </p>
      </div>

      {/* FORMULA BLOCKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. LOAD FACTOR */}
        <FormulaBlock
          title="1. Rasio Beban Sarana (Load Factor Proxy)"
          math="LF = \frac{P_{total}}{A_{total}} = \frac{P_{datang} + P_{berangkat}}{\text{Trip}_{datang} + \text{Trip}_{berangkat}}"
          explanation="Mengukur rata-rata jumlah penumpang yang diangkut per satu kali trip sarana/kendaraan. Menjadi proksi utama kepadatan fisik sarana di lapangan."
          example="Pelabuhan Bakauheni: 128.821 pnp / 137 kapal = 940,3 pnp/trip kapal feri saat hari puncak Lebaran."
        />

        {/* 2. MODAL SHARE */}
        <FormulaBlock
          title="2. Pangsa Pasar Antarmoda (Modal Share %)"
          math="MS_i = \left( \frac{P_i}{\sum_{k=1}^{5} P_k} \right) \times 100\%"
          explanation="Proporsi kontribusi volume penumpang moda ke-i terhadap total mobilitas multimoda nasional."
          example="Moda Udara: (123,6 Juta / 391,3 Juta) × 100% = 31,6% pangsa pasar nasional YTD 2026."
        />

        {/* 3. LEBARAN SURGE RATE */}
        <FormulaBlock
          title="3. Persentase Lonjakan Lebaran (Surge Rate %)"
          math="SR = \left( \frac{P_{peak} - P_{baseline}}{P_{baseline}} \right) \times 100\%"
          explanation="Mengukur kelipatan kenaikan pergerakan saat hari puncak arus mudik/balik dibandingkan dengan kondisi hari kerja normal (baseline Februari 2026)."
          example="Arus Balik Nasional H+3 (24 Mar): (2.415.296 - 1.188.900) / 1.188.900 × 100% = +103,2%."
        />

        {/* 4. DAY OF WEEK INDEX */}
        <FormulaBlock
          title="4. Indeks Deviasi Hari Mingguan (Day-of-Week Effect)"
          math="I_d = \left( \frac{\bar{P}_d}{\bar{P}_{minggu}} - 1 \right) \times 100\%"
          explanation="Mengukur fluktuasi siklus hari terhadap rata-rata mingguan untuk membedakan hari kerja biasa dengan lonjakan weekend commuter."
          example="Jumat & Minggu mencatat indeks +18,4% dan +22,1% di atas rata-rata mingguan pada moda Kereta Api."
        />

        {/* 5. HOLT-WINTERS DAMPED FORECAST */}
        <FormulaBlock
          title="5. Model Peramalan Time Series Holt-Winters Damped Trend"
          math="\hat{y}_{t+h} = \left( L_t + \left[ \sum_{i=1}^h \phi^i \right] B_t \right) \times S_{t+h-m(k+1)}"
          explanation="Algoritma peramalan time series terpilih dengan parameter damping factor phi=0,98 untuk mencegah overshooting tren linier pada horizon 100 hari, dipadukan seasonalitas mingguan (s=7) dan kalender shock Lebaran/Nataru."
          example="Evaluasi Backtest: MAPE 4,10%, RMSE 62.051, MAE 49.146, Directional Accuracy 89,3%."
        />

        {/* 6. SIMULATOR FLEET CAPACITY */}
        <FormulaBlock
          title="6. Simulasi Kebutuhan Penambahan Armada Simpul"
          math="\Delta A = A_{puncak} \times \left( \frac{LF_{puncak}}{LF_{biasa}} - 1 \right) = \frac{P_{puncak}}{LF_{biasa}} - A_{puncak}"
          explanation="Menghitung jumlah tambahan armada kapal/pesawat/kereta/bus yang harus dioperasikan agar rasio kepadatan beban per trip saat hari puncak kembali setara dengan hari biasa (anti-overcrowding)."
          example="Pelabuhan Merak saat puncak: P=115.459, LF biasa=235,9 pnp/kapal, armada aktual=130 kapal. Kebutuhan ideal: 115.459 / 235,9 = 489 kapal (tambahan +359 kapal)."
        />
      </div>

      {/* DATA AUDIT QUALITY SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Audit Kualitas Data & Rekam Jejak Pembersihan (Data Quality Audit)
          </h4>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            1. <strong>Deduplikasi Baris Persis:</strong> Sebanyak 2 baris duplikat persis identik telah dibersihkan secara otomatis oleh skrip preprocessing.
          </p>
          <p>
            2. <strong>Deduplikasi Biasa Beda Nilai:</strong> Sebanyak 2.792 baris dengan tanggal, moda, dan simpul yang sama namun memiliki perbedaan nilai logbook diagregasi secara matematis menggunakan penjumlahan (*sum consolidation*).
          </p>
          <p>
            3. <strong>Kelengkapan Koordinat Geografis:</strong> Dari total 1.214 simpul prasarana terdaftar, sebanyak 1.018 simpul memiliki koordinat lintang/bujur valid. Sebanyak 196 simpul dengan koordinat kosong tetap dipertahankan secara utuh pada dataset dan diberi penanda khusus agar tidak ada data hilang (*zero data loss policy*).
          </p>
        </div>
      </div>
    </div>
  );
};
