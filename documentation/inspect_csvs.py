#!/usr/bin/env python3
import os
import glob
import pandas as pd

REPO_DIR = "/home/ubuntu/strategihub-kemenhub-2026"
csv_files = sorted(glob.glob(os.path.join(REPO_DIR, "*.csv")) + glob.glob(os.path.join(REPO_DIR, "data", "*.csv")))

print("=== DATASET INVENTORY ===")
for f in csv_files:
    fname = os.path.relpath(f, REPO_DIR)
    size_mb = os.path.getsize(f) / (1024 * 1024)
    try:
        # read first 5 rows to get columns and row count estimate or full count
        df = pd.read_csv(f, nrows=5)
        # count total lines
        with open(f, 'rb') as fp:
            line_count = sum(1 for _ in fp) - 1 # minus header
        print(f"\n📄 {fname} ({size_mb:.2f} MB, {line_count:,} rows):")
        print(f"   Columns ({len(df.columns)}): {list(df.columns)}")
    except Exception as e:
        print(f"\n📄 {fname} ({size_mb:.2f} MB): Error reading: {e}")
