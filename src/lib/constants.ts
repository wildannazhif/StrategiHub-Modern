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

/**
 * Custom SVG Icons per Moda Transportasi
 * Kereta (KA), Udara (UDARA), Laut (LAUT), Jalan (BUS)
 * Penyebrangan (ASDP): tetap menggunakan circleMarker (titik)
 */
export const MODA_CUSTOM_ICONS: Record<string, string> = {
  KA: "data:image/svg+xml,%3c!DOCTYPE%20svg%20PUBLIC%20'-//W3C//DTD%20SVG%201.1//EN'%20'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Transformed%20by:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20height='64px'%20width='64px'%20version='1.1'%20id='_x32_'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='-102.4%20-102.4%20716.80%20716.80'%20xml:space='preserve'%20fill='%23000000'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%20transform='translate(0,0),%20scale(1)'%3e%3crect%20x='-102.4'%20y='-102.4'%20width='716.80'%20height='716.80'%20rx='179.2'%20fill='%23bfbfbf'%20strokewidth='0'/%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cstyle%20type='text/css'%3e%20.st0{fill:%23000000;}%20%3c/style%3e%3cg%3e%3cpath%20class='st0'%20d='M437.575,351.629V89.868C437.575,40.233,397.351,0,347.707,0H164.293c-49.625,0-89.868,40.233-89.868,89.868%20v261.761c0,37.628,27.383,68.98,63.269,75.221L81.334,512h50.11l23.132-34.961h202.867L380.574,512h50.101l-56.35-85.15%20C410.201,420.601,437.575,389.257,437.575,351.629z%20M178.182,40.348h155.636v25.94H178.182V40.348z%20M131.355,124.186%20c0-11.284,9.137-20.438,20.421-20.438h208.456c11.276,0,20.429,9.154,20.429,20.438v86.206c0,11.284-9.154,20.429-20.429,20.429%20H151.777c-11.284,0-20.421-9.145-20.421-20.429V124.186z%20M150.808,374.004c-13.158,0-23.826-10.668-23.826-23.818%20c0-13.167,10.668-23.836,23.826-23.836c13.159,0,23.827,10.668,23.827,23.836C174.635,363.336,163.967,374.004,150.808,374.004z%20M169.618,454.312l17.41-26.318h137.953l17.41,26.318H169.618z%20M361.201,374.004c-13.158,0-23.826-10.668-23.826-23.818%20c0-13.167,10.668-23.836,23.826-23.836c13.159,0,23.827,10.668,23.827,23.836C385.028,363.336,374.36,374.004,361.201,374.004z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e",
  UDARA: "data:image/svg+xml,%3c!DOCTYPE%20svg%20PUBLIC%20'-//W3C//DTD%20SVG%201.1//EN'%20'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Transformed%20by:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20fill='%23000000'%20height='64px'%20width='64px'%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='-24.58%20-24.58%20172.04%20172.04'%20xml:space='preserve'%20stroke='%23000000'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%20transform='translate(0,0),%20scale(1)'%3e%3crect%20x='-24.58'%20y='-24.58'%20width='172.04'%20height='172.04'%20rx='34.407999999999994'%20fill='%23E99558'%20strokewidth='0'/%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cstyle%20type='text/css'%3e%20.st0{fill-rule:evenodd;clip-rule:evenodd;}%20%3c/style%3e%3cg%3e%3cpath%20class='st0'%20d='M16.63,105.75c0.01-4.03,2.3-7.97,6.03-12.38L1.09,79.73c-1.36-0.59-1.33-1.42-0.54-2.4l4.57-3.9%20c0.83-0.51,1.71-0.73,2.66-0.47l26.62,4.5l22.18-24.02L4.8,18.41c-1.31-0.77-1.42-1.64-0.07-2.65l7.47-5.96l67.5,18.97L99.64,7.45%20c6.69-5.79,13.19-8.38,18.18-7.15c2.75,0.68,3.72,1.5,4.57,4.08c1.65,5.06-0.91,11.86-6.96,18.86L94.11,43.18l18.97,67.5%20l-5.96,7.47c-1.01,1.34-1.88,1.23-2.65-0.07L69.43,66.31L45.41,88.48l4.5,26.62c0.26,0.94,0.05,1.82-0.47,2.66l-3.9,4.57%20c-0.97,0.79-1.81,0.82-2.4-0.54l-13.64-21.57c-4.43,3.74-8.37,6.03-12.42,6.03C16.71,106.24,16.63,106.11,16.63,105.75%20L16.63,105.75z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e",
  LAUT: "data:image/svg+xml,%3c!DOCTYPE%20svg%20PUBLIC%20'-//W3C//DTD%20SVG%201.1//EN'%20'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Transformed%20by:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20fill='%23000000'%20version='1.1'%20id='Capa_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20width='64px'%20height='64px'%20viewBox='-191.32%20-191.32%201339.22%201339.22'%20xml:space='preserve'%20stroke='%23000000'%20stroke-width='38.263040000000004'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3crect%20x='-191.32'%20y='-191.32'%20width='1339.22'%20height='1339.22'%20rx='267.844'%20fill='%23019cd0'%20strokewidth='0'/%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cg%3e%3cg%3e%3cpath%20d='M872.229,488.117c-2.34-10.113-14.376-14.392-22.574-8.025L682.53,609.877c-8.873,6.891-6.627,20.865,3.958,24.629%20l60.381,21.469c-25.05,38.842-58.31,71.949-97.652,96.928c-36.896,23.426-78.011,38.861-120.93,45.619V334.249h160.309%20c27.614,0,50-22.386,50-50c0-27.614-22.386-50-50-50H630.49c9.233-20.689,14.378-43.588,14.378-67.669%20C644.868,74.727,570.14,0,478.288,0s-166.58,74.728-166.58,166.58c0,24.081,5.145,46.98,14.378,67.669h-58.107%20c-27.613,0-50,22.386-50,50c0,27.614,22.387,50,50,50h160.31v464.272c-42.918-6.758-84.034-22.193-120.93-45.619%20c-39.344-24.979-72.602-58.088-97.652-96.928l60.381-21.469c10.585-3.764,12.831-17.738,3.958-24.629L106.922,480.092%20c-8.199-6.368-20.236-2.087-22.574,8.025l-47.68,206.16c-2.531,10.945,8.032,20.365,18.617,16.6l58.261-20.713%20c33.913,59.635,81.988,110.193,140.213,147.16c52.974,33.633,112.528,54.734,174.529,62.129v7.123c0,27.613,22.386,50,50,50%20s50-22.387,50-50v-7.123c62.001-7.395,121.557-28.496,174.53-62.129c58.225-36.969,106.299-87.525,140.213-147.16l58.26,20.713%20c10.585,3.764,21.148-5.654,18.617-16.6L872.229,488.117z%20M478.288,100c36.713,0,66.58,29.867,66.58,66.58%20c0,36.713-29.867,66.58-66.58,66.58c-36.712,0-66.58-29.867-66.58-66.58C411.708,129.867,441.576,100,478.288,100z'/%3e%3c/g%3e%3c/g%3e%3c/g%3e%3c/svg%3e",
  BUS: "data:image/svg+xml,%3c!DOCTYPE%20svg%20PUBLIC%20'-//W3C//DTD%20SVG%201.1//EN'%20'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Transformed%20by:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20fill='%23000000'%20width='64px'%20height='64px'%20viewBox='-24.58%20-24.58%20172.06%20172.06'%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20style='enable-background:new%200%200%20122.9%20120.5'%20xml:space='preserve'%3e%3cg%20id='SVGRepo_bgCarrier'%20stroke-width='0'%3e%3crect%20x='-24.58'%20y='-24.58'%20width='172.06'%20height='172.06'%20rx='34.412'%20fill='%231d7500'%20strokewidth='0'/%3e%3c/g%3e%3cg%20id='SVGRepo_tracerCarrier'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cg%20id='SVGRepo_iconCarrier'%3e%3cstyle%20type='text/css'%3e.st0{fill-rule:evenodd;clip-rule:evenodd;}%3c/style%3e%3cg%3e%3cpath%20class='st0'%20d='M110.8,103.6h-7.6V114c0,3.6-2.9,6.5-6.5,6.5h-9c-3.6,0-6.5-2.9-6.5-6.5v-10.3H41.5V114c0,3.6-2.9,6.5-6.5,6.5%20h-9c-3.6,0-6.5-2.9-6.5-6.5v-10.3H12v-82c0-7.6,4.4-13.1,13.3-16.5c17.6-6.9,54.6-6.9,72.3,0c8.9,3.4,13.3,8.9,13.3,16.5V103.6%20L110.8,103.6L110.8,103.6z%20M118.6,40.4h-3.8V62h3.8c2.4,0,4.3-1.9,4.3-4.3V44.7C122.9,42.3,121,40.4,118.6,40.4L118.6,40.4z%20M4.3,40.4h3.8V62H4.3C1.9,62,0,60.1,0,57.7V44.7C0,42.3,1.9,40.4,4.3,40.4L4.3,40.4z%20M46.4,8.6h30.1c0.9,0,1.6,0.7,1.6,1.6v5.2%20c0,0.9-0.7,1.6-1.6,1.6H46.4c-0.9,0-1.6-0.7-1.6-1.6v-5.2C44.8,9.3,45.5,8.6,46.4,8.6L46.4,8.6z%20M22.9,23.2h76.7%20c1,0,1.9,0.9,1.9,1.9v42.8c0,1-0.9,1.9-1.9,1.9H22.9c-1,0-1.9-0.9-1.9-1.9V25.1C21,24.1,21.8,23.2,22.9,23.2L22.9,23.2L22.9,23.2%20L22.9,23.2z%20M98.6,84.9c0-1.9-0.7-3.6-2-4.9c-1.3-1.3-3-2-4.9-2c-1.9,0-3.5,0.7-4.9,2c-1.4,1.3-2,3-2,4.9c0,1.9,0.7,3.5,2,4.8%20c1.4,1.3,3,2,4.9,2c1.9,0,3.6-0.7,4.9-2C98,88.4,98.6,86.8,98.6,84.9L98.6,84.9L98.6,84.9L98.6,84.9z%20M38.1,84.9%20c0-1.9-0.7-3.6-2-4.9c-1.3-1.3-3-2-4.9-2c-1.9,0-3.6,0.7-4.9,2c-1.3,1.3-2,3-2,4.9c0,1.9,0.6,3.5,2,4.8c1.3,1.3,3,2,4.9,2%20c2,0,3.6-0.7,4.9-2C37.4,88.4,38.1,86.8,38.1,84.9L38.1,84.9L38.1,84.9L38.1,84.9z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e",
};

