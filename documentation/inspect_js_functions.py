#!/usr/bin/env python3
import re

with open('/home/ubuntu/strategihub-kemenhub-2026/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

js_code = html[8324727:]
print(f"JavaScript code length: {len(js_code):,} chars")

# Find all function definitions
functions = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', js_code)
print(f"Total functions found: {len(functions)}")
for i, fn in enumerate(functions):
    print(f"  {i+1:2d}. {fn}")

# Check event listeners or initialization
init_calls = re.findall(r'window\.addEventListener\([\'\"]([^\'\"]+)[\'\"]|document\.addEventListener\([\'\"]([^\'\"]+)[\'\"]', js_code)
print(f"\nEvent listeners: {init_calls}")
