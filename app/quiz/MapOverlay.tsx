"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { MapData, MapMarker } from "@/types/quiz";

const ATTACK_COLOR = "#FF4655";
const DEFENSE_COLOR = "#52E5A4";

function getMarkerColors(playerSide?: "attack" | "defense"): Record<MapMarker["type"], string> {
  const allyColor  = playerSide === "attack" ? ATTACK_COLOR  : DEFENSE_COLOR;
  const enemyColor = playerSide === "attack" ? DEFENSE_COLOR : ATTACK_COLOR;
  return {
    ally:    allyColor,
    enemy:   enemyColor,
    unknown: "#C4C4C4",
    skill:   "#FFD700",
    spike:   "#FF8C00",
  };
}

const MARKER_SYMBOLS: Record<MapMarker["type"], string> = {
  enemy: "×",
  ally: "●",
  unknown: "?",
  skill: "◆",
  spike: "★",
};

// All Valorant displayIcon images are 1024×1024 squares
const MAP_ASPECT = 1;

interface ContainOffset {
  leftPct: number;
  topPct: number;
  wPct: number;
  hPct: number;
}

function computeContainOffset(cw: number, ch: number): ContainOffset {
  if (cw <= 0 || ch <= 0) return { leftPct: 0, topPct: 0, wPct: 1, hPct: 1 };
  const containerAspect = cw / ch;
  if (containerAspect > MAP_ASPECT) {
    const imgW = ch * MAP_ASPECT;
    return {
      leftPct: (cw - imgW) / 2 / cw,
      topPct: 0,
      wPct: imgW / cw,
      hPct: 1,
    };
  } else {
    const imgH = cw / MAP_ASPECT;
    return {
      leftPct: 0,
      topPct: (ch - imgH) / 2 / ch,
      wPct: 1,
      hPct: imgH / ch,
    };
  }
}

interface ZoomTransform {
  scale: number;
  tx: number;
  ty: number;
}

interface Props {
  map: MapData;
  markers?: MapMarker[];
  playerSide?: "attack" | "defense";
  className?: string;
  style?: React.CSSProperties;
}

