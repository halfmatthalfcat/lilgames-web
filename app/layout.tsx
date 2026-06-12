import type { Metadata } from "next";
import { Noto_Sans, Noto_Emoji } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const notoEmoji = Noto_Emoji({
  variable: "--font-noto-emoji",
  subsets: ["emoji"],
});

export const metadata: Metadata = {
  title: "Lil Games",
  description: "A new game studio located in Chicago, IL - Coming Soon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoEmoji.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
