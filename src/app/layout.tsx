import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Copenhagen Moving Sale",
    template: "%s | Copenhagen Moving Sale"
  },
  description: "A personal second-hand sale of well-kept furniture, home items, and everyday pieces before moving out of Copenhagen.",
  openGraph: {
    title: "Copenhagen Moving Sale",
    description: "Browse personal second-hand listings available for pickup in Copenhagen.",
    type: "website",
    locale: "en_DK"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
