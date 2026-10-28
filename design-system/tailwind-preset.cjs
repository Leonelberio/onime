/**
 * ONIME - preset Tailwind CSS v3.4 (les 4 produits sont en Tailwind 3.4).
 *
 *   // tailwind.config.(js|ts)
 *   module.exports = { presets: [require("./design-system/tailwind-preset.cjs")], content: [...] }
 *
 * Prérequis : importer design-system/tokens.css (variables) dans globals.css.
 * Toutes les couleurs sont `rgb(var(--onime-X-rgb) / <alpha-value>)` : les modificateurs
 * d'opacité (`bg-primary/50`) fonctionnent. Le thème (clair/sombre) bascule uniquement
 * via les variables : AUCUN `dark:` n'est requis pour les couleurs sémantiques.
 */
const plugin = require("tailwindcss/plugin");

const c = (name) => `rgb(var(--onime-${name}-rgb) / <alpha-value>)`;
const v = (name) => `var(--onime-${name})`;

/** shadcn-compatible : mêmes noms de classes (bg-background, text-muted-foreground, border-input…). */
const colors = {
  background: c("canvas"),
  foreground: c("foreground"),
  surface: { DEFAULT: c("surface"), hover: c("hover") },
  card: { DEFAULT: c("raised"), foreground: c("foreground") },
  popover: { DEFAULT: c("raised"), foreground: c("foreground") },
  primary: {
    DEFAULT: c("primary"),
    foreground: c("on-primary"),
    hover: c("primary-hover"),
    active: c("primary-active"),
    text: c("primary-text"),
    soft: v("primary-soft"),
  },
  secondary: { DEFAULT: c("surface"), foreground: c("foreground") },
  muted: { DEFAULT: c("surface"), foreground: c("muted-foreground") },
  subtle: c("subtle"),
  faint: c("faint"), // décoratif uniquement
  // shadcn "accent" = surface de survol discrète (≠ accent de domaine, voir `domain`)
  accent: { DEFAULT: c("hover"), foreground: c("foreground") },
  // accent de domaine métier (suit <html data-domain="…">)
  domain: {
    DEFAULT: c("accent"),
    text: c("accent-text"),
    strong: c("accent-strong"),
    "strong-hover": c("accent-strong-hover"),
    fg: c("accent-fg"),
    soft: v("accent-soft"),
  },
  destructive: { DEFAULT: c("error"), foreground: c("on-semantic") },
  error: { DEFAULT: c("error"), text: c("error-text"), soft: v("error-soft"), foreground: c("on-semantic") },
  success: { DEFAULT: c("success"), text: c("success-text"), soft: v("success-soft"), foreground: c("on-semantic") },
  warning: { DEFAULT: c("caution"), text: c("caution-text"), soft: v("caution-soft"), foreground: c("on-primary") },
  caution: { DEFAULT: c("caution"), text: c("caution-text"), soft: v("caution-soft"), foreground: c("on-primary") },
  info: { DEFAULT: c("info"), text: c("info-text"), soft: v("info-soft"), foreground: c("on-semantic") },
  cta: { DEFAULT: c("primary"), foreground: c("on-primary") }, // alias de migration (gym)
  border: v("border"),
  "border-hover": v("border-hover"),
  input: c("field-border"), // bordure de champ AA (≥ 3:1)
  ring: c("focus"),
  chart: {
    1: c("accent"),
    2: c("chart-2"),
    3: c("chart-3"),
    4: c("chart-4"),
    5: c("chart-5"),
  },
  // sidebar : même système tonal que le reste (plus de rail sombre propre à chaque produit)
  sidebar: {
    DEFAULT: c("surface"),
    foreground: c("foreground"),
    primary: c("primary"),
    "primary-foreground": c("on-primary"),
    accent: c("hover"),
    "accent-foreground": c("foreground"),
    border: v("border"),
    ring: c("focus"),
    muted: c("subtle"),
  },
};

const noShadow = {
  DEFAULT: "none", sm: "none", md: "none", lg: "none", xl: "none", "2xl": "none", inner: "none", none: "none",
  // compat anciens noms de produits (supprimés au profit du tonal layering)
  card: "none", "card-hover": "none", apple: "none", "apple-lg": "none", lattice: "none", nav: "none", button: "none", subtle: "none",
};

