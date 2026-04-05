export type Side = 'attack' | 'defense';
export type MapId = 'bind' | 'haven' | 'split';
export type Difficulty = 1 | 2 | 3;

export interface TimelineEvent {
  t: string;
  ag: string;
  team: 'atk' | 'def';
  ac: string;
}

export interface Choice {
  id: string;
  text: string;
}

export interface MapMarker {
  x: number;   // % (0-100) from left
  y: number;   // % (0-100) from top
  type: 'enemy' | 'ally' | 'unknown' | 'skill' | 'spike';
  label: string;
  confirmed?: boolean; // false = ?表示
}

export interface Question {
  id: number;
  map: MapId;
  side: Side;
  playerAgent: string;
  playerSide: 'attack' | 'defense';
  title: string;
  diff: Difficulty;
  round: { r: number; time: string; prev: 'win' | 'lose'; spike: boolean };
  atk: string[];
  def: string[];
  timeline: TimelineEvent[];
  situation: string;
  question: string;
  choices: Choice[];
  correct: string;
  expl: string;
  markers?: MapMarker[];
  survival?: { atk: string[]; def: string[] };
  buy?: { atk: string; def: string };
}

export interface MapAreaLabel {
  x: number;   // % from left
  y: number;   // % from top
  label: string;
}

export interface MapData {
  id: MapId;
  name: string;
  nameEn: string;
  splash: string;
  displayIcon: string;
  listViewIcon: string;
  sites: string;
  areaLabels?: MapAreaLabel[];
}
