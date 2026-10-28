import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type MarketingNavItem = { href: string; label: string; current?: boolean };

export type MarketingFeature = { icon: LucideIcon; title: string; text: string };

export type MarketingShowcase = {
  kicker: string;
  title: string;
  text: string;
  footer: ReactNode;
};

export type MarketingStep = { icon: LucideIcon; title: string; text: string };

export type MarketingFaqItem = { q: string; a: string };

export type MarketingStat = { value: string; label: string };

export type MarketingFooterColumn = { title: string; links: { href: string; label: string }[] };

/** Partenaire / client affiché dans la bande « confiance » (logo fichier ou wordmark généré). */
export type MarketingTrustPartner = {
  name: string;
  src?: string;
  width?: number;
  height?: number;
};

export type MarketingLandingConfig = {
  /** `subtle` : rouge réservé aux CTA ; le reste en encre / surfaces neutres. */
  brandAccent?: "full" | "subtle";
  logo: ReactNode;
  nav: MarketingNavItem[];
  loginHref: string;
  signupHref: string;
  signupLabel?: string;
  hero: {
    title: ReactNode;
    subtitle: string;
    primaryCta: { href: string; label: string };
    secondaryCta?: { href: string; label: string; icon?: LucideIcon };
    footnote?: string;
    visual?: ReactNode;
  };
  trust?: { title: string; partners: MarketingTrustPartner[] };
  features: {
    id: string;
    title: string;
    subtitle?: string;
    items: MarketingFeature[];
  };
  showcases?: { left: MarketingShowcase; right: MarketingShowcase };
  steps?: { title?: string; items: MarketingStep[] };
  pricing?: ReactNode;
  faq: {
    title: string;
    subtitle?: string;
    aside?: ReactNode;
    items: MarketingFaqItem[];
  };
  stats: MarketingStat[];
  finalCta: {
    title: string;
    subtitle?: string;
    button: { href: string; label: string };
    circleHref?: string;
  };
  footer: {
    brand: ReactNode;
    tagline: string;
    columns: MarketingFooterColumn[];
    copyright: string;
  };
};
