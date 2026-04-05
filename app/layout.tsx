import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VALORANT 論理テスト | TACTICAL MIND",
  description: "Valorantの戦術的思考力を鍛える状況判断クイズ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="w-full py-3 px-4 text-center" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--gray)", opacity: 0.45, lineHeight: 1.6 }}>
            This app is an unofficial fan project and is not affiliated with or endorsed by Riot Games.<br />
            VALORANT and all related assets are property of Riot Games, Inc.
          </p>
        </footer>
      </body>
    </html>
  );
}
