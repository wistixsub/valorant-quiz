export interface AgentInfo {
  nameJa: string;
  icon: string;
}

// エージェント名（英語）→ カタカナ名 + アイコンURL
// アイコンURLは valorant-api.com から取得してハードコード
export const AGENTS: Record<string, AgentInfo> = {
  Jett: {
    nameJa: 'ジェット',
    icon: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png',
  },
  Sage: {
    nameJa: 'セージ',
    icon: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png',
  },
  Reyna: {
    nameJa: 'レイナ',
    icon: 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png',
  },
  Killjoy: {
    nameJa: 'キルジョイ',
    icon: 'https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png',
  },
  Sova: {
    nameJa: 'ソーヴァ',
    icon: 'https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png',
  },
  Omen: {
    nameJa: 'オーメン',
    icon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png',
  },
  Phoenix: {
    nameJa: 'フェニックス',
    icon: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png',
  },
  Raze: {
    nameJa: 'レイズ',
    icon: 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png',
  },
  Cypher: {
    nameJa: 'サイファー',
    icon: 'https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png',
  },
  Breach: {
    nameJa: 'ブリーチ',
    icon: 'https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png',
  },
  Skye: {
    nameJa: 'スカイ',
    icon: 'https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png',
  },
  Viper: {
    nameJa: 'ヴァイパー',
    icon: 'https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png',
  },
  Brimstone: {
    nameJa: 'ブリムストーン',
    icon: 'https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png',
  },
  Astra: {
    nameJa: 'アストラ',
    icon: 'https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png',
  },
  Yoru: {
    nameJa: 'ヨル',
    icon: 'https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png',
  },
  'KAY/O': {
    nameJa: 'ケイオー',
    icon: 'https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png',
  },
  Chamber: {
    nameJa: 'チェンバー',
    icon: 'https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png',
  },
  Neon: {
    nameJa: 'ネオン',
    icon: 'https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png',
  },
  Fade: {
    nameJa: 'フェイド',
    icon: 'https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png',
  },
  Harbor: {
    nameJa: 'ハーバー',
    icon: 'https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png',
  },
  Gekko: {
    nameJa: 'ゲッコ',
    icon: 'https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png',
  },
  Deadlock: {
    nameJa: 'デッドロック',
    icon: 'https://media.valorant-api.com/agents/cc8b54c2-4bf0-4a2a-b11e-4d3e50f8e0b2/displayicon.png',
  },
  Iso: {
    nameJa: 'イソ',
    icon: 'https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png',
  },
  Clove: {
    nameJa: 'クローブ',
    icon: 'https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png',
  },
  Tejo: {
    nameJa: 'テホ',
    icon: 'https://media.valorant-api.com/agents/b444168c-4b90-4a85-a9bc-c7a83816fa56/displayicon.png',
  },
  Vyse: {
    nameJa: 'ヴァイス',
    icon: 'https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png',
  },
};

export function getAgent(name: string): AgentInfo | undefined {
  return AGENTS[name];
}

export function getAgentNameJa(name: string): string {
  return AGENTS[name]?.nameJa ?? name;
}
