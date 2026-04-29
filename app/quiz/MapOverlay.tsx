"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { MapData, MapMarker } from "@/types/quiz";

const MARKER_COLORS: Record<MapMarker["type"], string> = {
  enemy: "#FF4655",
  ally: "#52E5A4",
  unknown: "#C4C4C4",
  skill: "#FFD700",
  spike: "#FF8C00",
};

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
    // Container is wider than the image — letterbox left/right
    const imgW = ch * MAP_ASPECT;
    return {
      leftPct: (cw - imgW) / 2 / cw,
      topPct: 0,
      wPct: imgW / cw,
      hPct: 1,
    };
  } else {
    // Container is taller than the image — letterbox top/bottom
    const imgH = cw / MAP_ASPECT;
    return {
      leftPct: 0,
      topPct: (ch - imgH) / 2 / ch,
      wPct: 1,
      hPct: imgH / ch,
    };
  }
}

interface Props {
  map: MapData;
  markers?: MapMarker[];
  className?: string;
  style?: React.CSSProperties;
}

export default function MapOverlay({ map, markers, className = "", style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<ContainOffset>({ leftPct: 0, topPct: 0, wPct: 1, hPct: 1 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setOffset(computeContainOffset(el.offsetWidth, el.offsetHeight));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toLeft = (x: number) => `${(offset.leftPct + (x / 100) * offset.wPct) * 100}%`;
  const toTop = (y: number) => `${(offset.topPct + (y / 100) * offset.hPct) * 100}%`;

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
      </div>

      {/* Map image with markers */}
      <div
        ref={containerRef}
        className="relative w-full flex-1"
        style={{
          minHeight: "min(42vw, 300px)",
          background: "#0a1520",
        }}
      >
        <Image
          src={map.displayIcon}
          alt={`${map.nameEn} tactical map`}
          fill
          className="object-contain"
          unoptimized
        />

        {/* Area Labels */}
        {map.areaLabels?.map((area, i) => (
          <div
            key={`area-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: toLeft(area.x),
              top: toTop(area.y),
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.55)',
                background: 'rgba(0,0,0,0.40)',
                padding: '1px 5px',
                borderRadius: 3,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                lineHeight: 1.5,
              }}
            >
              {area.label}
            </span>
          </div>
        ))}

        {/* Markers */}
        {markers &&
          markers.map((marker, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{
                left: toLeft(marker.x),
                top: toTop(marker.y),
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            >
              {/* Marker dot */}
              <div
                className="flex items-center justify-center rounded-full font-bold"
                style={{
                  width: 18,
                  height: 18,
                  background: marker.confirmed === false ? "transparent" : MARKER_COLORS[marker.type],
                  border: `2px solid ${MARKER_COLORS[marker.type]}`,
                  color: marker.confirmed === false ? MARKER_COLORS[marker.type] : "#fff",
                  fontSize: 9,
                  lineHeight: 1,
                  boxShadow: `0 0 5px ${MARKER_COLORS[marker.type]}88`,
                }}
              >
                {marker.confirmed === false ? "?" : MARKER_SYMBOLS[marker.type]}
              </div>
              {/* Label */}
              <div
                className="text-center mt-0.5 px-1 rounded"
                style={{
                  fontSize: 8,
                  lineHeight: 1.3,
                  color: MARKER_COLORS[marker.type],
                  background: "rgba(10,21,32,0.88)",
                  maxWidth: 80,
                }}
              >
                {marker.label}
              </div>
            </div>
          ))}
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
