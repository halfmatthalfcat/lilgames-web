# Plausible Analytics + SEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Plausible analytics tracking and baseline SEO (metadata, robots.txt, sitemap.xml, social preview image, structured data) to the Lil Games landing page.

**Architecture:** All changes are additive to the existing Next.js 16 App Router project. Analytics and metadata live in `app/layout.tsx`; robots/sitemap/OG-image use Next's file-convention special files (`app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`), which Next.js compiles into routes and auto-links into `<head>`.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript. No test framework is installed in this repo — verification is via `npm run build` (compiles/type-checks all routes) and manual inspection of `npm run dev` output with `curl`.

## Global Constraints

- Production domain is `https://lilgames.io` — use this exact origin for `metadataBase`, Open Graph `url`, the sitemap entry, and the `robots.ts` sitemap reference.
- This is Next.js 16.2.9. Do not assume older-version API shapes from training data — the relevant docs were already confirmed against `node_modules/next/dist/docs` during design (see `docs/superpowers/specs/2026-07-10-analytics-and-seo-design.md`).
- Plausible script source must be used exactly as given, unmodified: `https://plausible.io/js/pa-WA-kdE-TQXxdoJWTC1zeq.js`.
- The generated OG image must use `ImageResponse`'s `emoji: 'noto'` option rather than bundling a font/emoji asset file.
- No test framework exists — do not add one. Verification is build success + manual `curl` checks against the dev server, as specified per task below.

---

### Task 1: Plausible analytics script

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `app/layout.tsx` now imports `Script` from `next/script` and renders it in `<body>`. Later tasks (2, 5) also modify this file's `metadata` export and `<body>` contents respectively — neither touches the `Script` block added here.

- [ ] **Step 1: Add the Plausible scripts to the root layout**

Edit `app/layout.tsx`. Add the import and insert two `<Script>` tags after `{children}` inside `<body>`:

```tsx
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
      <body className="min-h-full flex flex-col">
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
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: exits 0, output includes `Compiled successfully`.

- [ ] **Step 3: Verify the scripts render in HTML**

```bash
npm run dev > /tmp/lilgames-dev.log 2>&1 &
DEV_PID=$!
sleep 3
curl -s http://localhost:3000/ | grep -o 'pa-WA-kdE-TQXxdoJWTC1zeq' | head -1
curl -s http://localhost:3000/ | grep -o 'plausible-init' | head -1
kill $DEV_PID
```

Expected: first curl prints `pa-WA-kdE-TQXxdoJWTC1zeq`, second prints `plausible-init`.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "Add Plausible analytics script to root layout"
```

---

### Task 2: Expand metadata (Open Graph, Twitter card, robots directives)

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: the `metadata: Metadata` export currently reading `{ title: "Lil Games", description: "..." }` (from Task 1's file state).
- Produces: `metadata` now includes `metadataBase`, a title template, `openGraph`, `twitter`, and `robots`. Task 4's `opengraph-image.tsx` relies on `metadataBase` being set here for absolute image URLs.

- [ ] **Step 1: Replace the metadata export**

In `app/layout.tsx`, replace:

```tsx
export const metadata: Metadata = {
  title: "Lil Games",
  description: "A new game studio located in Chicago, IL - Coming Soon",
};
```

with:

```tsx
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

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: exits 0, output includes `Compiled successfully`.

- [ ] **Step 3: Verify the meta tags render**

```bash
npm run dev > /tmp/lilgames-dev.log 2>&1 &
DEV_PID=$!
sleep 3
curl -s http://localhost:3000/ | grep -o 'property="og:site_name" content="Lil Games"'
curl -s http://localhost:3000/ | grep -o 'name="twitter:card" content="summary_large_image"'
kill $DEV_PID
```

Expected: both `grep` calls print a match.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "Expand metadata with Open Graph, Twitter card, and robots directives"
```

---

### Task 3: robots.txt and sitemap.xml

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`

**Interfaces:**
- Consumes: nothing from other tasks (standalone Next.js file-convention routes).
- Produces: `/robots.txt` and `/sitemap.xml` routes, both referencing `https://lilgames.io`.

- [ ] **Step 1: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://lilgames.io/sitemap.xml",
  };
}
```

- [ ] **Step 2: Create `app/sitemap.ts`**

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

- [ ] **Step 3: Verify the build compiles and lists both routes**

Run: `npm run build`
Expected: exits 0, the route list in the output includes `/robots.txt` and `/sitemap.xml`.

- [ ] **Step 4: Verify the generated content**

```bash
npm run dev > /tmp/lilgames-dev.log 2>&1 &
DEV_PID=$!
sleep 3
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml
kill $DEV_PID
```

Expected: `robots.txt` output contains `Allow: /` and `Sitemap: https://lilgames.io/sitemap.xml`; `sitemap.xml` output contains `<loc>https://lilgames.io</loc>`.

