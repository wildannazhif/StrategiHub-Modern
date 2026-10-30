#!/usr/bin/env python3
import os
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

OUT_DIR = "/home/ubuntu/strategih2_out" # let's point to /home/ubuntu/strategihub-v2/out
OUT_DIR = "/home/ubuntu/strategihub-v2/out"
SCREENSHOTS_DIR = "/home/ubuntu/strategihub-v2/documentation/V2_SCREENSHOTS"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

port = 7788
srv_proc = subprocess.Popen(
    ["python3", "-m", "http.server", str(port), "--directory", OUT_DIR],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)

time.sleep(2)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print(f"Opening static export at http://127.0.0.1:{port}/ ...")
        page.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(3000)

        # Tab 1: Timeline
        shot_path1 = os.path.join(SCREENSHOTS_DIR, "01_kronologi_fixed_desktop.png")
        page.screenshot(path=shot_path1, full_page=False)
        print(f"  ✓ Saved {shot_path1}")

        # Tab 2: Lebaran
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('aside button'));
            for (const b of btns) {
                if (b.innerText.toLowerCase().includes('lebaran')) { b.click(); break; }
            }
        }""")
        page.wait_for_timeout(2000)
        shot_path2 = os.path.join(SCREENSHOTS_DIR, "02_lebaran_fixed_desktop.png")
        page.screenshot(path=shot_path2, full_page=False)
        print(f"  ✓ Saved {shot_path2}")

        # Tab 7: Forecasting
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('aside button'));
            for (const b of btns) {
                if (b.innerText.toLowerCase().includes('proyeksi')) { b.click(); break; }
            }
        }""")
        page.wait_for_timeout(2000)
        shot_path7 = os.path.join(SCREENSHOTS_DIR, "07_proyeksi_fixed_desktop.png")
        page.screenshot(path=shot_path7, full_page=False)
        print(f"  ✓ Saved {shot_path7}")

        context.close()
        browser.close()
finally:
    srv_proc.terminate()
    print("Static server stopped.")
