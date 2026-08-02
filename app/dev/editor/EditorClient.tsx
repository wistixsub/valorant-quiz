"use client";

import { useState, useRef, useEffect } from "react";
import { QUESTIONS } from "@/data/questions";
import { MAPS } from "@/data/maps";
import { MapMarker } from "@/types/quiz";

// ── 定数 ────────────────────────────────────────────────────
const MARKER_COLORS: Record<MapMarker["type"], string> = {
  enemy: "#FF4655",
  ally: "#52E5A4",
  unknown: "#C4C4C4",
  skill: "#FFD700",
  spike: "#FF8C00",
};
const MARKER_SYMBOLS: Record<MapMarker["type"], string> = {
  enemy: "×", ally: "●", unknown: "?", skill: "◆", spike: "★",
};
const TYPE_LABELS: Record<MapMarker["type"], string> = {
  enemy: "敵", ally: "味方", unknown: "不明", skill: "スキル", spike: "スパイク",
};

// ── ContainOffset (MapOverlay.tsx と同じロジック) ───────────
interface ContainOffset { leftPct: number; topPct: number; wPct: number; hPct: number; }

function computeContainOffset(cw: number, ch: number): ContainOffset {
  if (cw <= 0 || ch <= 0) return { leftPct: 0, topPct: 0, wPct: 1, hPct: 1 };
  const aspect = cw / ch; // map PNG は正方形 (aspect=1)
  if (aspect > 1) {
    const wPct = ch / cw;
    return { leftPct: (1 - wPct) / 2, topPct: 0, wPct, hPct: 1 };
  }
  const hPct = cw / ch;
  return { leftPct: 0, topPct: (1 - hPct) / 2, wPct: 1, hPct };
}

// ── スタイル定数 ─────────────────────────────────────────────
const BG = "#0F1923";
const SURFACE = "#161f27";
const SURFACE2 = "#1a252e";
const BORDER = "#2d3f4a";
const GRAY = "#8b9ba8";
const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", marginTop: 4,
  background: "#0a1520", border: `1px solid ${BORDER}`,
  color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 12,
};