module.exports = {
  // Suit le système ; forçable via data-theme="dark" ou .dark (next-themes). Compatible `dark:`.
  darkMode: [
    "variant",
    [
      "@media (prefers-color-scheme: dark) { &:where(:not([data-theme=light], [data-theme=light] *, .light, .light *)) }",
      "&:where([data-theme=dark], [data-theme=dark] *, .dark, .dark *)",
    ],
  ],
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: [v("font-display")],
        body: [v("font-body")],
        sans: [v("font-body")],
        mono: [v("font-mono")],
      },
      fontSize: {
        // échelle charte (Major Third 1.25) - nouveaux noms, ne remplace pas text-sm/base natifs
        display: ["clamp(2.25rem, 5vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.025em", fontWeight: "700" }],
        h1: ["2.25rem", { lineHeight: "1.12", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        h3: ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        h4: ["1.125rem", { lineHeight: "1.35", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.43" }],
        caption: ["0.75rem", { lineHeight: "1.5" }],
        label: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.04em", fontWeight: "600" }],
      },
      borderRadius: {
        card: v("radius-card"),
        button: v("radius-md"),
        field: v("radius-sm"),
        badge: v("radius-sm"),
        pill: v("radius-pill"),
        sm: v("radius-sm"), // 8
        md: v("radius-md"), // 12
        lg: v("radius-card"), // 14
        xl: v("radius-card"), // 14 - plus de rounded-xl > carte
      },
      spacing: { section: v("space-section") },
      boxShadow: noShadow,
      transitionDuration: { DEFAULT: "150ms", fast: "150ms", page: "300ms" },
      transitionTimingFunction: { DEFAULT: "ease-out" },
      scale: { "press-button": "0.96", "press-icon": "0.92", "press-card": "0.98", "press-link": "0.99" },
      maxWidth: { page: "1200px" },
      keyframes: {
        "onime-spin": { to: { transform: "rotate(360deg)" } },
        "onime-fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "onime-spin": "onime-spin 0.6s linear infinite",
        "onime-fade-in": "onime-fade-in 300ms ease-out both",
      },
    },
    // `transition-all` n'est JAMAIS autorisé par la charte : on le remappe vers une liste sûre
    // (la classe existante continue de compiler mais n'anime plus width/height/layout).
    transitionProperty: {
      none: "none",
      all: "background-color, border-color, color, fill, stroke, opacity, transform",
      DEFAULT: "background-color, border-color, color, fill, stroke, opacity, transform",
      colors: "background-color, border-color, color, fill, stroke",
      opacity: "opacity",
      transform: "transform",
      shadow: "none",
      spacing: "margin, padding",
    },
  },
  plugins: [
    plugin(function ({ addBase, addUtilities }) {
      addBase({
        ":root": { "-webkit-text-size-adjust": "100%" },
        "*, ::before, ::after": { borderColor: "var(--onime-border)" },
        body: {
          backgroundColor: "rgb(var(--onime-canvas-rgb))",
          color: "rgb(var(--onime-foreground-rgb))",
          fontFamily: "var(--onime-font-body)",
          fontSize: "15px",
          lineHeight: "1.5",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "h1, h2": { fontFamily: "var(--onime-font-display)", fontWeight: "700", textWrap: "balance" },
        "h3, h4, h5, h6": { fontFamily: "var(--onime-font-body)", fontWeight: "600" },
        "::selection": { backgroundColor: "var(--onime-primary-soft)" },
        ":where(a, button, input, select, textarea, summary, [tabindex]):focus-visible": {
          outline: "2px solid var(--onime-focus)",
          outlineOffset: "2px",
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*, ::before, ::after": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      });
      // Micro-interactions « press » (charte : boutons .96, icônes .92, cartes .98, liens .99)
      const press = (s) => ({ transitionProperty: "transform", transitionDuration: "150ms", transitionTimingFunction: "ease-out", "&:active:not(:disabled)": { transform: `scale(${s})` } });
      addUtilities({
        ".press": press("0.96"),
        ".press-icon": press("0.92"),
        ".press-card": press("0.98"),
        ".press-link": press("0.99"),
        ".text-balance": { textWrap: "balance" },
      });
    }),
  ],
};
