# Plausible Analytics + SEO Optimization

Date: 2026-07-10

## Context

`lilgames-web` is a Next.js 16.2.9 (App Router) "coming soon" landing page for
Lil Games, a game studio in Chicago, IL. Production domain: `lilgames.io`.
Today the site has only a minimal `metadata` export (`title`, `description`)
in `app/layout.tsx` and no analytics.

This spec covers two additions:
1. Plausible analytics tracking script
2. Baseline SEO: expanded metadata, robots.txt, sitemap.xml, and a generated
   Open Graph / Twitter card image.

Next.js 16 changes relevant here (confirmed against
`node_modules/next/dist/docs`):
- `next/script` remains the supported way to load third-party scripts in
  `app/layout.tsx`; `afterInteractive` is the recommended strategy for
  analytics.
- The Metadata API (`export const metadata: Metadata`) and file conventions
  (`robots.ts`, `sitemap.ts`, `opengraph-image.tsx`) are unchanged in shape
  from prior Next versions for this use case.
- `ImageResponse` (from `next/og`) accepts an `emoji` option
  (`'twemoji' | 'blobmoji' | 'noto' | 'openmoji'`) that fetches emoji glyphs
  for rendering — no local emoji font asset needed.

## Goals

- Add Plausible's tracking snippet site-wide.
- Give the site proper social-share previews (Open Graph + Twitter cards).
- Add `robots.txt` and `sitemap.xml` so crawlers can index the site.
- Add basic Organization structured data (JSON-LD).

## Non-goals

- Multi-page sitemap / route-specific metadata (site is a single page today).
- Custom Plausible event tracking beyond the provided snippet.
- PWA manifest / app icons beyond the existing favicon.

## Design

### 1. Plausible analytics

In `app/layout.tsx`, add two `next/script` components inside `<body>`
(or after `{children}`), both `strategy="afterInteractive"`:

- The external loader: `src="https://plausible.io/js/pa-WA-kdE-TQXxdoJWTC1zeq.js"`
- An inline script (`id="plausible-init"`) containing the queue-shim +
  `plausible.init()` snippet, via `dangerouslySetInnerHTML`.

`afterInteractive` is Next's documented recommendation for analytics scripts
(loads early, doesn't block hydration).

### 2. Metadata object (`app/layout.tsx`)

Replace the current bare metadata export with:

```ts
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
};
```

`metadataBase` lets the OG image and any relative URLs resolve to absolute
URLs automatically.

### 3. `app/robots.ts`

Generated robots file, allow-all, pointing at the sitemap:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://lilgames.io/sitemap.xml",
  };
}
```

### 4. `app/sitemap.ts`

Single-entry sitemap for the homepage:

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://lilgames.io",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
```

### 5. `app/opengraph-image.tsx`

Generated 1200x630 image via `ImageResponse`, reusing the page's visual
language (🤏 emoji, "Lil Games" title, tagline) on a plain background.
Uses `emoji: 'noto'` in the `ImageResponse` options so the pinching-hand
emoji renders consistently with the Noto Emoji font already used on the page,
without needing a bundled font file. This single file is picked up for both
`og:image` and `twitter:image` (no separate `twitter-image.tsx` needed).

### 6. Organization JSON-LD

A small `<script type="application/ld+json">` rendered in the root layout
`<body>` with basic `Organization` schema: `name`, `url`,
`address.addressLocality` / `addressRegion` ("Chicago", "IL").

## Testing

- `npm run build` succeeds (validates metadata, robots, sitemap, and
  opengraph-image compile and generate without error).
- `npm run dev`, then manually verify in browser:
  - View source / dev tools confirm Plausible script tags are present and
    load without console errors.
  - `<head>` contains expected `og:*`, `twitter:*`, and JSON-LD tags.
  - `/robots.txt` and `/sitemap.xml` routes render expected content.
  - `/opengraph-image` (or the generated path) renders the expected image.
