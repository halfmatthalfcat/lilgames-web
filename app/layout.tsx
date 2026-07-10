import type { Metadata } from "next";
import { Noto_Sans, Noto_Emoji } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL("https://lilgames.io"),
  title: {
    default: "Lil Games",
    template: "%s | Lil Games",
  },
  description: "A new game studio located in Chicago, IL - Coming Soon",
  openGraph: {
    title: "Lil Games",
    description: "A new game studio located in Chicago, IL - Coming Soon",
    url: "https://lilgames.io",
    siteName: "Lil Games",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lil Games",
    description: "A new game studio located in Chicago, IL - Coming Soon",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/icon-light",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/icon-dark",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
        sizes: "32x32",
      },
    ],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lil Games",
  url: "https://lilgames.io",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chicago",
    addressRegion: "IL",
  },
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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Script
          src="https://plausible.io/js/pa-WA-kdE-TQXxdoJWTC1zeq.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
plausible.init();`}
        </Script>
      </body>
    </html>
  );
}
