import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Serif_Ethiopic } from "next/font/google";
import { invitation } from "@/data/invitation";
import "./globals.css";

/* Fonts are self-hosted and subset by next/font — no runtime request to Google. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

/* Ethiopic coverage for the optional Ge'ez line.
   Not preloaded: the Ge'ez line is off by default, and even when enabled it
   sits far down the invitation, so it can load lazily without being noticed.
   next/font requires literal values here, so this cannot key off the config. */
const ethiopic = Noto_Serif_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-ethiopic",
  preload: false,
});

const title = `You're Invited • ${invitation.child.shortName}'s Holy Baptism`;
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
      className={`${cormorant.variable} ${inter.variable} ${ethiopic.variable}`}
    >
      <body className="paper-grain bg-surface text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
