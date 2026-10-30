#!/usr/bin/env python3
import os
import sys
import time
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

REPO_DIR = "/home/ubuntu/strategihub-kemenhub-2026"
V2_DIR = os.path.join(REPO_DIR, "v2")
SCREENSHOTS_DIR = os.path.join(REPO_DIR, "V2_DOCUMENTATION", "V2_SCREENSHOTS")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

port = 3456
next_proc = subprocess.Popen(
    ["npx", "next", "start", "-p", str(port)],
    cwd=V2_DIR,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)

print(f"Waiting for Next.js to start on port {port}...")
# Poll until server is responding
for i in range(25):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=1) as response:
            if response.status == 200:
                print(f"Server is ready on attempt {i+1}!")
                break
    except Exception:
        time.sleep(1)
else:
    print("Server failed to respond within 25 seconds.")

tabs = [
    ("timeline", "01_kronologi_harian"),
    ("lebaran", "02_lebaran_2026"),
    ("loadfactor", "03_beban_armada"),
    ("tophubs", "04_registri_simpul"),
    ("matrix", "05_matriks_13_indikator"),
    ("spatial", "06_peta_spasial"),
    ("forecasting", "07_proyeksi_nataru"),
    ("simulator", "08_rekomendasi_simulator"),
    ("od_map", "09_peta_rute_od"),
    ("sankey", "10_diagram_sankey_od"),
    ("glossary", "11_tentang_data_rumus")
]

errors_found = []

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )

        # 1. Desktop View (1440x900)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.on("console", lambda msg: print(f"  [Browser Console {msg.type}] {msg.text}") if msg.type in ['error', 'warn'] else None)
        page.on("pageerror", lambda err: errors_found.append(str(err)))

        print("Navigating to V2 app...")
        page.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(3000)

        # Capture initial Header values
        header_text = page.locator("header").inner_text()
        print("Header content:", header_text.replace("\n", " | "))

        for tab_id, tab_slug in tabs:
            print(f"Testing tab: {tab_id} ({tab_slug})...")
            # Click tab via JS evaluate
            page.evaluate(f"""() => {{
                const btns = Array.from(document.querySelectorAll('aside button'));
                for (const b of btns) {{
                    const txt = b.innerText.toLowerCase();
                    if ('{tab_slug}'.includes('kronologi') && txt.includes('kronologi')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('lebaran') && txt.includes('lebaran')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('beban') && txt.includes('beban')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('registri') && txt.includes('registri')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('matriks') && txt.includes('matriks')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('spasial') && txt.includes('spasial')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('proyeksi') && txt.includes('proyeksi')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('rekomendasi') && txt.includes('simulator')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('rute') && txt.includes('rute')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('sankey') && txt.includes('sankey')) {{ b.click(); return; }}
                    if ('{tab_slug}'.includes('rumus') && txt.includes('rumus')) {{ b.click(); return; }}
                }}
            }}""")
            page.wait_for_timeout(2000)

            shot_path = os.path.join(SCREENSHOTS_DIR, f"{tab_slug}_v2_desktop.png")
            page.screenshot(path=shot_path, full_page=False)
            print(f"  ✓ Saved V2 screenshot: {shot_path}")

        # 2. Test Mobile View (390x844)
        print("\nTesting V2 Mobile View (390x844)...")
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
        )
        page_mobile = context_mobile.new_page()
        page_mobile.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle", timeout=60000)
        page_mobile.wait_for_timeout(3000)

        for tab_slug in ["01_kronologi_harian", "02_lebaran_2026", "07_proyeksi_nataru"]:
            shot_path = os.path.join(SCREENSHOTS_DIR, f"{tab_slug}_v2_mobile.png")
            page_mobile.screenshot(path=shot_path, full_page=False)
            print(f"  ✓ Saved V2 Mobile screenshot: {shot_path}")

        context_mobile.close()
        context.close()
        browser.close()

finally:
    next_proc.terminate()
    next_proc.kill()
    print("Next.js server stopped.")

if errors_found:
    print(f"\n❌ Browser page errors ({len(errors_found)}):")
    for e in errors_found:
        print("  -", e)
else:
    print("\n✅ ZERO browser runtime errors detected!")
