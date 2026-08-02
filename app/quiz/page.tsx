import { Suspense } from "react";
import type { Metadata } from "next";
import { getMap } from "@/data/maps";
import QuizClient from "./QuizClient";

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

// 挑戦状リンク（?challenge=スコア）で来た時だけ、専用OGP（タイトル・説明・画像）を返す。
// SNS/Discordでリンクが映え、受け取った人が「超えてやる」と挑む＝バイラルの口。
export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SP> }
): Promise<Metadata> {
  const sp = await searchParams;
  const challenge = first(sp.challenge);
  if (!challenge) return {};

  const mapId = first(sp.map) ?? "bind";
  const total = first(sp.total);
  const map = getMap(mapId);
  const mapName = map?.name ?? mapId;
  const scoreLabel = total ? `${challenge}/${total}` : `${challenge}`;

  const title = `挑戦状：${mapName}で${scoreLabel}。超えられる？ | VALORANT論理テスト`;
  const description = `${mapName}の状況判断クイズで${scoreLabel}。あなたは何問解ける？戦術的思考力で勝負しよう。`;
  const ogImage = `/api/og?score=${encodeURIComponent(challenge)}${total ? `&total=${encodeURIComponent(total)}` : ""}&map=${encodeURIComponent(mapId)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
          <div className="text-center">
            <div
              className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--red)" }}
            />
            <p className="text-sm" style={{ color: "var(--gray)" }}>Loading...</p>
          </div>
        </div>
      }
    >
      <QuizClient />
    </Suspense>
  );
}
