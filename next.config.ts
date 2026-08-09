import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // AVIF first, WebP fallback. next/image emits JPEG as the final fallback.
    formats: ["image/avif", "image/webp"],
    /*
     * Next 16 only generates the qualities declared here, and warns for any
     * other value a component asks for. 82 is the gallery and portrait
     * setting; 88 is the envelope, which carries fine paper texture that
     * shows compression artefacts sooner.
     */
    qualities: [75, 82, 88],
    // Matches the widths called for in the brief.
    deviceSizes: [480, 768, 1080, 1600, 1920],
    imageSizes: [96, 128, 256, 384],
  },
  // No analytics, no telemetry-driven features. Purely static output.
  poweredByHeader: false,
  // The floating dev badge overlaps the invitation's bottom-left corner.
  devIndicators: false,
};

export default nextConfig;
