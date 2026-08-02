import type { Metadata } from "next";
import Link from "next/link";

const APP_URL = "https://valorant-quiz-eight.vercel.app";

export const metadata: Metadata = {
  title: "VALORANTの立ち回りを「状況判断」で鍛える5つの思考 | TACTICAL MIND",
  description:
    "VALORANTの立ち回りが上手くなる鍵は状況判断。フェイク読み・ミッドコントロール・リテイク経路・ULTの意図など、論理で答えを出す5つの思考を実例で解説。無料の状況判断クイズで力試しも。",
  alternates: { canonical: `${APP_URL}/guide/tachimawari` },
  openGraph: {
    title: "VALORANTの立ち回りを「状況判断」で鍛える5つの思考",
    description:
      "立ち回りはセンスでなく再現できる思考の型。フェイク読み・ミッド優先・リテイク経路・ULTの意図を実例で解説。",
    url: `${APP_URL}/guide/tachimawari`,
    type: "article",
    locale: "ja_JP",
  },
};

const FAQ = [
  {
    q: "エイムが下手でも勝てますか？",
    a: "状況判断で「撃ち合う前に有利を作る」ことは可能です。読みが当たれば不利な撃ち合い自体を減らせます。",
  },
  {
    q: "立ち回りは何から練習すべき？",
    a: "まず「相手の行動の意図」を毎ラウンド1つ言語化する習慣から。この記事の5つの型が出発点です。",
  },
  {
    q: "状況判断クイズは無料ですか？",
    a: "完全無料・登録不要です。マップごとに挑戦できます。",
  },
];

const SECTIONS = [
  {
    h: "思考1：スキルの「使い所」から本命サイトを読む（フェイク読み）",
    p: "攻め側がAにイニシエーター（スカイの犬・フェイドのホーント等）を使い切ったのに突入してこない——多くの場合フェイクです。攻め側は自分のスキルで「Aが守られている」と把握済みで、割れている場所に強引に入るのは非合理。Aに資源を使ったのは、守りの視線をAに固定してBへ転換するため。「スキルを使った方向 ≠ 本命」を疑いましょう。",
  },
  {
    h: "思考2：ユーティリティは「分断ツール」として見る",
    p: "ヴァイパーのクラウドやサイファーのケージがサイト境界やローテ経路に置かれたら、攻撃の煙ではなく守りのローテを遅らせる分断かもしれません。「Bを攻める間、Aの援軍を切るためのスキル」という視点を持つと、本命が逆サイドだと気づけます。",
  },
  {
    h: "思考3：3サイトマップは「ミッドを先に取る」",
    p: "Havenのような3サイトマップで最初にやるべきは、特定サイトへの突撃ではなくミッドコントロール。ミッドを押さえるとA・B・Cどこへでも転換でき、守り側を3方向に薄く対応させられます。プレッシャーが最大化し、相手に悪手を強いられます。",
  },
  {
    h: "思考4：リテイクは「正面」を避け、有利な角度を作る",
    p: "1v2のような不利なリテイクでサイト正面から入るのは最悪です。二人に挟まれます。正解は多くの場合、視線の外から入れる裏取りルート。時間に余裕があるなら、最短より「有利なデュエルを1個ずつ作れる経路」を選びましょう。",
  },
  {
    h: "思考5：ULTや派手な行動の「意図」を一段深く読む",
    p: "敵がスパイク設置と同時に別サイトにULTを置いた——それは「こちらのリテイク経路を封鎖する布石」であることが多い。「その行動で相手は何を得するか？」を一段深く問うと、表面の動きの裏にある計画が見えます。",
  },
];

export default function TachimawariGuide() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Topbar */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
        style={{ background: "var(--surface)", borderBottom: "2px solid var(--red)" }}
      >
        <span className="text-sm font-black tracking-widest uppercase" style={{ color: "var(--red)" }}>
          VALORANT
        </span>
        <span className="text-xs tracking-wider uppercase" style={{ color: "var(--gray)" }}>
          立ち回りガイド
        </span>
        <Link href="/" className="ml-auto text-xs px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gray)" }}>
          ← ホーム
        </Link>
      </div>

      <article className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--white)", lineHeight: 1.25 }}>
          VALORANTの「立ち回り」が下手な人へ。<br />エイムより先に"状況判断"を鍛える5つの思考
        </h1>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--gray)" }}>
          「エイムは普通なのに勝てない」「立ち回りが悪いと言われる」——原因の多くは
          <strong style={{ color: "var(--white)" }}>状況判断（今ある情報から相手の意図を読むこと）</strong>です。
          立ち回りはセンスではなく、再現できる思考の型。実際の試合で起きる5つの場面を題材に、論理で答えを出す考え方を解説します。
        </p>

        {SECTIONS.map((s) => (
          <section key={s.h} className="mb-6">
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--red)" }}>{s.h}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--white)", opacity: 0.9 }}>{s.p}</p>
          </section>
        ))}

        {/* CTA */}
        <div className="rounded p-5 my-8 text-center" style={{ background: "var(--surface)", border: "2px solid var(--red)" }}>
          <p className="text-base font-bold mb-1" style={{ color: "var(--white)" }}>実際の試合状況で力試し</p>
          <p className="text-xs mb-4" style={{ color: "var(--gray)" }}>マップ・人数・残り時間・スキルを見て最適解を選ぶ無料クイズ（登録不要）</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/quiz?map=bind&utm_source=guide" className="flex-1 py-2.5 rounded font-bold text-sm" style={{ background: "var(--red)", color: "var(--white)" }}>バインドで挑戦</Link>
            <Link href="/quiz?map=haven&utm_source=guide" className="flex-1 py-2.5 rounded font-bold text-sm" style={{ background: "var(--red)", color: "var(--white)" }}>ヘイヴンで挑戦</Link>
            <Link href="/quiz?map=split&utm_source=guide" className="flex-1 py-2.5 rounded font-bold text-sm" style={{ background: "var(--red)", color: "var(--white)" }}>スプリットで挑戦</Link>
          </div>
        </div>

        {/* FAQ */}
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--white)" }}>よくある質問</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "var(--white)" }}>Q. {f.q}</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--gray)" }}>A. {f.a}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
