import type { Metadata } from "next";
import "./globals.css";

const APP_URL = "https://valorant-quiz-eight.vercel.app";
const OGP_IMAGE = "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png";

export const metadata: Metadata = {
  title: "VALORANT 論理テスト | TACTICAL MIND",
  description: "Valorantの戦術的思考力を鍛える状況判断クイズ。マップを選んで挑戦しよう。",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "VALORANT 論理テスト | TACTICAL MIND",
    description: "Valorantの戦術的思考力を鍛える状況判断クイズ。マップを選んで挑戦しよう。",
    url: APP_URL,
    siteName: "TACTICAL MIND",
    images: [{ url: OGP_IMAGE, width: 1215, height: 717, alt: "VALORANT 論理テスト" }],
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "VALORANT 論理テスト | TACTICAL MIND",
    description: "Valorantの戦術的思考力を鍛える状況判断クイズ。マップを選んで挑戦しよう。",
    images: [OGP_IMAGE],
  },
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
