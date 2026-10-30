#!/usr/bin/env python3
import json

with open('/home/ubuntu/strategihub-kemenhub-2026/data/mobility_data_bundle.json', 'r', encoding='utf-8') as f:
    bundle = json.load(f)

meta = bundle.get('meta', {})
print("=== META KPIS & SUMMARY ===")
for k, v in meta.items():
    print(f"  • {k}: {v}")

metrics_summary = bundle.get('metrics_summary', {})
print("\n=== METRICS SUMMARY BY KEY ===")
for k, v in metrics_summary.items():
    print(f"  • {k}: {v}")

surge = bundle.get('surge_summary', {})
print("\n=== SURGE SUMMARY (LEBARAN) ===")
for k, v in surge.items():
    print(f"  • {k}: {v}")

load_factor = bundle.get('load_factor_stats', {})
print("\n=== LOAD FACTOR STATS ===")
for k, v in load_factor.items():
    if isinstance(v, dict):
        print(f"  • {k}: {v}")
    elif isinstance(v, list):
        print(f"  • {k}: {len(v)} items")

forecast = bundle.get('forecast_nataru', {})
print("\n=== FORECAST NATARU META ===")
for k, v in forecast.get('meta', {}).items():
    print(f"  • {k}: {v}")
print("Forecast Metrics:", forecast.get('metrics', {}))
print("Forecast Benchmark 2025:", forecast.get('benchmark_2025', {}))
print("Forecast Shock Factors:", forecast.get('shock_factors', {}))
print("Forecast Summaries Scenarios:", forecast.get('summaries', {}).keys())
