import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { invitation } from "@/data/invitation";
import "./globals.css";

/*
 * Fonts are served from our own origin, loaded with next/font/local.
 *
 * Not next/font/google: that fetches the woff2 files from fonts.gstatic.com at
 * build time, which turns Google's availability into a hard build dependency.
 * When their server was slow the entire page returned 500 — for a family
 * invitation that has to build reliably, that trade is not worth it. The five
 * files in public/fonts total ~150KB and are checked into the repo, so the
 * build is now hermetic and no guest's browser touches a third party either.
 *
 * Subsets are the same latin ranges next/font/google was serving.
 */
const cormorant = localFont({
  /*
   * Cormorant Garamond is a variable font: one file per style covers the whole
   * 300–700 range, so two files replace the four static weights.
   *
   * These are the *latin* subsets from Google's unicode-range split. My first
   * attempt grabbed arbitrary blocks from that split — files covering Cyrillic
   * and Vietnamese ranges — which loaded without error and then silently fell
   * back to a system serif for ordinary English text. The lesson: a font that
   * "loads" is not the same as a font that has the glyphs.
   */
  src: [
    {
      path: "../public/fonts/cormorant-latin.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../public/fonts/cormorant-latin-italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-cormorant",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const inter = localFont({
  src: [
    {
      path: "../public/fonts/inter-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

/* The full name in the share preview — it is how relatives will recognise her
   when the link lands in a family group. */
const fullName = invitation.child.familyName
  ? `${invitation.child.shortName} ${invitation.child.familyName}`
  : invitation.child.shortName;

const title = `You're Invited • ${fullName}'s Holy Baptism`;
const description =
  "Please join us as we celebrate the Holy Baptism of our beloved daughter.";

/**
 * WhatsApp, Telegram and iMessage all require an absolute og:image URL — a
 * relative path silently yields no preview card. Set SITE_URL in Vercel's
 * environment variables to the deployed domain before sharing the link.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // Photographs of a child: keep this out of search engines entirely.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "An invitation to a Holy Baptism",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
  // No analytics, no verification tokens, no third-party trackers.
};

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
  width: "device-width",
  initialScale: 1,
  // Never block zoom — pinch-zoom is an accessibility requirement.
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body className="paper-grain bg-surface text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
