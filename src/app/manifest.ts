import type { MetadataRoute } from "next";

/**
 * Web App Manifest for PWA basics.
 * Defines app name, colors, and display mode.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "alteran.tech",
    short_name: "alteran.tech",
    description:
      "Alteran — software development company building performant, elegant products.",
    start_url: "/",
    display: "standalone",
    background_color: "#050510",
    theme_color: "#050510",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
