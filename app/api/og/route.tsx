import { ImageResponse } from "next/og";

export const runtime = "edge";

// 挑戦状リンクの動的OGP画像。score/total/map をクエリで受け取りカードを描画。
// ※ CJKフォント読込を避けるため、表示は英数字中心（スコア・ランク・マップID）。
const RANKS = [
  { min: 100, label: "RADIANT", color: "#FFD700" },
  { min: 80, label: "IMMORTAL", color: "#FF4655" },
  { min: 60, label: "DIAMOND", color: "#9966FF" },
  { min: 40, label: "PLATINUM", color: "#4BC8E8" },
  { min: 20, label: "GOLD", color: "#E2C044" },
  { min: 0, label: "IRON", color: "#9AA4B2" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const score = searchParams.get("score") ?? "?";
  const total = searchParams.get("total");
  const map = (searchParams.get("map") ?? "valorant").toUpperCase();

  let rank = RANKS[RANKS.length - 1];
  if (total && !Number.isNaN(Number(score)) && Number(total) > 0) {
    const pct = (Number(score) / Number(total)) * 100;
    rank = RANKS.find((r) => pct >= r.min) ?? rank;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F1923",
          color: "#ECE8E1",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 48, left: 56, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 14, height: 40, background: "#FF4655" }} />
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 4 }}>VALORANT LOGIC TEST</div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontSize: 200, fontWeight: 900, color: rank.color, lineHeight: 1 }}>{score}</div>
          {total && <div style={{ fontSize: 90, fontWeight: 800, color: "#5A6472" }}>/{total}</div>}
        </div>

        <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: 8, color: rank.color, marginTop: 8 }}>
          {rank.label}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#ECE8E1", border: "2px solid #2A3441", padding: "6px 20px", borderRadius: 8 }}>
            {map}
          </div>
          <div style={{ fontSize: 30, color: "#9AA4B2" }}>CAN YOU BEAT THIS?</div>
        </div>

        <div style={{ position: "absolute", bottom: 44, fontSize: 26, color: "#5A6472", letterSpacing: 2 }}>
          valorant-quiz-eight.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
