import { QUESTIONS } from '@/data/questions';
import { MAPS } from '@/data/maps';

describe('questions データ整合性', () => {
  test('全問にidが存在し重複がない', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(QUESTIONS.length);
  });

  test('全問のmapIdがMAPSに存在する', () => {
    const validMapIds = MAPS.map((m) => m.id);
    QUESTIONS.forEach((q) => {
      expect(validMapIds).toContain(q.map);
    });
  });

  test('全問のcorrectが自問の選択肢idに含まれる', () => {
    QUESTIONS.forEach((q) => {
      const choiceIds = q.choices.map((c) => c.id);
      expect(choiceIds).toContain(q.correct);
    });
  });

  test('全問の選択肢が2〜5個', () => {
    QUESTIONS.forEach((q) => {
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(q.choices.length).toBeLessThanOrEqual(5);
    });
  });

  test('全問のplayerAgentがatk/defのいずれかに含まれる', () => {
    QUESTIONS.forEach((q) => {
      const all = [...q.atk, ...q.def];
      expect(all).toContain(q.playerAgent);
    });
  });

  test('round.timeが M:SS / MM:SS 形式', () => {
    QUESTIONS.forEach((q) => {
      expect(q.round.time).toMatch(/^\d+:\d{2}$/);
    });
  });

  test('diffが1〜3の範囲', () => {
    QUESTIONS.forEach((q) => {
      expect([1, 2, 3]).toContain(q.diff);
    });
  });
});

describe('survival データ整合性', () => {
  const questionsWithSurvival = QUESTIONS.filter((q) => q.survival);

  test('survivalのatk配列がチームのatk配列の部分集合', () => {
    questionsWithSurvival.forEach((q) => {
      q.survival!.atk.forEach((ag) => {
        expect(q.atk).toContain(ag);
      });
    });
  });

  test('survivalのdef配列がチームのdef配列の部分集合', () => {
    questionsWithSurvival.forEach((q) => {
      q.survival!.def.forEach((ag) => {
        expect(q.def).toContain(ag);
      });
    });
  });

  test('survivalの人数がチーム人数以下', () => {
    questionsWithSurvival.forEach((q) => {
      expect(q.survival!.atk.length).toBeLessThanOrEqual(q.atk.length);
      expect(q.survival!.def.length).toBeLessThanOrEqual(q.def.length);
    });
  });

  test('survivalに重複エージェントがない', () => {
    questionsWithSurvival.forEach((q) => {
      expect(new Set(q.survival!.atk).size).toBe(q.survival!.atk.length);
      expect(new Set(q.survival!.def).size).toBe(q.survival!.def.length);
    });
  });
});

describe('marker データ整合性', () => {
  const questionsWithMarkers = QUESTIONS.filter((q) => q.markers?.length);

  test('marker座標が0〜100の範囲内', () => {
    questionsWithMarkers.forEach((q) => {
      q.markers!.forEach((m) => {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThanOrEqual(100);
        expect(m.y).toBeGreaterThanOrEqual(0);
        expect(m.y).toBeLessThanOrEqual(100);
      });
    });
  });

  test('markerのtypeが有効な値', () => {
    const validTypes = ['enemy', 'ally', 'unknown', 'skill', 'spike'];
    questionsWithMarkers.forEach((q) => {
      q.markers!.forEach((m) => {
        expect(validTypes).toContain(m.type);
      });
    });
  });

  test('markerのlabelが空でない', () => {
    questionsWithMarkers.forEach((q) => {
      q.markers!.forEach((m) => {
        expect(m.label.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
