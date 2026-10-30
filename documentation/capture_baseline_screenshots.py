#!/usr/bin/env python3
import os
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

REPO_DIR = "/home/ubuntu/strategihub-kemenhub-2026"
SCREENSHOTS_DIR = os.path.join(REPO_DIR, "V2_DOCUMENTATION", "BASELINE_SCREENSHOTS")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# Start simple http server
port = 8899
server_proc = subprocess.Popen(
    ["python3", "-m", "http.server", str(port), "--directory", REPO_DIR],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)
time.sleep(2)

print(f"HTTP Server started on port {port}")

tabs = [
    ("tab-timeline", "01_kronologi_harian"),
    ("tab-lebaran", "02_lebaran_2026"),
    ("tab-load-factor", "03_beban_armada"),
    ("tab-top-hubs", "04_registri_simpul"),
    ("tab-matrix", "05_matriks_13_indikator"),
    ("tab-spatial-map", "06_peta_spasial"),
    ("tab-forecasting", "07_proyeksi_nataru"),
    ("tab-rekomendasi", "08_rekomendasi_simulator"),
    ("tab-tentang-data", "09_tentang_data_rumus"),
    ("tab-od-map", "10_peta_rute_od"),
    ("tab-od-sankey", "11_diagram_sankey_od")
]

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )

        # 1. Desktop View (1440x900)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        
        print("Opening index.html in Desktop View...")
        page.goto(f"http://127.0.0.1:{port}/index.html", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(3000)
        
        # Capture each tab
        for tab_id, tab_slug in tabs:
            print(f"Switching to {tab_id} ({tab_slug})...")
            page.evaluate(f"switchTab('{tab_id}')")
            page.wait_for_timeout(2000)
            
            # If map, give leaflet time to render tiles
            if "spatial" in tab_id or "map" in tab_id:
                page.wait_for_timeout(2000)
                
            shot_path = os.path.join(SCREENSHOTS_DIR, f"{tab_slug}_desktop.png")
            page.screenshot(path=shot_path, full_page=False)
            print(f"  ✓ Saved {shot_path}")

        context.close()

        # 2. Mobile View (390x844 - iPhone 14)
        print("\nOpening index.html in Mobile View (390x844)...")
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
        )
        page_mobile = context_mobile.new_page()
        page_mobile.goto(f"http://127.0.0.1:{port}/index.html", wait_until="networkidle", timeout=60000)
        page_mobile.wait_for_timeout(3000)

        for tab_id, tab_slug in [("tab-timeline", "01_kronologi_harian"), ("tab-lebaran", "02_lebaran_2026"), ("tab-forecasting", "07_proyeksi_nataru")]:
            page_mobile.evaluate(f"switchTab('{tab_id}')")
            page_mobile.wait_for_timeout(2000)
            shot_path = os.path.join(SCREENSHOTS_DIR, f"{tab_slug}_mobile.png")
            page_mobile.screenshot(path=shot_path, full_page=False)
            print(f"  ✓ Saved {shot_path}")

        context_mobile.close()
        browser.close()

finally:
    server_proc.terminate()
    print("Server stopped.")
