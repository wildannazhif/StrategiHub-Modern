// Strict TypeScript contracts for StrategiHub Kemenhub 2026 Data Bundle

export type TransportModa = 'UDARA' | 'KA' | 'BUS' | 'ASDP' | 'LAUT' | 'ALL';

export interface MetaKpis {
  total_clean_rows: number;
  total_passengers_ytd: number;
  total_armada_ytd: number;
  total_pnp_dat_ytd: number;
  total_pnp_brg_ytd: number;
  total_arm_dat_ytd: number;
  total_arm_brg_ytd: number;
  date_min: string;
  date_max: string;
  days_count: number;
  all_time_peak_date: string;
  all_time_peak_val: number;
  all_time_peak_surge_pct: number;
  peak_mudik_date: string;
  peak_mudik_val: number;
  peak_mudik_surge_pct: number;
  baseline_feb_avg: number;
  valid_latlon_count: number;
  empty_latlon_count: number;
  total_nodes_count: number;
}

export interface MetricDirectionData {
  pnp_tot: number;
  pnp_dat: number;
  pnp_brg: number;
  arm_tot: number;
  arm_dat: number;
  arm_brg: number;
}

export interface DailyTimelineEntry {
  date: string;
  UDARA: MetricDirectionData;
  KA: MetricDirectionData;
  BUS: MetricDirectionData;
  ASDP: MetricDirectionData;
  LAUT: MetricDirectionData;
  TOTAL: MetricDirectionData;
}

export interface MonthlySummaryEntry {
  month: number;
  month_name: string;
  UDARA: MetricDirectionData;
  KA: MetricDirectionData;
  BUS: MetricDirectionData;
  ASDP: MetricDirectionData;
  LAUT: MetricDirectionData;
  TOTAL: MetricDirectionData;
}

export interface LebaranDailyEntry {
  date: string;
  h_tag: string;
  UDARA: MetricDirectionData;
  KA: MetricDirectionData;
  BUS: MetricDirectionData;
  ASDP: MetricDirectionData;
  LAUT: MetricDirectionData;
  TOTAL: MetricDirectionData;
}

export interface SurgeSummaryMode {
  baseline: number;
  peak_mudik: number;
  surge_mudik_pct: number;
  peak_balik1: number;
  surge_balik1_pct: number;
  peak_balik2: number;
  surge_balik2_pct: number;
}

export type SurgeSummary = Record<string, SurgeSummaryMode>;

export interface LoadFactorStatsMode {
  baseline_lf: number;
  mudik_lf: number;
  balik_lf: number;
  peak_lf: number;
  surge_lf_pct: number;
}

export interface TopHub {
  rank: number;
  name: string;
  prov: string;
  moda: string;
  tipe: string;
  pnp_tot: number;
  pnp_dat: number;
  pnp_brg: number;
  arm_tot: number;
  arm_dat: number;
  arm_brg: number;
  load_factor: number;
  status: string;
}

export interface DOWSummaryEntry {
  day_idx: number;
  day_name: string;
  UDARA: MetricDirectionData;
  KA: MetricDirectionData;
  BUS: MetricDirectionData;
  ASDP: MetricDirectionData;
  LAUT: MetricDirectionData;
  TOTAL: MetricDirectionData;
  avg_pnp: number;
  avg_arm: number;
}

export interface SpatialNode {
  id: string | number;
  name: string;
  moda: string;
  prov: string;
  tipe: string;
  lat: number | null;
  lon: number | null;
  pnp_tot: number;
  arm_tot: number;
  load_factor: number;
  status: string;
}

export interface ForecastDayPoint {
  date: string;
  dow: string;
  moderat: number;
  optimis: number;
  konservatif: number;
  ci_lower: number;
  ci_upper: number;
  modes?: Record<string, number>;
}

export interface ForecastNataruData {
  meta: {
    model: string;
    training_dataset: string;
    train_start: string;
    train_end: string;
    train_days: number;
    forecast_start: string;
    forecast_end: string;
    horizon_days: number;
    parameters: Record<string, any>;
    scenario_factors: Record<string, number>;
    ci_method: string;
  };
  metrics: {
    TOTAL: {
      model_name: string;
      model_code: string;
      mape: number;
      rmse: number;
      mae: number;
      wape: number;
      dir_acc: number;
    };
  };
  benchmark_2025: {
    total_passengers: number;
    avg_daily_passengers: number;
    total_armada: number;
    xmas_peak_val: number;
    ny_peak_val: number;
    modes: Record<string, { passengers: number; armada: number; share_pct: number }>;
  };
  shock_factors: {
    nataru_window: string;
    november_2025_weekday_baseline: Record<string, Record<string, number>>;
    factors_by_date: Array<{
      date: string;
      dow: string;
      val_2025_tot: number;
      nov_baseline_tot: number;
      shock_factor_tot: number;
      mode_shocks: Record<string, number>;
    }>;
  };
  summaries: {
    moderat: {
      total_passengers: number;
      avg_daily: number;
      peak_date: string;
      peak_val: number;
      daily_points: ForecastDayPoint[];
    };
    optimis: {
      total_passengers: number;
      avg_daily: number;
      peak_date: string;
      peak_val: number;
      daily_points: ForecastDayPoint[];
    };
    konservatif: {
      total_passengers: number;
      avg_daily: number;
      peak_date: string;
      peak_val: number;
      daily_points: ForecastDayPoint[];
    };
  };
}

export interface SimpulRecommendation {
  id: string;
  name: string;
  prov: string;
  moda: string;
  modaLabel: string;
  saranaType: string;
  saranaUnit: string;
  pnpBiasa: number;
  armBiasa: number;
  pnpPuncak: number;
  armPuncak: number;
  lfBiasa: number;
  lfPuncak: number;
  loadRatio: number;
  pctTambah: number;
  addArm: number;
  totalArm: number;
  statusText: 'Sangat Kritis' | 'Padat Tinggi' | 'Sibuk Terkendali' | 'Stabil/Normal';
  statusBadge: string;
  fieldAction: string;
}

export interface MobilityDataBundle {
  meta: MetaKpis;
  daily_timeline: DailyTimelineEntry[];
  monthly_summary: MonthlySummaryEntry[];
  lebaran_daily: LebaranDailyEntry[];
  surge_summary: SurgeSummary;
  load_factor_stats: Record<string, any>;
  top_hubs_peak: Record<string, TopHub[]>;
  top_hubs_ytd: Record<string, TopHub[]>;
  dow_summary: DOWSummaryEntry[];
  spatial_nodes: SpatialNode[];
  metrics_summary: Record<string, any>;
  forecast_nataru: ForecastNataruData;
  timeline_2025: any[];
  simpul_recommendations: SimpulRecommendation[];
  province_monthly_data: Record<string, any>;
  province_geojson: any;
}
