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
  rotation?: number; // CSS degrees: -90 (CCW), 180
  areaLabels: AreaLabel[];
}

const MAPS: MapConfig[] = [
  {
    id: 'bind',
    url: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/displayicon.png',
    rotation: 180,
    areaLabels: [
      { x: 52.4, y: 3.2, label: 'ディフェンス側スポーン' },
      { x: 27.9, y: 20.1, label: 'Bホール' },
      { x: 15.9, y: 30, label: 'Bエルボー' },
      { x: 29.4, y: 24.7, label: 'Bサイト' },
      { x: 24.8, y: 42.3, label: 'Bガーデン' },
      { x: 31.9, y: 46.6, label: 'Bウィンドウ' },
      { x: 12.8, y: 40.8, label: 'Bテレポーター' },
      { x: 19.3, y: 51.8, label: 'Bロング' },
      { x: 24.3, y: 64.8, label: 'Bファウンテン' },
      { x: 40.2, y: 52.6, label: 'Bショート' },
      { x: 39.9, y: 59.8, label: 'Bリンク' },
      { x: 48.5, y: 42, label: 'B出口' },
      { x: 60.3, y: 93, label: 'アタック側スポーン' },
      { x: 60.7, y: 73.1, label: 'アタック側ケイヴ' },
      { x: 63.3, y: 53.3, label: 'Aショート' },
      { x: 60, y: 46.1, label: 'A小部屋' },
      { x: 93.5, y: 49.2, label: 'Aテレポーター' },
      { x: 59.2, y: 31.9, label: 'Aランプ' },
      { x: 75.9, y: 20.1, label: 'Aタワー' },
      { x: 73.1, y: 37.1, label: 'Aサイト' },
      { x: 85.1, y: 41.8, label: 'Aシャワー' },
      { x: 75.9, y: 61.3, label: 'Aロビー' },
      { x: 49.4, y: 59.7, label: 'Aリンク' },
      { x: 60.3, y: 38.8, label: 'A入口' },
      { x: 39, y: 20.3, label: 'CT' },
    ],
  },
  {
    id: 'haven',
    url: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/displayicon.png',
    rotation: -90,
    areaLabels: [
      { x: 7.2, y: 39.8, label: 'ディフェンス側スポーン' },
      { x: 41.4, y: 82.8, label: 'Cサイト' },
      { x: 60.8, y: 77, label: 'C小部屋' },
      { x: 74.4, y: 84.4, label: 'Cロング' },
      { x: 74.3, y: 72.7, label: 'Cロビー' },
      { x: 32.8, y: 66.2, label: 'Cリンク' },
      { x: 41.7, y: 63.1, label: 'Cウィンドウ' },
      { x: 49.3, y: 63, label: 'Cガレージ' },
      { x: 29, y: 49.9, label: 'Bバック' },
      { x: 44.6, y: 49.3, label: 'Bサイト' },
      { x: 67.5, y: 50.1, label: '中央ウィンドウ' },
      { x: 95.9, y: 52, label: 'アタック側スポーン' },
      { x: 61.1, y: 36.8, label: 'Aロビー' },
      { x: 74, y: 36.9, label: 'Aガーデン' },
      { x: 47.6, y: 37.9, label: 'A下水道' },
      { x: 39.6, y: 35, label: 'Aリンク' },
      { x: 42.6, y: 13.4, label: 'Aサイト' },
      { x: 55.8, y: 12.5, label: 'Aロング' },
    ],
  },
  {
    id: 'split',
    url: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/displayicon.png',
    rotation: -90,
    areaLabels: [
      { x: 91.2, y: 54.3, label: 'アタック側スポーン' },
      { x: 62, y: 11.6, label: 'Aロビー' },
      { x: 65.9, y: 30.6, label: '下水道' },
      { x: 50.1, y: 21.2, label: 'Aメイン' },
      { x: 49.6, y: 35, label: 'スロープ' },
      { x: 30.2, y: 26.8, label: 'Aラフター' },
      { x: 26.1, y: 8, label: 'Aサイト' },
      { x: 22.1, y: 14.5, label: 'エルボー' },
      { x: 15.1, y: 21, label: 'スクリーン' },
      { x: 25.6, y: 32.2, label: 'Aタワー' },
      { x: 42.7, y: 44.4, label: 'ベント' },
      { x: 65.3, y: 53.6, label: 'ボトム' },
      { x: 49.5, y: 53.8, label: 'トップ' },
      { x: 44.7, y: 60.6, label: 'メールボックス' },
      { x: 31, y: 61.2, label: '階段' },
      { x: 8.8, y: 54.1, label: 'ディフェンス側スポーン' },
      { x: 40.2, y: 67.7, label: 'Bタワー' },
      { x: 34.7, y: 75.2, label: 'Bラフター' },
      { x: 30, y: 85.1, label: 'Bサイト' },
      { x: 20.7, y: 80.2, label: 'CT' },
      { x: 69.8, y: 79.2, label: 'Bロビー' },
      { x: 55.2, y: 84.1, label: 'ガレージ' },
    ],
  },
];

const SIZE = 1024;

function buildHtml(mapUrl: string, labels: AreaLabel[], rotation = 0): string {
  const labelDivs = labels
    .map(({ x, y, label }) => {
      // Coordinate transform per rotation:
      //  -90deg CCW: left = original_y,       top = 100 - original_x
      //   180deg:    left = 100 - original_x, top = 100 - original_y
      let left: number, top: number;
      if (rotation === -90) {
        left = y;
        top  = 100 - x;
      } else if (rotation === 180) {
        left = 100 - x;
        top  = 100 - y;
      } else {
        left = x;
        top  = y;
      }
      return `
    <div style="
      position:absolute;
      left:${left}%;
      top:${top}%;
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
    </div>`;
    })
    .join('\n');

  const imgStyle = `position:absolute;inset:0;width:100%;height:100%;object-fit:contain;${rotation ? `transform:rotate(${rotation}deg);` : ''}`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:${SIZE}px;height:${SIZE}px;background:#0a1520;overflow:hidden;}
  .wrap{position:relative;width:${SIZE}px;height:${SIZE}px;}
</style>
</head>
<body>
<div class="wrap">
  <img src="${mapUrl}" style="${imgStyle}" />
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

    const html = buildHtml(map.url, map.areaLabels, map.rotation ?? 0);
    await page.setContent(html, { waitUntil: 'networkidle' });

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
