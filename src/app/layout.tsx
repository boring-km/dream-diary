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
  title: "꿈 아카이브",
  description: "자다 깬 꿈을, 흘려보내지 않도록. 한국어 꿈 아카이브.",
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
