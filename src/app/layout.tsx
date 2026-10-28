import type { Metadata, Viewport } from "next";
import { Inter, Schibsted_Grotesk } from "next/font/google";
import { UploadthingSSR } from "@/components/app/uploadthing-ssr";
import { PwaInstallHint } from "@/components/app/pwa-install-hint";
import { PwaLifecycle } from "@/components/app/pwa-lifecycle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted", display: "swap", weight: ["600", "700"] });

import {
  APP_TAGLINE,
  CLIENT_FAVICON_PATH,
  CLIENT_LEGAL_NAME,
  CLIENT_NAME,
  ONIME_BRAND_COLOR,
} from "@/lib/branding";

export const metadata: Metadata = {
  title: { default: `${CLIENT_NAME} · ${APP_TAGLINE}`, template: `%s · ${CLIENT_NAME}` },
  description: `${CLIENT_LEGAL_NAME} — ${APP_TAGLINE}. Prix en FCFA.`,
  applicationName: CLIENT_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: CLIENT_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: CLIENT_FAVICON_PATH, type: "image/png" }],
    apple: [{ url: CLIENT_FAVICON_PATH, type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: ONIME_BRAND_COLOR },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-domain="menu" data-theme="light" className={`${inter.variable} ${schibsted.variable}`} suppressHydrationWarning>
      <body className="onime-grain">
        <UploadthingSSR />
        <PwaLifecycle />
        <PwaInstallHint />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-button focus:bg-card focus:px-4 focus:py-2 focus:text-foreground"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
