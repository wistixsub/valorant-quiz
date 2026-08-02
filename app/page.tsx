import Link from "next/link";
import Image from "next/image";
import { MAPS } from "@/data/maps";
import { getQuestionsByMap } from "@/data/questions";

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 py-10"
      style={{ background: "var(--bg)" }}
    >
      {/* Header */}
      <div
        className="w-full max-w-4xl mb-2 pb-3 flex items-center gap-3"
        style={{ borderBottom: "2px solid var(--red)" }}
      >
        <span className="text-xs font-black tracking-widest uppercase" style={{ color: "var(--red)" }}>
          VALORANT
        </span>
        <span className="text-xs tracking-widest uppercase" style={{ color: "var(--gray)" }}>
          論理テスト / TACTICAL MIND
        </span>
      </div>

      {/* Hero */}
      <div className="text-center mb-10 mt-8">
        <h1
          className="font-black tracking-widest uppercase mb-3"
          style={{
            color: "var(--white)",
            fontSize: "clamp(2rem, 8vw, 3.5rem)",
            lineHeight: 1.1,
          }}
        >
          TACTICAL <span style={{ color: "var(--red)" }}>MIND</span>
        </h1>
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--gray)" }}>
          状況読解 × 戦術論理クイズ
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--gray)", opacity: 0.7 }}>
          マップを選んで挑戦。戦術的思考力を試そう。
        </p>
      </div>

      {/* Map Cards */}
      <div className="w-full max-w-4xl">
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--gray)" }}>
          マップを選択
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MAPS.map((map) => (
            <Link key={map.id} href={`/quiz?map=${map.id}`}>
              <div
                className="rounded group cursor-pointer overflow-hidden transition-all duration-150 hover:-translate-y-1 active:scale-95"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Map splash image */}
                <div className="relative w-full overflow-hidden" style={{ height: "clamp(120px, 25vw, 160px)" }}>
                  <Image
                    src={map.splash}
                    alt={map.nameEn}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(15,25,35,0.85) 0%, rgba(15,25,35,0.2) 100%)",
                    }}
                  />
                  <div className="absolute bottom-2 left-3">
                    <p
                      className="font-black tracking-widest uppercase"
                      style={{ color: "var(--white)", fontSize: "clamp(0.9rem, 3vw, 1.1rem)" }}
                    >
                      {map.nameEn}
                    </p>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-base font-bold mb-1" style={{ color: "var(--white)" }}>
                    {map.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--gray)" }}>
                    {map.sites}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(255,70,85,0.13)",
                        color: "var(--red)",
                        border: "1px solid rgba(255,70,85,0.25)",
                      }}
                    >
                      {getQuestionsByMap(map.id).length}問
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "var(--surface2)",
                        color: "var(--gray)",
                      }}
                    >
                      初級〜上級
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 立ち回りガイドへの内部リンク（SEO・回遊） */}
      <div className="w-full max-w-4xl mt-8">
        <Link href="/guide/tachimawari">
          <div
            className="rounded p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <span className="text-xl">📖</span>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "var(--white)" }}>
                立ち回りが上手くなる「状況判断」5つの思考
              </p>
              <p className="text-xs" style={{ color: "var(--gray)" }}>
                フェイク読み・ミッド優先・リテイク経路…論理で考えるコツを解説
              </p>
            </div>
            <span className="text-xs" style={{ color: "var(--red)" }}>読む →</span>
          </div>
        </Link>
      </div>

      <div className="mt-10 flex flex-col items-center gap-1">
        <p className="text-xs" style={{ color: "var(--gray)", opacity: 0.6 }}>
          Patch 12.05 対応
        </p>
        <p className="text-xs" style={{ color: "var(--gray)", opacity: 0.45 }}>
          v2以降、コミュニティの回答データをもとに正解を定期更新予定
        </p>
      </div>
    </div>
  );
}
