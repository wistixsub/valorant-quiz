import { MapData } from '@/types/quiz';

export const MAPS: MapData[] = [
  {
    id: 'bind',
    name: 'バインド',
    nameEn: 'Bind',
    splash: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png',
    displayIcon: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/displayicon.png',
    listViewIcon: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/listviewicon.png',
    sites: 'A・B（TP移動あり）',
    areaLabels: [
      { x: 22, y: 24, label: 'A サイト' },
      { x: 18, y: 16, label: 'ヘブン' },
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
    name: 'ヘイヴン',
    nameEn: 'Haven',
    splash: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png',
    displayIcon: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/displayicon.png',
    listViewIcon: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/listviewicon.png',
    sites: 'A・B・C（3サイト）',
    areaLabels: [
      { x: 25, y: 20, label: 'A サイト' },
      { x: 25, y: 42, label: 'A ロング' },
      { x: 50, y: 22, label: 'B サイト' },
      { x: 50, y: 52, label: 'B ミッド' },
      { x: 74, y: 20, label: 'C サイト' },
      { x: 78, y: 40, label: 'C ロング' },
      { x: 70, y: 54, label: 'C ガレージ' },
    ],
  },
  {
    id: 'split',
    name: 'スプリット',
    nameEn: 'Split',
    splash: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png',
    displayIcon: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/displayicon.png',
    listViewIcon: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/listviewicon.png',
    sites: 'A・B（ミッドコントロール重要）',
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

export function getMap(id: string): MapData | undefined {
  return MAPS.find((m) => m.id === id);
}
