import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "PalmJob - 손금으로 찾는 나만의 이색 직업",
  description:
    "손바닥 사진을 업로드하면 AI가 분석하여 당신에게 어울리는 이색 직업을 추천해 드립니다.",
  keywords: ["손금", "직업 추천", "운세", "재미", "테스트", "AI"],
  authors: [{ name: "PalmJob" }],
  openGraph: {
    title: "PalmJob - 손금으로 찾는 나만의 이색 직업",
    description: "손바닥 사진으로 나만의 이색 직업을 찾아보세요! 🖐️✨",
    type: "website",
    locale: "ko_KR",
    siteName: "PalmJob",
  },
  twitter: {
    card: "summary_large_image",
    title: "PalmJob - 손금으로 찾는 나만의 이색 직업",
    description: "손바닥 사진으로 나만의 이색 직업을 찾아보세요! 🖐️✨",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${outfit.variable} ${notoSansKR.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
