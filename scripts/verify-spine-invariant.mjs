#!/usr/bin/env node
// Issue 1.1 verification: click each of the 6 Lineage entries and confirm
// the spine height (.tl-list::before) is pixel-identical across all states.
// Exit non-zero if any drift exceeds 1px.

import { chromium } from 'playwright';

const URL = process.env.SCREENSHOT_URL ?? 'http://localhost:3000/';

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

async function measureSpine(page) {
  return page.evaluate(() => {
    const list = document.querySelector('.tl-list');
    if (!list) return null;
    const cs = getComputedStyle(list, '::before');
    return {
      listHeight: list.getBoundingClientRect().height,
      pseudoTop: parseFloat(cs.top),
      pseudoBottom: parseFloat(cs.bottom),
      spineHeight:
        list.getBoundingClientRect().height -
        parseFloat(cs.top) -
        parseFloat(cs.bottom),
    };
  });
}

let exitCode = 0;
const browser = await chromium.launch();
try {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(400);

    const baseline = await measureSpine(page);
    console.log(`\n[${vp.name}] no-entry baseline: spine=${baseline.spineHeight.toFixed(1)}px (list=${baseline.listHeight.toFixed(1)}, top=${baseline.pseudoTop.toFixed(1)}, bot=${baseline.pseudoBottom.toFixed(1)})`);

    const entries = await page.$$('.tl-entry');
    for (let i = 0; i < entries.length; i++) {
      await entries[i].click();
      await page.waitForTimeout(900); // wait for grid + card animation
      const m = await measureSpine(page);
      const drift = Math.abs(m.spineHeight - baseline.spineHeight);
      const ok = drift <= 1;
      console.log(`  entry ${i + 1} clicked: spine=${m.spineHeight.toFixed(1)}px drift=${drift.toFixed(1)}px ${ok ? '✓' : '✗ FAIL'}`);
      if (!ok) exitCode = 1;
      await page.evaluate(() => document.body.click()); // unpin
      await page.waitForTimeout(300);
    }

    await ctx.close();
  }
} finally {
  await browser.close();
}

process.exit(exitCode);
