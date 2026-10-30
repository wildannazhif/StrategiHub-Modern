#!/usr/bin/env python3
import re

with open('/home/ubuntu/strategihub-kemenhub-2026/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find all sidebar nav items / links
# typically look for data-tab, onclick="switchTab, or class related to sidebar
sidebar_items = re.findall(r'<button[^>]*onclick=[\"\']switchTab\([^)]*\)[\"\'][^>]*>(.*?)</button>', html, re.DOTALL)
print(f'switchTab buttons count: {len(sidebar_items)}')
for b in sidebar_items:
    clean_text = re.sub(r'<[^>]+>', '', b).strip()
    clean_text = ' '.join(clean_text.split())
    print('  📌', clean_text)

# Also search for switchTab definitions
tabs = re.findall(r'switchTab\([\'\"]([^\'\"]+)[\'\"]\)', html)
print('\nUnique Tab IDs in switchTab calls:')
print(set(tabs))

# Find tab content containers (divs with id ending in -tab or content area)
tab_divs = re.findall(r'<div[^>]*id=[\"\'](tab-[^\'\"]+|[^\'\"]+-tab)[^\"\']*[\"\']', html)
print('\nTab content container IDs:')
print(set(tab_divs))
