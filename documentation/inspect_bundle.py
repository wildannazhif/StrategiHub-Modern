#!/usr/bin/env python3
import json
import re

with open('/home/ubuntu/strategihub-kemenhub-2026/data/mobility_data_bundle.json', 'r', encoding='utf-8') as f:
    bundle = json.load(f)

print('=== MOBILITY_DATA_BUNDLE.JSON KEYS ===')
for k in bundle.keys():
    v = bundle[k]
    if isinstance(v, list):
        print(f"  • {k}: list with {len(v)} items")
    elif isinstance(v, dict):
        print(f"  • {k}: dict with {len(v)} keys: {list(v.keys())[:5]}...")
    else:
        print(f"  • {k}: {type(v)} = {v}")
