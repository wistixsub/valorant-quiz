"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { getMap } from "@/data/maps";
import { getQuestionsByMap } from "@/data/questions";
import { getAgent, getAgentNameJa } from "@/data/agents";
import { Question } from "@/types/quiz";
import MapOverlay from "./MapOverlay";

const DIFF_LABEL: Record<number, string> = { 1: "初級", 2: "中級", 3: "上級" };
const DIFF_COLOR: Record<number, string> = {
  1: "var(--green)",
  2: "var(--yellow)",
  3: "var(--red)",
};
const RANK_THRESHOLDS = [
  { min: 100, label: "Radiant", color: "#FFD700" },
  { min: 80, label: "Immortal", color: "#FF4655" },
  { min: 60, label: "Diamond", color: "#9966FF" },
  { min: 40, label: "Platinum", color: "#4BC8E8" },
  { min: 20, label: "Gold", color: "var(--yellow)" },
  { min: 0, label: "Iron", color: "var(--gray)" },
];

function getRank(pct: number) {
  return RANK_THRESHOLDS.find((r) => pct >= r.min) ?? RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// エージェントバッジ（アイコン + カタカナ名）
function AgentBadge({ name, size = 24 }: { name: string; size?: number }) {
  const info = getAgent(name);
  const nameJa = getAgentNameJa(name);
  return (
    <span className="inline-flex items-center gap-1">
      {info && (
        <Image
          src={info.icon}
          alt={name}
          width={size}
          height={size}
          className="rounded-full"
          style={{ objectFit: "cover" }}
          unoptimized
        />
      )}
      <span>{nameJa}</span>
    </span>
  );
}

// プレイヤー操作キャラ・立場バナー
function PlayerBanner({ playerAgent, playerSide }: { playerAgent: string; playerSide: "attack" | "defense" }) {
  const isAttack = playerSide === "attack";
  const info = getAgent(playerAgent);
  const nameJa = getAgentNameJa(playerAgent);

  return (
    <div
      className="flex items-center gap-3 rounded px-4 py-2"
      style={{
        background: isAttack ? "rgba(255,70,85,0.12)" : "rgba(82,229,164,0.10)",
        border: `2px solid ${isAttack ? "rgba(255,70,85,0.45)" : "rgba(82,229,164,0.40)"}`,
      }}
    >
      {/* キャラアイコン */}
      {info && (
        <div
          className="rounded-full overflow-hidden flex-shrink-0"
          style={{
            position: "relative",
            width: 40,
            height: 40,
            border: `2px solid ${isAttack ? "#FF4655" : "#52E5A4"}`,
          }}
        >
          <Image
            src={info.icon}
            alt={playerAgent}
            fill
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </div>
      )}

      {/* テキスト情報 */}
      <div className="flex flex-col">
        <p className="text-xs" style={{ color: "var(--gray)" }}>あなたの操作キャラ</p>
        <p className="text-sm font-black" style={{ color: isAttack ? "#FF4655" : "#52E5A4" }}>
          {nameJa}
        </p>
      </div>

      {/* 立場バッジ */}
      <div className="ml-auto flex-shrink-0">
        <span
          className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded"
          style={{
            background: isAttack ? "#FF4655" : "#52E5A4",
            color: "#fff",
            letterSpacing: "0.05em",
          }}
        >
          {isAttack ? "🗡️ 攻撃" : "🛡️ 防衛"}
        </span>
      </div>
    </div>
  );
}

export default function QuizClient() {
  const params = useSearchParams();
  const router = useRouter();
  const mapId = params.get("map") ?? "bind";
  const map = getMap(mapId);
  const [questions] = useState<Question[]>(() => shuffle(getQuestionsByMap(mapId)));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ id: number; correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const rightColRef = useRef<HTMLDivElement>(null);

  const q = questions[idx];
  const answered = selected !== null;
  const score = answers.filter((a) => a.correct).length;
  const pct = done ? Math.round((score / questions.length) * 100) : 0;
  const rank = getRank(pct);

  // Topbar の高さ → --topbar-h
  // Topbar + Progressbar の合計高さ → --header-total-h
  // これらを sticky の top 値として使用する
  useEffect(() => {
    function updateHeaderHeight() {
      const topbar = document.getElementById("quiz-topbar");
      const progressbar = document.getElementById("quiz-progressbar");
      const topbarH = topbar?.offsetHeight ?? 0;
      const totalH = topbarH + (progressbar?.offsetHeight ?? 0);
      document.documentElement.style.setProperty("--topbar-h", `${topbarH}px`);
      document.documentElement.style.setProperty("--header-total-h", `${totalH}px`);
    }
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  const handleSelect = useCallback(
    (choiceId: string) => {
      if (answered) return;
      setSelected(choiceId);
      setAnswers((prev) => [...prev, { id: q.id, correct: choiceId === q.correct }]);
    },
    [answered, q]
  );

  const handleNext = useCallback(() => {
    if (idx + 1 >= questions.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      window.scrollTo(0, 0);
      if (rightColRef.current) rightColRef.current.scrollTop = 0;
    }
  }, [idx, questions.length]);

  if (!map) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
        <p style={{ color: "var(--red)" }}>マップが見つかりません</p>
      </div>
    );
  }

  // ===== RESULT SCREEN =====
  if (done) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Topbar */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
          style={{ background: "var(--surface)", borderBottom: "2px solid var(--red)" }}
        >
          <span className="text-sm font-black tracking-widest uppercase" style={{ color: "var(--red)" }}>
            VALORANT
          </span>
          <span className="text-xs tracking-wider uppercase" style={{ color: "var(--gray)" }}>
            論理テスト
          </span>
          <button
            onClick={() => router.push("/")}
            className="ml-auto text-xs px-3 py-1 rounded transition"
            style={{ border: "1px solid var(--border)", color: "var(--gray)" }}
          >
            ← ホーム
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Score */}
          <div className="text-center mb-8">
            <div
              className="inline-block px-10 py-6 rounded mb-4"
              style={{ background: "var(--surface)", border: `2px solid ${rank.color}` }}
            >
              <p className="text-5xl font-black mb-1" style={{ color: rank.color }}>
                {score}
                <span className="text-2xl" style={{ color: "var(--gray)" }}>
                  /{questions.length}
                </span>
              </p>
              <p className="text-lg font-black tracking-widest uppercase" style={{ color: rank.color }}>
                {rank.label}
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--gray)" }}>
              {map.name} — {pct}%
            </p>
          </div>

          {/* Review */}
          <div className="flex flex-col gap-3 mb-6">
            {questions.map((question, i) => {
              const ans = answers.find((a) => a.id === question.id);
              const isCorrect = ans?.correct ?? false;
              return (
                <div
                  key={question.id}
                  className="rounded overflow-hidden"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg">{isCorrect ? "✅" : "❌"}</span>
                    <span className="text-xs" style={{ color: "var(--gray)" }}>
                      Q{i + 1}
                    </span>
                    <span className="text-sm flex-1">{question.title}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                      style={{ background: "var(--surface2)", color: DIFF_COLOR[question.diff] }}
                    >
                      {DIFF_LABEL[question.diff]}
                    </span>
                  </div>
                  <div
                    className="px-4 pb-3 text-xs"
                    style={{ color: "var(--gray)", borderTop: "1px solid var(--border)" }}
                  >
                    <p className="mt-2">
                      <span style={{ color: isCorrect ? "var(--green)" : "var(--red)" }}>
                        {isCorrect ? "正解" : "不正解"}
                      </span>
                      　正解:{" "}
                      <span style={{ color: "var(--white)" }}>
                        {question.choices.find((c) => c.id === question.correct)?.text}
                      </span>
                    </p>
                    <p className="mt-1 leading-relaxed">{question.expl}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIdx(0);
                setSelected(null);
                setAnswers([]);
                setDone(false);
              }}
              className="flex-1 py-3 rounded font-bold text-sm tracking-wider uppercase transition"
              style={{ background: "var(--red)", color: "var(--white)", border: "none", cursor: "pointer" }}
            >
              もう一度
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-3 rounded text-sm transition"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--gray)",
                cursor: "pointer",
              }}
            >
              マップ選択へ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== QUIZ SCREEN =====
  return (
    <div className="flex flex-col" style={{ background: "var(--bg)", minHeight: "100svh" }}>
      {/* Topbar — sticky, z-20 */}
      <div
        id="quiz-topbar"
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
        style={{ background: "var(--surface)", borderBottom: "2px solid var(--red)" }}
      >
        <span className="text-sm font-black tracking-widest uppercase" style={{ color: "var(--red)" }}>
          VALORANT
        </span>
        <span className="text-xs tracking-wider uppercase" style={{ color: "var(--gray)" }}>
          論理テスト
        </span>
        <button
          onClick={() => router.push("/")}
          className="ml-auto text-xs px-3 py-1 rounded transition"
          style={{ border: "1px solid var(--border)", color: "var(--gray)" }}
        >
          ← ホーム
        </button>
      </div>

      {/* Progress bar — sticky, z-20 */}
      <div
        id="quiz-progressbar"
        className="sticky z-20 flex items-center gap-3 px-4 py-2"
        style={{ top: "var(--topbar-h, 49px)", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-xs font-bold" style={{ color: "var(--red)", minWidth: 48 }}>
          Q{idx + 1}/{questions.length}
        </span>
        <div className="flex-1 h-1.5 rounded" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded transition-all duration-300"
            style={{ background: "var(--red)", width: `${((idx + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: "var(--surface2)", color: "var(--white)" }}
          >
            {map.name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: q.side === "attack" ? "rgba(255,70,85,0.13)" : "rgba(82,229,164,0.12)",
              color: q.side === "attack" ? "var(--red)" : "var(--green)",
            }}
          >
            {q.side === "attack" ? "攻撃" : "防衛"}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: "var(--surface2)", color: DIFF_COLOR[q.diff] }}
          >
            {DIFF_LABEL[q.diff]}
          </span>
        </div>
      </div>

      {/*
        ===== BODY AREA =====
        PC (md+)  : flex-row 2カラム・高さ固定 (.quiz-body-wrapper)。右列のみスクロール
        スマホ    : 縦積み・自然スクロール（overflow:hidden なし）
      */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden quiz-body-wrapper">

        {/* ---- 左カラム(PC) / 上部(スマホ): マップオーバーレイ ---- */}
        <div className="md:w-1/2 md:flex-shrink-0 md:overflow-hidden md:flex md:flex-col px-3 pt-3 pb-1 md:pb-3">
          <MapOverlay
            key={q.id}
            map={map}
            markers={q.markers}
            playerSide={q.playerSide}
            className="quiz-map-overlay flex-1"
          />
        </div>

        {/* ---- 右カラム(PC) / 下部(スマホ): 問題コンテンツ ---- */}
        <div
          ref={rightColRef}
          className="flex-1 md:overflow-y-auto px-3 py-4 flex flex-col gap-3"
        >
          {/* 操作キャラ・立場バナー */}
          <PlayerBanner playerAgent={q.playerAgent} playerSide={q.playerSide} />

          {/* Round info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "ラウンド", value: `R${q.round.r}` },
              { label: "残り時間", value: q.round.time },
              { label: "前ラウンド", value: q.round.prev === "win" ? "WIN" : "LOSE" },
              { label: "スパイク", value: q.round.spike ? "保持あり" : "なし" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded p-2"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs" style={{ color: "var(--gray)" }}>
                  {item.label}
                </p>
                <p className="text-sm font-bold" style={{ color: "var(--white)" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Survival & Buy */}
          {(q.survival || q.buy) && (
            <div className="grid grid-cols-2 gap-2">
              {q.survival && (
                <div
                  className="rounded p-2"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs mb-1.5" style={{ color: "var(--gray)" }}>生存状況</p>
                  <div className="flex flex-col gap-1.5">
                    {/* 攻撃側 */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: "var(--red)", minWidth: 14 }}>攻</span>
                      <div className="flex items-center gap-0.5 flex-wrap">
                        {q.survival.atk.map((ag) => {
                          const info = getAgent(ag);
                          return info ? (
                            <Image key={ag} src={info.icon} alt={ag} width={18} height={18} className="rounded-full flex-shrink-0" style={{ objectFit: "cover" }} unoptimized />
                          ) : null;
                        })}
                      </div>
                      <span className="text-xs font-bold" style={{ color: "var(--red)" }}>{q.survival.atk.length}人</span>
                    </div>
                    {/* 防衛側 */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: "var(--green)", minWidth: 14 }}>守</span>
                      <div className="flex items-center gap-0.5 flex-wrap">
                        {q.survival.def.map((ag) => {
                          const info = getAgent(ag);
                          return info ? (
                            <Image key={ag} src={info.icon} alt={ag} width={18} height={18} className="rounded-full flex-shrink-0" style={{ objectFit: "cover" }} unoptimized />
                          ) : null;
                        })}
                      </div>
                      <span className="text-xs font-bold" style={{ color: "var(--green)" }}>{q.survival.def.length}人</span>
                    </div>
                  </div>
                </div>
              )}
              {q.buy && (
                <div
                  className="rounded p-2"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs mb-1" style={{ color: "var(--gray)" }}>BUY状況</p>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold" style={{ color: "var(--red)" }}>
                      攻 {q.buy.atk}
                    </span>
                    <span className="text-xs font-bold" style={{ color: "var(--green)" }}>
                      守 {q.buy.def}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Agent compositions */}
          <div
            className="rounded p-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex flex-col gap-2">
              {/* 攻撃側 */}
              <div className="flex items-start gap-2 flex-wrap">
                <span
                  className="text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ color: "var(--red)", minWidth: 28 }}
                >
                  攻撃
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {q.atk.map((ag) => {
                    const info = getAgent(ag);
                    const nameJa = getAgentNameJa(ag);
                    return (
                      <span
                        key={ag}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(255,70,85,0.13)",
                          color: "var(--red)",
                          border: "1px solid rgba(255,70,85,0.25)",
                        }}
                      >
                        {info && (
                          <Image
                            src={info.icon}
                            alt={ag}
                            width={16}
                            height={16}
                            className="rounded-full"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        )}
                        {nameJa}
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* 防衛側 */}
              <div className="flex items-start gap-2 flex-wrap">
                <span
                  className="text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ color: "var(--green)", minWidth: 28 }}
                >
                  防衛
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {q.def.map((ag) => {
                    const info = getAgent(ag);
                    const nameJa = getAgentNameJa(ag);
                    return (
                      <span
                        key={ag}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(82,229,164,0.12)",
                          color: "var(--green)",
                          border: "1px solid rgba(82,229,164,0.25)",
                        }}
                      >
                        {info && (
                          <Image
                            src={info.icon}
                            alt={ag}
                            width={16}
                            height={16}
                            className="rounded-full"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        )}
                        {nameJa}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div
            className="rounded p-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gray)" }}>
              タイムライン
            </p>
            <div className="flex flex-col gap-1.5">
              {q.timeline.map((ev, i) => (
                <div key={i} className="flex gap-2 text-xs items-start">
                  <span className="font-mono flex-shrink-0 mt-0.5" style={{ color: "var(--gray)", minWidth: 36 }}>
                    {ev.t}
                  </span>
                  <span
                    className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded font-bold text-center"
                    style={{
                      fontSize: 9,
                      minWidth: 28,
                      background: ev.team === "atk" ? "rgba(255,70,85,0.18)" : "rgba(82,229,164,0.15)",
                      color: ev.team === "atk" ? "var(--red)" : "var(--green)",
                    }}
                  >
                    {ev.team === (q.playerSide === "attack" ? "atk" : "def") ? "味方" : "敵"}
                  </span>
                  <span
                    className="font-bold flex-shrink-0"
                    style={{
                      color: ev.team === "atk" ? "var(--red)" : "var(--green)",
                      minWidth: 56,
                    }}
                  >
                    {getAgentNameJa(ev.ag)}
                  </span>
                  <span style={{ color: "var(--white)" }}>{ev.ac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Situation */}
          <div
            className="rounded p-3 text-sm leading-relaxed"
            style={{
              background: "var(--surface2)",
              borderLeft: "3px solid var(--red)",
              color: "var(--white)",
              opacity: 0.9,
            }}
          >
            {q.situation}
          </div>

          {/* Question */}
          <p className="text-base font-bold leading-relaxed" style={{ color: "var(--white)" }}>
            {q.question}
          </p>

          {/* Choices */}
          <div className="flex flex-col gap-2">
            {q.choices.map((c) => {
              const isCorrect = c.id === q.correct;
              const isSelected = c.id === selected;
              let cls = "choice-btn";
              if (answered) {
                if (isCorrect) cls += " choice-correct";
                else if (isSelected) cls += " choice-wrong";
              }
              return (
                <button key={c.id} className={cls} disabled={answered} onClick={() => handleSelect(c.id)}>
                  <span className="font-bold text-sm mt-0.5 min-w-5 flex-shrink-0" style={{ color: "var(--red)" }}>
                    {c.id.toUpperCase()}
                  </span>
                  <span className="text-sm leading-snug flex-1">{c.text}</span>
                  {answered && isCorrect && (
                    <span
                      className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded ml-1"
                      style={{ background: "var(--green)", color: "#0F1923" }}
                    >
                      正解
                    </span>
                  )}
                  {answered && isSelected && !isCorrect && (
                    <span
                      className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded ml-1"
                      style={{ background: "var(--red)", color: "#fff" }}
                    >
                      不正解
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div
              className="rounded p-3 text-sm leading-relaxed"
              style={{ background: "var(--surface)", borderLeft: "3px solid var(--green)", color: "var(--gray)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--green)" }}>
                解説
              </p>
              {q.expl}
              <p className="text-xs mt-2" style={{ color: "var(--gray)", opacity: 0.5 }}>
                ※ 現在の正解は暫定設定です。v2以降、コミュニティの回答データをもとに定期更新される予定です。
              </p>
            </div>
          )}

          {/* Next button */}
          {answered && (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded font-bold text-sm tracking-wider uppercase transition"
              style={{ background: "var(--red)", color: "var(--white)", border: "none", cursor: "pointer" }}
            >
              {idx + 1 >= questions.length ? "結果を見る" : "次の問題"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
