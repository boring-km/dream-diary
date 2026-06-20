import type { Metadata } from "next";
import { Gowun_Dodum, Gowun_Batang } from "next/font/google";
import "./globals.css";

const dodum = Gowun_Dodum({
  variable: "--font-dodum",
  weight: "400",
  subsets: ["latin"],
});

const batang = Gowun_Batang({
  variable: "--font-batang",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dream — 꿈 아카이브",
  description:
    "꿈을 적으면 손그림 카드 한 장. 서랍에 쌓아 두고 나중에 발굴하는 담백한 아카이브.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${dodum.variable} ${batang.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
