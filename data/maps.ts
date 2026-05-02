import { MapData } from '@/types/quiz';

export const MAPS: MapData[] = [
  {
    id: 'bind',
    name: 'バインド',
    nameEn: 'Bind',
    splash: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png',
    displayIcon: '/maps/bind-labeled.png',
    listViewIcon: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/listviewicon.png',
    sites: 'A・B（TP移動あり）',
  },
  {
    id: 'haven',
    name: 'ヘイヴン',
    nameEn: 'Haven',
    splash: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png',
    displayIcon: '/maps/haven-labeled.png',
    listViewIcon: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/listviewicon.png',
    sites: 'A・B・C（3サイト）',
  },
  {
    id: 'split',
    name: 'スプリット',
    nameEn: 'Split',
    splash: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png',
    displayIcon: '/maps/split-labeled.png',
    listViewIcon: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/listviewicon.png',
    sites: 'A・B（ミッドコントロール重要）',
  },
];

export function getMap(id: string): MapData | undefined {
  return MAPS.find((m) => m.id === id);
}
