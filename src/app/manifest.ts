import type { MetadataRoute } from "next";
import { APP_TAGLINE, CLIENT_LEGAL_NAME, CLIENT_LOGO_PATH, CLIENT_NAME, ONIME_BRAND_COLOR } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${CLIENT_LEGAL_NAME} — ${APP_TAGLINE}`,
    short_name: CLIENT_NAME,
    description: `${CLIENT_LEGAL_NAME} : pointage, stock et ventes.`,
    start_url: "/connexion",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#000000",
    theme_color: ONIME_BRAND_COLOR,
    categories: ["business", "productivity"],
    icons: [
      {
        src: CLIENT_LOGO_PATH,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: CLIENT_LOGO_PATH,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