- [ ] **Step 5: Commit**

```bash
git add app/robots.ts app/sitemap.ts
git commit -m "Add generated robots.txt and sitemap.xml"
```

---

### Task 4: Generated Open Graph / Twitter card image

**Files:**
- Create: `app/opengraph-image.tsx`

**Interfaces:**
- Consumes: nothing from other tasks (standalone route); relies on `metadataBase` from Task 2 being present so the resulting `og:image`/`twitter:image` meta tags resolve to absolute URLs.
- Produces: `/opengraph-image` route returning a 1200x630 PNG, auto-linked by Next into both `og:image` and `twitter:image` meta tags.

- [ ] **Step 1: Create `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const alt = "Lil Games";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ fontSize: 160 }}>🤏</div>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#18181b" }}>
          Lil Games
        </div>
        <div style={{ fontSize: 32, color: "#52525b" }}>
          A new game studio located in Chicago, IL
        </div>
      </div>
    ),
    {
      ...size,
      emoji: "noto",
    }
  );
}
```

- [ ] **Step 2: Verify the build compiles and generates the image route**

Run: `npm run build`
Expected: exits 0, the route list in the output includes `/opengraph-image`.

- [ ] **Step 3: Verify the image is served and linked in `<head>`**

```bash
npm run dev > /tmp/lilgames-dev.log 2>&1 &
DEV_PID=$!
sleep 3
curl -s http://localhost:3000/ | grep -o 'property="og:image"'
curl -s -o /tmp/lilgames-og.png -w '%{http_code} %{content_type}\n' http://localhost:3000/opengraph-image
kill $DEV_PID
file /tmp/lilgames-og.png
```

Expected: the `grep` prints a match; the `curl` write-out prints `200 image/png`; `file` reports a PNG image roughly 1200x630.

- [ ] **Step 4: Commit**

```bash
git add app/opengraph-image.tsx
git commit -m "Add generated Open Graph / Twitter card image"
```

---

### Task 5: Organization JSON-LD structured data

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: the `<body>` structure from Task 1's file state (contains `{children}` followed by the two Plausible `Script` tags).
- Produces: a `<script type="application/ld+json">` rendered as the first child of `<body>`, before `{children}`.

- [ ] **Step 1: Add the JSON-LD script**

In `app/layout.tsx`, add a constant above `RootLayout` and render it as the first element inside `<body>`:

```tsx
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
```

Update the `<body>` block to:

```tsx
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
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run build`
Expected: exits 0, output includes `Compiled successfully`.

- [ ] **Step 3: Verify the JSON-LD renders and is valid JSON**

```bash
npm run dev > /tmp/lilgames-dev.log 2>&1 &
DEV_PID=$!
sleep 3
curl -s http://localhost:3000/ | grep -o '"@type":"Organization"'
curl -s http://localhost:3000/ \
  | sed -n 's:.*<script type="application/ld+json">\(.*\)</script>.*:\1:p' \
  | head -1 \
  | node -e "process.stdin.on('data', d => JSON.parse(d.toString()) && console.log('valid json'))"
kill $DEV_PID
```

Expected: the first `grep` prints a match; the `node` check prints `valid json`.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "Add Organization JSON-LD structured data"
```

---

### Task 6: Final full-site verification

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: exits 0, `Compiled successfully`, route list includes `/`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`.

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: exits 0, no errors.

- [ ] **Step 3: Manual smoke test in dev mode**

```bash
npm run dev > /tmp/lilgames-dev.log 2>&1 &
DEV_PID=$!
sleep 3
curl -s http://localhost:3000/ > /tmp/lilgames-home.html
grep -c 'pa-WA-kdE-TQXxdoJWTC1zeq' /tmp/lilgames-home.html
grep -c 'og:image' /tmp/lilgames-home.html
grep -c 'twitter:card' /tmp/lilgames-home.html
grep -c 'application/ld+json' /tmp/lilgames-home.html
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/robots.txt
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/sitemap.xml
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/opengraph-image
kill $DEV_PID
```

Expected: all `grep -c` counts are `>= 1`; all three `curl` status checks print `200`.

No commit for this task — it's a verification-only gate confirming Tasks 1-5 integrate correctly.