// ── メインコンポーネント ──────────────────────────────────────
export default function EditorClient() {
  const questionsByMap = MAPS.map((m) => ({
    map: m,
    questions: QUESTIONS.filter((q) => q.map === m.id),
  }));

  const [selectedQId, setSelectedQId] = useState<number | null>(null);
  const [editMarkers, setEditMarkers] = useState<MapMarker[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [newType, setNewType] = useState<MapMarker["type"]>("ally");
  const [newLabel, setNewLabel] = useState("");
  const [newConfirmed, setNewConfirmed] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<ContainOffset>({ leftPct: 0, topPct: 0, wPct: 1, hPct: 1 });
  const dragRef = useRef<{ idx: number; offsetX: number; offsetY: number } | null>(null);

  const selectedQ = selectedQId !== null ? QUESTIONS.find((q) => q.id === selectedQId) ?? null : null;
  const selectedMap = selectedQ ? MAPS.find((m) => m.id === selectedQ.map) ?? null : null;
  const selectedMarker = selectedIdx !== null ? editMarkers[selectedIdx] ?? null : null;

  // ResizeObserver でコンテナサイズ・letterbox オフセットを追跡
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setContainerSize({ w, h });
      const off = computeContainOffset(w, h);
      offsetRef.current = off;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedQId]);

  // 問題選択
  const selectQuestion = (id: number) => {
    const q = QUESTIONS.find((q) => q.id === id);
    if (!q) return;
    setSelectedQId(id);
    setEditMarkers(q.markers ? q.markers.map((m) => ({ ...m })) : []);
    setSelectedIdx(null);
    setAddMode(false);
    setSaveStatus("idle");
  };

  // データ座標 → スクリーン座標
  const toSx = (dataX: number) =>
    (offsetRef.current.leftPct + (dataX / 100) * offsetRef.current.wPct) * containerSize.w;
  const toSy = (dataY: number) =>
    (offsetRef.current.topPct + (dataY / 100) * offsetRef.current.hPct) * containerSize.h;

  // スクリーン座標 → データ座標
  const toData = (sx: number, sy: number) => {
    const off = offsetRef.current;
    const { w, h } = containerSize;
    const x = parseFloat(Math.max(0, Math.min(100, ((sx / w) - off.leftPct) / off.wPct * 100)).toFixed(1));
    const y = parseFloat(Math.max(0, Math.min(100, ((sy / h) - off.topPct) / off.hPct * 100)).toFixed(1));
    return { x, y };
  };

  // マップクリック / マーカーヒットテスト
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // ヒットテスト（後ろから検索して最前面を優先）
    const HIT_R = 16;
    let hitIdx = -1;
    for (let i = editMarkers.length - 1; i >= 0; i--) {
      const dist = Math.hypot(cx - toSx(editMarkers[i].x), cy - toSy(editMarkers[i].y));
      if (dist <= HIT_R) { hitIdx = i; break; }
    }

    if (hitIdx >= 0) {
      setSelectedIdx(hitIdx);
      setAddMode(false);
      dragRef.current = {
        idx: hitIdx,
        offsetX: cx - toSx(editMarkers[hitIdx].x),
        offsetY: cy - toSy(editMarkers[hitIdx].y),
      };
      return;
    }

    if (addMode && newLabel.trim()) {
      const { x, y } = toData(cx, cy);
      const nm: MapMarker = { x, y, type: newType, label: newLabel.trim(), confirmed: newConfirmed };
      setEditMarkers((prev) => {
        const next = [...prev, nm];
        setSelectedIdx(next.length - 1);
        return next;
      });
      setAddMode(false);
      return;
    }

    setSelectedIdx(null);
  };

  // グローバル mousemove / mouseup（ドラッグ）
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const { idx, offsetX, offsetY } = dragRef.current;
      const { x, y } = toData(cx - offsetX, cy - offsetY);
      setEditMarkers((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], x, y };
        return next;
      });
    };
    const onUp = () => { dragRef.current = null; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize]);

  // 選択マーカー更新
  const updateMarker = (patch: Partial<MapMarker>) => {
    if (selectedIdx === null) return;
    setEditMarkers((prev) => {
      const next = [...prev];
      next[selectedIdx] = { ...next[selectedIdx], ...patch };
      return next;
    });
  };

  // 保存
  const handleSave = async () => {
    if (!selectedQ) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/dev/save-markers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: selectedQ.id, markers: editMarkers }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "save failed");
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus("error");
    }
  };

  // JSON コピー
  const handleCopy = () => {
    const lines = editMarkers
      .map((m) => {
        const x = parseFloat(m.x.toFixed(1));
        const y = parseFloat(m.y.toFixed(1));
        return `      { x: ${x}, y: ${y}, type: '${m.type}', label: '${m.label}', confirmed: ${m.confirmed !== false} },`;
      })
      .join("\n");
    navigator.clipboard.writeText(`    markers: [\n${lines}\n    ],`);
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, color: "#e6edf3", fontFamily: "'Yu Gothic', 'Meiryo', sans-serif", overflow: "hidden" }}>

      {/* ヘッダー */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", background: SURFACE2, borderBottom: "2px solid #FF4655", flexShrink: 0 }}>
        <span style={{ color: "#FF4655", fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>VALORANT</span>
        <span style={{ color: GRAY, fontSize: 11 }}>マーカーエディタ（開発用）</span>
        {selectedQ && (
          <span style={{ marginLeft: 8, color: "#FFD700", fontSize: 11, fontFamily: "monospace" }}>
            ID:{selectedQ.id} | {selectedMap?.nameEn} | {selectedQ.playerAgent} ({selectedQ.side === "attack" ? "攻め" : "守り"})
          </span>
        )}
        {selectedQ && (
          <a
            href={`/quiz?map=${selectedQ.map}&debug=${selectedQ.id}`}
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: "auto", fontSize: 11, color: GRAY, textDecoration: "none", border: `1px solid ${BORDER}`, padding: "2px 8px", borderRadius: 4 }}
          >
            クイズで確認 ↗
          </a>
        )}
      </div>

      {/* ボディ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* 左: 問題リスト */}
        <div style={{ width: 210, background: SURFACE, borderRight: `1px solid ${BORDER}`, overflowY: "auto", flexShrink: 0 }}>
          {questionsByMap.map(({ map, questions }) => (
            <div key={map.id}>
              <div style={{ padding: "7px 12px", fontSize: 10, fontWeight: 700, color: "#FF4655", letterSpacing: 1, background: SURFACE2, borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, textTransform: "uppercase" }}>
                {map.nameEn}
              </div>
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => selectQuestion(q.id)}
                  style={{
                    padding: "7px 12px", cursor: "pointer", fontSize: 12,
                    background: q.id === selectedQId ? "rgba(255,70,85,0.13)" : "transparent",
                    borderLeft: `3px solid ${q.id === selectedQId ? "#FF4655" : "transparent"}`,
                    color: q.id === selectedQId ? "#fff" : GRAY,
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span style={{ color: "#FF4655", fontFamily: "monospace", fontSize: 11, minWidth: 24 }}>Q{q.id}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.playerAgent}</span>
                  <span style={{ fontSize: 9, color: q.side === "attack" ? "#FF4655" : "#52E5A4", flexShrink: 0 }}>
                    {q.side === "attack" ? "攻" : "守"}
                  </span>
                  {q.markers && q.markers.length > 0 && (
                    <span style={{ fontSize: 9, color: GRAY, flexShrink: 0 }}>{q.markers.length}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 中央: マップ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {selectedQ && selectedMap ? (
            <>
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                style={{
                  flex: 1,
                  position: "relative",
                  background: "#0a1520",
                  cursor: addMode && newLabel.trim() ? "crosshair" : "default",
                  userSelect: "none",
                  overflow: "hidden",
                }}
              >
                {/* マップ画像 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedMap.displayIcon}
                  alt={selectedMap.nameEn}
                  draggable={false}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                />

                {/* マーカー */}
                {editMarkers.map((m, i) => {
                  const sx = toSx(m.x);
                  const sy = toSy(m.y);
                  const color = MARKER_COLORS[m.type];
                  const isSel = i === selectedIdx;
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: sx,
                        top: sy,
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: isSel ? 20 : 10,
                        pointerEvents: "none",
                      }}
                    >
                      {/* 座標ラベル（選択中のみ） */}
                      {isSel && (
                        <div style={{ position: "absolute", top: -20, fontSize: 9, color: "#FFD700", background: "rgba(0,0,0,0.85)", padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap", fontFamily: "monospace" }}>
                          ({m.x}, {m.y})
                        </div>
                      )}
                      {/* ドット */}
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: m.confirmed === false ? "transparent" : color,
                        border: `2px solid ${color}`,
                        boxShadow: isSel ? `0 0 0 3px #fff, 0 0 12px ${color}` : `0 0 6px ${color}bb`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: m.confirmed === false ? color : "#fff",
                        fontSize: 10, fontWeight: 700,
                      }}>
                        {m.confirmed === false ? "?" : MARKER_SYMBOLS[m.type]}
                      </div>
                      {/* ラベル */}
                      <div style={{
                        marginTop: 2, fontSize: 9, color, background: "rgba(5,10,18,0.92)",
                        border: `1px solid ${color}55`, padding: "1px 4px", borderRadius: 2,
                        whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {m.label}
                      </div>
                    </div>
                  );
                })}

                {/* 追加モード中のガイド */}
                {addMode && (
                  <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", background: "rgba(82,229,164,0.15)", border: "1px solid #52E5A4", color: "#52E5A4", padding: "4px 12px", borderRadius: 4, fontSize: 11, pointerEvents: "none", whiteSpace: "nowrap" }}>
                    ✚ マップ上をクリックして「{newLabel}」を配置
                  </div>
                )}
              </div>

              {/* ボトムバー */}
              <div style={{ padding: "8px 12px", background: SURFACE2, borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  style={{
                    padding: "5px 14px",
                    background: saveStatus === "saved" ? "#238636" : saveStatus === "error" ? "#b42b2b" : "#FF4655",
                    border: "none", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  }}
                >
                  {saveStatus === "saving" ? "保存中..." : saveStatus === "saved" ? "✓ 保存済み" : saveStatus === "error" ? "❌ エラー" : "💾 questions.ts に保存"}
                </button>
                <button
                  onClick={handleCopy}
                  style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${BORDER}`, color: GRAY, borderRadius: 4, cursor: "pointer", fontSize: 12 }}
                >
                  📋 JSON コピー
                </button>
                <span style={{ marginLeft: "auto", fontSize: 11, color: GRAY, fontFamily: "monospace" }}>
                  マーカー {editMarkers.length} 個
                </span>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: GRAY, fontSize: 13 }}>
              左のリストから問題を選択してください
            </div>
          )}
        </div>

        {/* 右: マーカー編集パネル */}
        {selectedQ && (
          <div style={{ width: 260, background: SURFACE, borderLeft: `1px solid ${BORDER}`, padding: 12, overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* 選択中マーカーの編集 */}
            <section>
              <div style={{ fontSize: 10, color: "#FF4655", fontWeight: 700, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
                {selectedMarker ? "選択中のマーカー" : "マーカーを選択"}
              </div>
              {selectedMarker ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, color: GRAY }}>
                    種類
                    <select value={selectedMarker.type} onChange={(e) => updateMarker({ type: e.target.value as MapMarker["type"] })} style={inputStyle}>
                      {(Object.keys(TYPE_LABELS) as MapMarker["type"][]).map((t) => (
                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ fontSize: 11, color: GRAY }}>
                    ラベル
                    <input value={selectedMarker.label} onChange={(e) => updateMarker({ label: e.target.value })} style={inputStyle} />
                  </label>
                  <label style={{ fontSize: 11, color: GRAY, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedMarker.confirmed !== false} onChange={(e) => updateMarker({ confirmed: e.target.checked })} />
                    confirmed（確定情報）
                  </label>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#FFD700", background: "#0a1520", padding: "4px 8px", borderRadius: 4 }}>
                    x: {selectedMarker.x}, y: {selectedMarker.y}
                  </div>
                  <div style={{ fontSize: 10, color: GRAY }}>ドラッグで移動できます</div>
                  <button
                    onClick={() => { setEditMarkers((p) => p.filter((_, i) => i !== selectedIdx)); setSelectedIdx(null); }}
                    style={{ padding: "5px", background: "transparent", border: "1px solid #FF4655", color: "#FF4655", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
                  >
                    🗑 削除
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "#6e7681" }}>マップ上のマーカーをクリック</div>
              )}
            </section>

            <div style={{ borderTop: `1px solid ${BORDER}` }} />

            {/* マーカー追加 */}
            <section>
              <div style={{ fontSize: 10, color: "#52E5A4", fontWeight: 700, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>マーカーを追加</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, color: GRAY }}>
                  種類
                  <select value={newType} onChange={(e) => setNewType(e.target.value as MapMarker["type"])} style={inputStyle}>
                    {(Object.keys(TYPE_LABELS) as MapMarker["type"][]).map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </label>
                <label style={{ fontSize: 11, color: GRAY }}>
                  ラベル
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="例: あなた（チェンバー）"
                    style={inputStyle}
                  />
                </label>
                <label style={{ fontSize: 11, color: GRAY, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={newConfirmed} onChange={(e) => setNewConfirmed(e.target.checked)} />
                  confirmed
                </label>
                <button
                  onClick={() => { if (newLabel.trim()) setAddMode((v) => !v); }}
                  disabled={!newLabel.trim()}
                  style={{
                    padding: "6px 12px",
                    background: addMode ? "#52E5A4" : "transparent",
                    border: `1px solid ${addMode ? "#52E5A4" : BORDER}`,
                    color: addMode ? "#0F1923" : GRAY,
                    borderRadius: 4, cursor: newLabel.trim() ? "pointer" : "not-allowed",
                    fontSize: 12, fontWeight: addMode ? 700 : 400,
                  }}
                >
                  {addMode ? "🖱 マップをクリックして配置" : "追加モード ON"}
                </button>
              </div>
            </section>

            <div style={{ borderTop: `1px solid ${BORDER}` }} />

            {/* マーカー一覧 */}
            <section>
              <div style={{ fontSize: 10, color: GRAY, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>一覧 ({editMarkers.length})</div>
              {editMarkers.length === 0 ? (
                <div style={{ fontSize: 11, color: "#6e7681" }}>なし</div>
              ) : (
                editMarkers.map((m, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    style={{
                      padding: "5px 8px", marginBottom: 3, borderRadius: 4, cursor: "pointer",
                      background: i === selectedIdx ? "rgba(255,70,85,0.12)" : "transparent",
                      border: `1px solid ${i === selectedIdx ? "#FF4655" : "transparent"}`,
                      fontSize: 11, display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: MARKER_COLORS[m.type], flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#e6edf3" }}>{m.label}</span>
                    <span style={{ color: "#6e7681", fontFamily: "monospace", fontSize: 10, flexShrink: 0 }}>{m.x},{m.y}</span>
                  </div>
                ))
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
