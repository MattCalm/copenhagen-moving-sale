import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "哥本哈根搬家二手清仓",
    template: "%s | 哥本哈根搬家二手清仓"
  },
  description: "哥本哈根个人搬家二手清仓，仅 Bodenhoffs Plads 自取。",
  openGraph: {
    title: "哥本哈根搬家二手清仓",
    description: "个人二手搬家清仓，仅 Bodenhoffs Plads 自取。",
    type: "website",
    locale: "zh_CN"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