export default function MapOverlay({ map, markers, playerSide, className = "", style }: Props) {
  const MARKER_COLORS = getMarkerColors(playerSide);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<ContainOffset>({ leftPct: 0, topPct: 0, wPct: 1, hPct: 1 });
  const [containerW, setContainerW] = useState(0);
  const [zoom, setZoom] = useState<ZoomTransform>({ scale: 1, tx: 0, ty: 0 });
  const zoomRef = useRef<ZoomTransform>({ scale: 1, tx: 0, ty: 0 });
  const pinchRef = useRef<{ dist: number } | null>(null);
  const panRef = useRef<{ lastX: number; lastY: number } | null>(null);

  // Resize observer: track container dimensions + letterbox offset
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setContainerW(w);
      setOffset(computeContainOffset(w, h));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset zoom when question changes (markers array reference changes)
  useEffect(() => {
    const reset: ZoomTransform = { scale: 1, tx: 0, ty: 0 };
    zoomRef.current = reset;
    setZoom(reset);
  }, [markers]);

  // Non-passive touch listeners for pinch-zoom and pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDistance = (t1: Touch, t2: Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    const clampTx = (tx: number, scale: number) => {
      const max = (el.offsetWidth * (scale - 1)) / 2;
      return Math.min(max, Math.max(-max, tx));
    };
    const clampTy = (ty: number, scale: number) => {
      const max = (el.offsetHeight * (scale - 1)) / 2;
      return Math.min(max, Math.max(-max, ty));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = { dist: getDistance(e.touches[0], e.touches[1]) };
        panRef.current = null;
      } else if (e.touches.length === 1) {
        panRef.current = { lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
        pinchRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const newDist = getDistance(e.touches[0], e.touches[1]);
        const rawScale = zoomRef.current.scale * (newDist / pinchRef.current.dist);
        const newScale = Math.min(4, Math.max(1, rawScale));
        const newTx = clampTx(zoomRef.current.tx, newScale);
        const newTy = clampTy(zoomRef.current.ty, newScale);
        const next: ZoomTransform = { scale: newScale, tx: newTx, ty: newTy };
        zoomRef.current = next;
        setZoom(next);
        pinchRef.current.dist = newDist;
      } else if (e.touches.length === 1 && panRef.current && zoomRef.current.scale > 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - panRef.current.lastX;
        const dy = e.touches[0].clientY - panRef.current.lastY;
        const newTx = clampTx(zoomRef.current.tx + dx, zoomRef.current.scale);
        const newTy = clampTy(zoomRef.current.ty + dy, zoomRef.current.scale);
        const next: ZoomTransform = { ...zoomRef.current, tx: newTx, ty: newTy };
        zoomRef.current = next;
        setZoom(next);
        panRef.current = { lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
      if (e.touches.length === 0) panRef.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const toLeft = (x: number) => `${(offset.leftPct + (x / 100) * offset.wPct) * 100}%`;
  const toTop  = (y: number) => `${(offset.topPct  + (y / 100) * offset.hPct) * 100}%`;

  // Scale marker size with container width so mobile markers don't dwarf the map.
  // At ~700px (desktop half-pane) → 18px marker / 8px label (same as original fixed sizes).
  // At ~350px (mobile) → 12px marker / 7px label.
  const markerSize   = containerW > 0 ? Math.round(Math.max(12, Math.min(18, containerW * 0.026))) : 18;
  const labelFontSz  = containerW > 0 ? Math.max(7, Math.round(containerW * 0.011)) : 8;
  const markerFontSz = Math.max(7, Math.round(markerSize * 0.5));

  const resetZoom = () => {
    const reset: ZoomTransform = { scale: 1, tx: 0, ty: 0 };
    zoomRef.current = reset;
    setZoom(reset);
  };

  return (
    <div
      className={`rounded overflow-hidden flex flex-col ${className}`}
      style={{ border: "1px solid var(--border)", ...style }}
    >
      {/* Map header */}
      <div
        className="flex items-center gap-2 px-3 py-1 flex-shrink-0"
        style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--gray)" }}>
          TACTICAL MAP — {map.nameEn.toUpperCase()}
        </span>
        {zoom.scale > 1.05 && (
          <button
            onClick={resetZoom}
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: "var(--gray)",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 3,
              padding: "1px 6px",
              cursor: "pointer",
            }}
          >
            リセット
          </button>
        )}
      </div>

      {/* Map image with markers */}
      <div
        ref={containerRef}
        className="relative w-full flex-1"
        style={{
          minHeight: "min(42vw, 300px)",
          background: "#0a1520",
          overflow: "hidden",
          touchAction: zoom.scale > 1 ? "none" : "pan-y",
        }}
      >
        {/* Zoom wrapper: map image + area labels (pinch-zoom / pan applies here) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.scale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {/* position:relative needed by Next/Image fill */}
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Image
              src={map.displayIcon}
              alt={`${map.nameEn} tactical map`}
              fill
              className="object-contain"
              unoptimized
            />

            {/* Area Labels — zoom with map */}
            {map.areaLabels?.map((area, i) => (
              <div
                key={`area-${i}`}
                className="absolute pointer-events-none"
                style={{
                  left: toLeft(area.x),
                  top: toTop(area.y),
                  transform: "translate(-50%, -50%)",
                  zIndex: 5,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.55)",
                    background: "rgba(0,0,0,0.40)",
                    padding: "1px 5px",
                    borderRadius: 3,
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    lineHeight: 1.5,
                  }}
                >
                  {area.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Marker layer — NOT transformed; stays fixed regardless of zoom/pan */}
        <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
          {markers &&
            markers.map((marker, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center"
                title={marker.label}
                style={{
                  left: toLeft(marker.x),
                  top: toTop(marker.y),
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.zIndex = "30"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.zIndex = "10"; }}
              >
                {/* Marker dot */}
                <div
                  className="flex items-center justify-center rounded-full font-bold"
                  style={{
                    width: markerSize,
                    height: markerSize,
                    background: marker.confirmed === false ? "transparent" : MARKER_COLORS[marker.type],
                    border: `2px solid ${MARKER_COLORS[marker.type]}`,
                    color: marker.confirmed === false ? MARKER_COLORS[marker.type] : "#fff",
                    fontSize: markerFontSz,
                    lineHeight: 1,
                    boxShadow: `0 0 6px ${MARKER_COLORS[marker.type]}cc`,
                  }}
                >
                  {marker.confirmed === false ? "?" : MARKER_SYMBOLS[marker.type]}
                </div>
                {/* Label */}
                <div
                  className="text-center mt-0.5 px-1 rounded"
                  style={{
                    fontSize: labelFontSz,
                    lineHeight: 1.3,
                    color: MARKER_COLORS[marker.type],
                    background: "rgba(5,10,18,0.92)",
                    border: `1px solid ${MARKER_COLORS[marker.type]}55`,
                    maxWidth: 90,
                  }}
                >
                  {marker.label}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-1"
        style={{ background: "var(--surface2)", borderTop: "1px solid var(--border)" }}
      >
        {[
          { type: "enemy" as const, label: "敵" },
          { type: "ally" as const, label: "味方" },
          { type: "unknown" as const, label: "不明" },
          { type: "skill" as const, label: "スキル" },
          { type: "spike" as const, label: "スパイク" },
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1">
            <div
              className="rounded-full flex-shrink-0"
              style={{ width: 7, height: 7, background: MARKER_COLORS[type] }}
            />
            <span style={{ fontSize: 10, color: "var(--gray)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
