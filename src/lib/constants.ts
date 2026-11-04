export const COLOR = {
  UDARA: '#1e3a8a', // Deep Navy Blue
  KA: '#d97706',    // Amber 600
  BUS: '#16a34a',   // Green 600
  ASDP: '#9333ea',  // Purple 600
  LAUT: '#0891b2',  // Cyan 600
  TOTAL: '#0f172a', // Dark Slate
} as const;

export const MODA_DISPLAY_NAME: Record<string, string> = {
  UDARA: 'Udara',
  BUS: 'Jalan',
  ASDP: 'Penyebrangan',
  LAUT: 'Laut',
  KA: 'Perkeretaapian',
  ALL: 'Semua Moda',
  TOTAL: 'Semua Moda',
};

export const MODA_BADGE_CLASS: Record<string, string> = {
  UDARA: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
  KA: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  BUS: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
  ASDP: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900',
  LAUT: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900',
  TOTAL: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
};

export function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  if (window.location.pathname.startsWith('/StrategiHub-Modern')) {
    return '/StrategiHub-Modern';
  }
  return '';
}

export function getMetricValue(
  item: any,
  moda: 'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT' | 'TOTAL',
  metric: 'pnp' | 'arm',
  direction: 'tot' | 'dat' | 'brg'
): number {
  if (!item) return 0;
  if (metric === 'pnp') {
    if (direction === 'tot') return Number(item[moda]) || 0;
    if (direction === 'dat') return Number(item[`pdat_${moda}`]) || 0;
    if (direction === 'brg') return Number(item[`pbrg_${moda}`]) || 0;
  } else {
    if (direction === 'tot') return Number(item[`arm_${moda}`]) || 0;
    if (direction === 'dat') return Number(item[`adat_${moda}`]) || 0;
    if (direction === 'brg') return Number(item[`abrg_${moda}`]) || 0;
  }
  return 0;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Math.round(val).toLocaleString('id-ID');
}

export function formatDecimal(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0,0';
  return Number(val).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0,0%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${formatDecimal(val, decimals)}%`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthNames = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = parseInt(parts[2], 10);
  const m = parseInt(parts[1], 10);
  const year = parts[0];
  return `${day} ${monthNames[m]} ${year}`;
}

/**
 * Data Jumlah Penduduk 38 Provinsi Indonesia Terbaru
 * Sumber Resmi: Badan Pusat Statistik (BPS / Statistics Indonesia), Proyeksi Penduduk Interim 2025/2026
 * Total Nasional: 284,4 Juta Jiwa
 */
export const BPS_PROVINCE_POPULATION: Record<string, number> = {
  'Aceh': 5626000,
  'Sumatera Utara': 15785800,
  'Sumatera Barat': 5914300,
  'Riau': 6811200,
  'Jambi': 3768500,
  'Sumatera Selatan': 8928500,
  'Bengkulu': 2138000,
  'Lampung': 9522900,
  'Kepulauan Bangka Belitung': 1550800,
  'Bangka Belitung': 1550800,
  'Kepulauan Riau': 2213500,
  'DKI Jakarta': 10678000,
  'Jawa Barat': 50759000,
  'Jawa Tengah': 38233900,
  'D.I. Yogyakarta': 3781500,
  'Daerah Istimewa Yogyakarta': 3781500,
  'Jawa Timur': 42089300,
  'Banten': 12537400,
  'Bali': 4461300,
  'Nusa Tenggara Barat': 5731100,
  'NTB': 5731100,
  'Nusa Tenggara Timur': 5742600,
  'NTT': 5742600,
  'Kalimantan Barat': 5766000,
  'Kalimantan Tengah': 2845000,
  'Kalimantan Selatan': 4323300,
  'Kalimantan Timur': 4267600,
  'Kalimantan Utara': 749400,
  'Sulawesi Utara': 2721400,
  'Sulawesi Tengah': 3156100,
  'Sulawesi Selatan': 9563100,
  'Sulawesi Tenggara': 2836700,
  'Gorontalo': 1242200,
  'Sulawesi Barat': 1525300,
  'Maluku': 1970600,
  'Maluku Utara': 1373800,
  'Papua': 1073600,
  'Papua Barat': 587600,
  'Papua Selatan': 549700,
  'Papua Tengah': 1492300,
  'Papua Pegunungan': 1484900,
  'Papua Barat Daya': 636400,
};

