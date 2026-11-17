export interface TollGateForecastMeta {
  source_file: string;
  model_name: string;
  model_family: string;
  target_transform: string;
  objective: string;
  mape: number;
  accuracy: number;
  mae: number;
  r2: number;
  historical_start: string;
  historical_end: string;
  historical_days: number;
  historical_rows: number;
  original_sensor_rows: number;
  local_imputation_rows: number;
  monthly_imputation_rows: number;
  one_way_valid_rows: number;
  original_sensor_pct: number;
  training_start: string;
  training_end: string;
  training_rows: number;
  testing_start: string;
  testing_end: string;
  testing_days: number;
  testing_rows: number;
  forecast_start: string;
  forecast_end: string;
  forecast_days: number;
  forecast_rows: number;
  forecast_total: number;
  forecast_average_all_gates: number;
  nataru_start: string;
  nataru_end: string;
  nataru_days: number;
  nataru_actual_2024: number;
  nataru_actual_2025: number;
  nataru_forecast_2026_2027: number;
  nataru_yoy_pct: number;
  capacity_buffer_recommendation_pct: number;
}

export interface TollGatePerformance {
  mape: number;
  accuracy: number;
  status: string;
  note: string;
}

export interface TollGateAudit {
  total_days: number;
  original_valid: number;
  local_imputation: number;
  monthly_imputation: number;
  one_way_valid: number;
  original_sensor_pct: number;
}

export interface TollGateHistoryPoint {
  date: string;
  day: string;
  value: number;
  is_holiday: boolean;
  holiday_name: string;
  role: string;
  original: number | null;
  quality_status: string;
  imputation_method: string;
}

export interface TollGateForecastPoint {
  date: string;
  day: string;
  value: number;
  is_holiday: boolean;
  is_long_weekend: boolean;
  phase: string;
  holiday_name: string;
  note: string;
  role: string;
}

export interface TollGateTestingPoint {
  date: string;
  day: string;
  is_holiday: boolean;
  actual: number;
  predicted: number;
  absolute_error: number;
  ape: number;
}

export interface TollGateNataruComparisonPoint {
  label: string;
  date_2024: string;
  date_2025: string;
  day_2025: string;
  actual_2024: number;
  actual_2025: number;
  yoy_pct: number;
  model_16: number;
  model_16_ape: number;
  model_15: number;
  model_15_ape: number;
  ensemble: number;
  ensemble_ape: number;
  best_model: string;
}

export interface TollGateNataruSummary {
  actual_2024: number;
  actual_2025: number;
  yoy_2025_pct: number;
  model_16_prediction: number;
  model_16_mape: number;
  model_15_prediction: number;
  model_15_mape: number;
  ensemble_prediction: number;
  ensemble_mape: number;
  best_model: string;
  forecast_2026_2027: number;
}

export interface TollGateSummary {
  forecast_total: number;
  forecast_average: number;
  peak_date: string;
  peak_value: number;
  nataru_total: number;
}

export interface TollGateData {
  id: number;
  name: string;
  direction: 'MASUK' | 'KELUAR';
  performance: TollGatePerformance;
  audit: TollGateAudit;
  nataru: TollGateNataruSummary;
  summary: TollGateSummary;
  history: TollGateHistoryPoint[];
  forecast: TollGateForecastPoint[];
  testing: TollGateTestingPoint[];
  nataru_daily_comparison: TollGateNataruComparisonPoint[];
}

export interface TollGateBenchmark {
  rank: number;
  name: string;
  transform: string;
  objective: string;
  trees: number;
  learning_rate: string;
  leaves: number;
  max_depth: number;
  min_child: number;
  regularization: string;
  mape: number;
  accuracy: number;
  mae: number;
  r2: number;
  note: string;
}

export interface TollGateHoliday {
  date: string;
  day: string;
  year: number;
  name: string;
  category: string;
}

export interface TollGateForecastData {
  meta: TollGateForecastMeta;
  gates: TollGateData[];
  benchmarks: TollGateBenchmark[];
  holidays: TollGateHoliday[];
  methodology: {
    imputation_rules: string[];
    features: string[];
  };
}
