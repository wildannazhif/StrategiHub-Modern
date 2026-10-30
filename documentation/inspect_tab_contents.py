#!/usr/bin/env python3
import re

with open('/home/ubuntu/strategihub-kemenhub-2026/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

tabs = [
    'tab-timeline',
    'tab-lebaran',
    'tab-load-factor',
    'tab-top-hubs',
    'tab-matrix',
    'tab-spatial-map',
    'tab-forecasting',
    'tab-rekomendasi',
    'tab-tentang-data',
    'tab-od-map',
    'tab-od-sankey'
]

print("=== TAB DETAILS AND CONTENT LENGTH ===")
for t in tabs:
    pattern = rf'<div[^>]*id=[\"\']{t}[\"\'][^>]*>(.*?)</div>\s*<!--\s*end\s+{t}|<div[^>]*id=[\"\']{t}[\"\'][^>]*>'
    # let's find the start index of the div id=t
    start_pos = html.find(f'id="{t}"')
    if start_pos == -1:
        start_pos = html.find(f"id='{t}'")
    print(f"Tab {t:20}: start pos {start_pos}")

    # find canvases, tables, iframes, select/inputs in this tab
    # grab 50k chars after start_pos
    chunk = html[start_pos:start_pos+150000]
    canvases = re.findall(r'<canvas[^>]*id=[\"\']([^\"\']+)[\"\']', chunk)
    tables = re.findall(r'<table[^>]*id=[\"\']([^\"\']+)[\"\']|<table', chunk)
    iframes = re.findall(r'<iframe[^>]*src=[\"\']([^\"\']+)[\"\']', chunk)
    buttons = re.findall(r'<button[^>]*id=[\"\']([^\"\']+)[\"\']', chunk)
    print(f"  • Canvases : {canvases}")
    print(f"  • Tables   : {len(tables)} tables")
    print(f"  • Iframes  : {iframes}")
    print(f"  • Buttons  : {buttons[:5]}")
