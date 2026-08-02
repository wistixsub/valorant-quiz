import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="text-center max-w-md">
        <p className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: "var(--red)" }}>
          TACTICAL MIND
        </p>

        <h1
          className="font-black tracking-widest uppercase mb-2"
          style={{ color: "var(--white)", fontSize: "clamp(4rem, 20vw, 7rem)", lineHeight: 1 }}
        >
          4<span style={{ color: "var(--red)" }}>0</span>4
        </h1>

        <p
          className="text-sm font-bold tracking-widest uppercase mb-2"
          style={{ color: "var(--gray)" }}
        >
          AGENT NOT FOUND
        </p>

        <p className="text-xs mb-10" style={{ color: "var(--gray)", opacity: 0.6 }}>
          このページは存在しません。マップの外に出てしまったようです。
        </p>

        <Link href="/">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase px-6 py-3 rounded transition-opacity hover:opacity-80"
            style={{ background: "var(--red)", color: "var(--white)" }}
          >
            ホームに戻る
          </span>
        </Link>
      </div>
    </div>
  );
}
