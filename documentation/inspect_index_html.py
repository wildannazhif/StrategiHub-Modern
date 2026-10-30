#!/usr/bin/env python3
import re
import json

with open('/home/ubuntu/strategihub-kemenhub-2026/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

print('File size:', len(content), 'bytes')

# External scripts
scripts = re.findall(r'<script[^>]*src=[\"\']([^\"\']+)[\"\']', content)
print('External scripts:')
for s in scripts:
    print('  •', s)

# External stylesheets
styles = re.findall(r'<link[^>]*href=[\"\']([^\"\']+)[\"\']', content)
print('\nExternal stylesheets/links:')
for st in styles:
    print('  •', st)

# Inline scripts
inline_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', content, re.DOTALL)
print(f'\nInline scripts count: {len(inline_scripts)}')
for i, s in enumerate(inline_scripts):
    first_line = s.strip().splitlines()[0] if s.strip().splitlines() else ''
    print(f'  Script {i}: length {len(s):,} chars | Starts with: {first_line[:60]}')

# Sections / Tabs / Navigation
sections = re.findall(r'<section[^>]*id=[\"\']([^\"\']+)[\"\']', content)
print(f'\nSections (IDs): {sections}')

# Modals
modals = re.findall(r'<div[^>]*id=[\"\']([^\"\']*modal[^\"\']*)[\"\']', content, re.IGNORECASE)
print(f'Modals (IDs): {modals}')

# Canvas elements (Chart.js / ECharts)
canvases = re.findall(r'<canvas[^>]*id=[\"\']([^\"\']+)[\"\']', content)
print(f'\nCanvas elements (Chart.js IDs) count: {len(canvases)}')
for c in canvases:
    print('  📊', c)
