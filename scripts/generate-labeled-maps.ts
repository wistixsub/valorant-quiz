/**
 * Generates labeled map PNG images by rendering HTML with Playwright.
 * Output: public/maps/bind-labeled.png, haven-labeled.png, split-labeled.png
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/generate-labeled-maps.ts
 */

import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface AreaLabel {
  x: number;
  y: number;
  label: string;
}

interface MapConfig {
  id: string;
  url: string;
  areaLabels: AreaLabel[];
}

const MAPS: MapConfig[] = [
  {
    id: 'bind',
    url: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/displayicon.png',
    areaLabels: [
      { x: 22, y: 24, label: 'A サイト' },
      { x: 20, y: 19, label: 'ヘブン' },
      { x: 36, y: 43, label: 'A ショート' },
      { x: 68, y: 24, label: 'B サイト' },
      { x: 78, y: 38, label: 'B ロング' },
      { x: 54, y: 62, label: 'フッカー' },
      { x: 50, y: 18, label: 'TP (B→A)' },
      { x: 50, y: 76, label: 'TP (A→B)' },
    ],
  },
  {
    id: 'haven',
    url: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/displayicon.png',
    areaLabels: [
      { x: 25, y: 20, label: 'A サイト' },
      { x: 25, y: 42, label: 'A ロング' },
      { x: 50, y: 22, label: 'B サイト' },
      { x: 50, y: 52, label: 'B ミッド' },
      { x: 65, y: 21, label: 'C サイト' },
      { x: 78, y: 40, label: 'C ロング' },
      { x: 70, y: 54, label: 'C ガレージ' },
    ],
  },
  {
    id: 'split',
    url: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/displayicon.png',
    areaLabels: [
      { x: 20, y: 24, label: 'A サイト' },
      { x: 40, y: 17, label: 'A ヘブン' },
      { x: 44, y: 43, label: 'A ミッド' },
      { x: 72, y: 23, label: 'B サイト' },
      { x: 68, y: 49, label: 'B ホールズ' },
      { x: 50, y: 33, label: 'ミッドトップ' },
    ],
  },
];

const SIZE = 1024;

function buildHtml(mapUrl: string, labels: AreaLabel[]): string {
  const labelDivs = labels
    .map(
      ({ x, y, label }) => `
    <div style="
      position:absolute;
      left:${x}%;
      top:${y}%;
      transform:translate(-50%,-50%);
      z-index:10;
      pointer-events:none;
    ">
      <span style="
        display:inline-block;
        font-size:13px;
        font-weight:700;
        color:rgba(255,255,255,0.80);
        background:rgba(0,0,0,0.55);
        padding:2px 7px;
        border-radius:3px;
        letter-spacing:0.04em;
        white-space:nowrap;
        line-height:1.6;
        font-family:'Yu Gothic','Meiryo','Noto Sans JP',sans-serif;
      ">${label}</span>
    </div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:${SIZE}px;height:${SIZE}px;background:#0a1520;overflow:hidden;}
  .wrap{position:relative;width:${SIZE}px;height:${SIZE}px;}
  img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;}
</style>
</head>
<body>
<div class="wrap">
  <img src="${mapUrl}" />
  ${labelDivs}
</div>
</body>
</html>`;
}

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'maps');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: SIZE, height: SIZE });

  for (const map of MAPS) {
    console.log(`Generating: ${map.id}`);

    const html = buildHtml(map.url, map.areaLabels);
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Ensure image is fully loaded
    await page.waitForFunction(() => {
      const img = document.querySelector('img') as HTMLImageElement;
      return img && img.complete && img.naturalWidth > 0;
    });

    const outPath = path.join(outDir, `${map.id}-labeled.png`);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: SIZE, height: SIZE },
    });

    console.log(`  Saved → ${outPath}`);
  }

  await browser.close();
  console.log('\nAll maps generated. Check public/maps/ and verify label positions.');
  console.log('If any label is misplaced, edit the x/y values in this script and re-run.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
