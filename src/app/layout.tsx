import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://palmjob.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PalmJob - 손금으로 찾는 나만의 이색 직업",
    template: "%s | PalmJob",
  },
  description:
    "손바닥 사진을 업로드하면 AI가 분석하여 당신에게 어울리는 이색 직업을 추천해 드립니다. 재미있고 창의적인 손금 해석으로 나만의 특별한 직업을 발견해보세요!",
  keywords: [
    "손금",
    "손금 분석",
    "직업 추천",
    "이색 직업",
    "AI 손금",
    "운세",
    "재미",
    "테스트",
    "AI",
    "손바닥",
    "직업 테스트",
  ],
  authors: [{ name: "PalmJob" }],
  creator: "PalmJob",
  publisher: "PalmJob",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: baseUrl,
    siteName: "PalmJob",
    title: "PalmJob - 손금으로 찾는 나만의 이색 직업",
    description: "손바닥 사진으로 나만의 이색 직업을 찾아보세요! 🖐️✨",
    images: [
      {
        url: `${baseUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: "PalmJob - 손금으로 찾는 나만의 이색 직업",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PalmJob - 손금으로 찾는 나만의 이색 직업",
    description: "손바닥 사진으로 나만의 이색 직업을 찾아보세요! 🖐️✨",
    images: [`${baseUrl}/api/og`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console, Naver Search Advisor 등에서 제공하는 메타 태그를 여기에 추가
    // google: "your-google-verification-code",
    // other: {
    //   "naver-site-verification": "your-naver-verification-code",
    // },
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PalmJob",
    description:
      "손바닥 사진을 업로드하면 AI가 분석하여 당신에게 어울리는 이색 직업을 추천해 드립니다.",
    url: baseUrl,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
  };

  return (
    <html lang="ko">
      <body
        className={`${outfit.variable} ${notoSansKR.variable} antialiased`}
      >
        {/* 구조화된 데이터 (JSON-LD) - 검색 엔진 최적화 */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}
