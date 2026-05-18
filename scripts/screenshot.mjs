#!/usr/bin/env node
// Capture screenshots of localhost:3000 at 4 viewports.
// Usage: node scripts/screenshot.mjs <label>
//   label → subdirectory name under ../.claude/screenshots/
// Example: node scripts/screenshot.mjs 00-baseline

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const VIEWPORTS = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'ipad-768x1024', width: 768, height: 1024 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  // Bug-band candidates (desktop ≥1200, height ≥880 — above the 879 threshold)
  { name: 'bug-1366x900', width: 1366, height: 900 },
  { name: 'bug-1440x880', width: 1440, height: 880 },
  { name: 'bug-1500x900', width: 1500, height: 900 },
  { name: 'bug-1500x880', width: 1500, height: 880 },
  { name: 'bug-1600x900', width: 1600, height: 900 },
  { name: 'bug-1680x900', width: 1680, height: 900 },
];

const URL = process.env.SCREENSHOT_URL ?? 'http://localhost:3000/';
const label = process.argv[2];
if (!label) {
  console.error('usage: node scripts/screenshot.mjs <label>');
  process.exit(1);
}

const outDir = resolve(import.meta.dirname, '../../.claude/screenshots', label);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const measurements = [];
try {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      colorScheme: 'light',
    });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);

    // Full-page first
    const fullPath = join(outDir, `${vp.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    // Viewport-only (what user sees without scrolling)
    const viewportPath = join(outDir, `${vp.name}-viewport.png`);
    await page.screenshot({ path: viewportPath, fullPage: false });

    // Scroll to #about and capture viewport-only + measure overlap
    await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(400);
    const aboutPath = join(outDir, `${vp.name}-about.png`);
    await page.screenshot({ path: aboutPath, fullPage: false });

    // Measure overlap: does .tl-list bottom exceed .arsenal-section top?
    const m = await page.evaluate(() => {
      const tlList = document.querySelector('.tl-list');
      const arsenal = document.querySelector('.arsenal-section');
      const journeyViews = document.querySelector('.journey-views');
      const about = document.getElementById('about');
      if (!tlList || !arsenal || !journeyViews || !about) return null;
      const tlR = tlList.getBoundingClientRect();
      const arsR = arsenal.getBoundingClientRect();
      const jvR = journeyViews.getBoundingClientRect();
      const aboutR = about.getBoundingClientRect();
      const cs = getComputedStyle(tlList);
      return {
        tlListHeight: Math.round(tlR.height),
        tlListBottom: Math.round(tlR.bottom),
        journeyViewsHeight: Math.round(jvR.height),
        arsenalTop: Math.round(arsR.top),
        aboutHeight: Math.round(aboutR.height),
        overflowsArsenal: tlR.bottom > arsR.top,
        overflowAmountPx: Math.max(0, Math.round(tlR.bottom - arsR.top)),
        tlListComputedHeight: cs.height,
        tlListFlex: cs.flex,
        lineageHeightVar: getComputedStyle(document.querySelector('.journey-area')).getPropertyValue('--lineage-height').trim(),
      };
    });
    measurements.push({ viewport: vp.name, ...m });

    console.log(`  ✓ ${vp.name} (${vp.width}×${vp.height})${m?.overflowsArsenal ? ` ⚠ OVERLAP +${m.overflowAmountPx}px` : ''}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outDir, 'measurements.json'), JSON.stringify(measurements, null, 2));
console.log(`\nDone → ${outDir}`);
console.log('Measurements saved to measurements.json');
