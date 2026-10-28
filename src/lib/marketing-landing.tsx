import {
  Barcode,
  Building2,
  Clock,
  LayoutGrid,
  LogIn,
  MessageCircleQuestion,
  Package,
  ScanLine,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Zap,
} from "lucide-react";
import { LinkButton } from "@/components/ui";
import { Logo } from "@/components/ui/logo";
import { APP_TAGLINE, CLIENT_NAME } from "@/lib/branding";
import { formatFcfa } from "@/lib/money";
import { TRIAL_DAYS } from "@/lib/subscription";
import type { MarketingLandingConfig } from "../../design-system/marketing/types";
import { TRUST_PME } from "../../design-system/marketing/trust-presets";

export type LandingPlan = {
  id: string;
  name: string;
  priceMonthly: number;
  description: string | null;
};

function DashboardPreviewMock() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[340px]">
      <div className="landing-glow absolute -inset-4 rounded-[32px] blur-2xl" />
      <div className="relative onime-card rounded-[28px] p-3 shadow-none">
        <div className="rounded-[22px] bg-card p-4 ring-1 ring-border/60">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <p className="font-display text-lg font-bold leading-tight">Maison Awa</p>
              <p className="text-caption text-muted-foreground">Vue consolidée · 3 boutiques</p>
            </div>
            <span className="rounded-pill bg-primary px-2.5 py-1 text-caption font-bold text-[var(--onime-on-primary)]">
              ONIME
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["Ventes du jour", "842 000 F"],
              ["Stock bas", "12 refs"],
              ["Pointages", "18/22"],
              ["Achats", "3 en cours"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-button bg-surface p-2.5 ring-1 ring-border/60">
                <p className="text-caption text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-body-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
          {[
            ["Riz parfumé 25 kg", "Stock 8 · Cocody"],
            ["Huile 5 L", "Stock 2 · Plateau"],
          ].map(([name, meta]) => (
            <div key={name} className="mt-2 flex items-center gap-2 rounded-button bg-surface p-2">
              <Barcode className="h-4 w-4 shrink-0 text-primary-text" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-semibold">{name}</p>
                <p className="text-caption text-muted-foreground">{meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingCards({ plans }: { plans: LandingPlan[] }) {
  const tiers =
    plans.length >= 2
      ? plans.slice(0, 3)
      : [
          { id: "trial", name: "Essai", priceMonthly: 0, description: `${TRIAL_DAYS} jours complets` },
          { id: "pro", name: "Pro", priceMonthly: 25000, description: "1 organisation · jusqu'à 3 boutiques" },
          { id: "scale", name: "Réseau", priceMonthly: 55000, description: "Boutiques illimitées · vue consolidée" },
        ];

  const tierCount = tiers.length;
  const gridClass =
    tierCount === 1
      ? "max-w-md grid-cols-1"
      : tierCount === 2
        ? "max-w-3xl grid-cols-1 sm:grid-cols-2"
        : "max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const bullets = (featured: boolean) =>
    featured
      ? ["Multi-boutiques", "Codes-barres", "Pointage GPS", "Support prioritaire"]
      : ["Stock & ventes", "Achats fournisseurs", "Tableau de bord", "Support email"];

  return (
    <ul className={`mx-auto mt-10 grid w-full gap-4 lg:gap-6 ${gridClass}`}>
      {tiers.map((plan, index) => {
        const featured = index === 1 || (plans.length >= 2 && index === 1);
        return (
          <li
            key={plan.id}
            className={
              featured
                ? "relative flex flex-col rounded-card bg-foreground p-6 text-background sm:p-8"
                : "flex flex-col rounded-card bg-card p-6 ring-1 ring-border sm:p-8"
            }
          >
            {featured && (
              <span className="absolute -top-3 left-6 rounded-pill bg-background px-3 py-1 text-caption font-bold text-foreground">
                Le plus choisi
              </span>
            )}
            <p className="text-body-sm font-semibold opacity-90">{plan.name}</p>
            <p className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {plan.priceMonthly === 0 ? "0 FCFA" : formatFcfa(plan.priceMonthly)}
            </p>
            <p className={featured ? "mt-1 text-body-sm text-background/75" : "mt-1 text-body-sm text-muted-foreground"}>
              {plan.priceMonthly === 0 ? `pendant ${TRIAL_DAYS} jours` : "par mois"}
              {plan.description ? ` · ${plan.description}` : ""}
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-body-sm">
              {bullets(featured).map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <span className={featured ? "text-background" : "text-muted-foreground"} aria-hidden="true">
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
            <LinkButton
              href="/inscription"
              variant={featured ? "primary" : "secondary"}
              className="mt-8 w-full justify-center !py-3"
            >
              {plan.priceMonthly === 0 ? "Commencer l'essai" : "Choisir ce forfait"}
            </LinkButton>
          </li>
        );
      })}
    </ul>
  );
}

export function buildStockMarketingConfig(plans: LandingPlan[]): MarketingLandingConfig {
  return {
    brandAccent: "subtle",
    logo: <Logo href="/" />,
    nav: [
      { href: "#contenu", label: "Accueil" },
      { href: "#fonctions", label: "Fonctionnalités" },
      { href: "#tarifs", label: "Tarifs" },
      { href: "#faq", label: "Aide" },
    ],
    loginHref: "/connexion",
    signupHref: "/inscription",
    signupLabel: "Créer mon compte",
    hero: {
      title: (
        <>
          Pilotez vos{" "}
          <span className="relative whitespace-nowrap">
            boutiques
            <span className="absolute -bottom-1 left-0 h-1 w-full rounded-pill bg-primary/35" aria-hidden="true" />
          </span>{" "}
          : stock, ventes et équipes au même endroit.
        </>
      ),
      subtitle:
        "ONIME Shop est pensé pour les vendeurs et réseaux de magasins en Afrique de l'Ouest : inventaire, achats, ventes en FCFA, pointage employés et vue consolidée pour le propriétaire.",
      primaryCta: { href: "/inscription", label: "Créer mon espace vendeur" },
      secondaryCta: { href: "/connexion", label: "J'ai déjà un compte", icon: LogIn },
      footnote: `${TRIAL_DAYS} jours gratuits · sans carte bancaire · multi-boutiques dès l'inscription`,
      visual: <DashboardPreviewMock />,
    },
    trust: {
      title: "Des commerçants et PME nous font confiance",
      partners: TRUST_PME,
    },
    features: {
      id: "fonctions",
      title: "Tout pour vendre et contrôler",
      subtitle:
        "Une seule plateforme pour remplacer les cahiers, les fichiers Excel éparpillés et les pointages informels.",
      items: [
        {
          icon: Package,
          title: "Stock & inventaire",
          text: "Produits, seuils d'alerte, mouvements et scan code-barres depuis le téléphone ou l'ordinateur.",
        },
        {
          icon: ShoppingCart,
          title: "Ventes & achats",
          text: "Enregistrez ventes et commandes fournisseurs, clients et références — montants en FCFA.",
        },
        {
          icon: Clock,
          title: "Pointage équipe",
          text: "Check-in / check-out avec géolocalisation sur le lieu de travail, export et suivi manager.",
        },
        {
          icon: Building2,
          title: "Multi-boutiques",
          text: "Une organisation, plusieurs points de vente : basculez entre une boutique ou la vue consolidée.",
        },
      ],
    },
    showcases: {
      left: {
        kicker: "Terrain",
        title: "Vendez plus vite, avec moins d'erreurs",
        text: "Scannez un code-barres pour retrouver un produit, enregistrez une vente en quelques taps et gardez le stock à jour en temps réel.",
        footer: (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {[ScanLine, Barcode, ShoppingCart, Package, Store, TrendingUp].map((Icon, i) => (
              <span
                key={i}
                className="flex aspect-square items-center justify-center rounded-card bg-card ring-1 ring-border/80"
              >
                <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </span>
            ))}
          </div>
        ),
      },
      right: {
        kicker: "Direction",
        title: "Vue propriétaire sur tout le réseau",
        text: "CA du jour, stocks critiques, pointages et achats en cours — par boutique ou consolidé pour toute l'organisation.",
        footer: (
          <div className="grid grid-cols-3 gap-2">
            {["Cocody", "Plateau", "Marcory", "Yopougon", "Abobo", "Consolidé"].map((label) => (
              <span
                key={label}
                className="rounded-button bg-surface px-2 py-3 text-center text-caption font-semibold text-foreground ring-1 ring-border"
              >
                {label}
              </span>
            ))}
          </div>
        ),
      },
    },
    steps: {
      items: [
        {
          icon: LayoutGrid,
          title: "Créez votre organisation",
          text: "Nom, devise FCFA, première boutique : l'assistant d'inscription vous guide en 3 étapes.",
        },
        {
          icon: Sparkles,
          title: "Ajoutez produits & équipe",
          text: "Importez votre stock, invitez vos vendeurs et configurez le pointage sur site.",
        },
        {
          icon: Zap,
          title: "Pilotez au quotidien",
          text: "Ventes, achats, alertes stock bas et tableaux de bord — depuis le navigateur ou le mobile.",
        },
      ],
    },
    pricing: (
      <section id="tarifs" aria-labelledby="tarifs-titre" className="mx-auto w-full max-w-page px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="tarifs-titre" className="text-h2">
            Tarifs simples, en FCFA
          </h2>
          <p className="mt-3 text-body text-muted-foreground">
            Commencez gratuitement, ajoutez des boutiques quand votre activité grandit.
          </p>
        </div>
        <PricingCards plans={plans} />
      </section>
    ),
    faq: {
      title: "Questions fréquentes",
      subtitle: "Besoin d'aide pour démarrer ? Contactez-nous depuis votre espace après inscription.",
      aside: (
        <p className="mt-6 flex items-center gap-2 text-body-sm font-medium text-foreground">
          <MessageCircleQuestion className="h-5 w-5 text-primary-text" aria-hidden="true" />
          Support en français · fuseau Afrique de l&apos;Ouest
        </p>
      ),
      items: [
        {
          q: "Comment créer un compte ?",
          a: "Cliquez sur « Créer mon compte » ou « Créer mon espace vendeur », puis suivez l'assistant : organisation, première boutique, compte propriétaire.",
        },
        {
          q: "Puis-je gérer plusieurs magasins ?",
          a: "Oui. ONIME est multi-boutiques : une organisation regroupe plusieurs points de vente avec une vue consolidée pour le propriétaire.",
        },
        {
          q: "Le pointage fonctionne comment ?",
          a: "Les employés pointent depuis leur téléphone sur le lieu de travail (géolocalisation configurable). Les managers suivent et exportent les heures.",
        },
        {
          q: "Que se passe-t-il après l'essai ?",
          a: `Vous choisissez un forfait mensuel en FCFA. Vos données restent en place ; vous pouvez mettre en pause si besoin.`,
        },
      ],
    },
    stats: [
      { value: "Multi", label: "Boutiques par organisation" },
      { value: "FCFA", label: "Ventes & achats natifs" },
      { value: "GPS", label: "Pointage sur site" },
      { value: "< 5 min", label: "Première inscription" },
    ],
    finalCta: {
      title: "Lancez votre espace vendeur ONIME aujourd'hui",
      subtitle: "Stock, ventes, achats et équipes — configuré pour les commerçants qui veulent grandir sans perdre le contrôle.",
      button: { href: "/inscription", label: "Créer mon compte gratuitement" },
      circleHref: "/inscription",
    },
    footer: {
      brand: <Logo href="/" />,
      tagline: `${CLIENT_NAME} Shop — ${APP_TAGLINE}. Produit de l'écosystème ONIME Solutions.`,
      columns: [
        {
          title: "Produit",
          links: [
            { href: "#fonctions", label: "Fonctionnalités" },
            { href: "#tarifs", label: "Tarifs" },
          ],
        },
        {
          title: "Compte",
          links: [
            { href: "/connexion", label: "Connexion" },
            { href: "/inscription", label: "Créer un compte" },
          ],
        },
        {
          title: "Aide",
          links: [{ href: "#faq", label: "FAQ" }],
        },
      ],
      copyright: `© ${new Date().getFullYear()} ${CLIENT_NAME} · Tous droits réservés`,
    },
  };
}

/** @deprecated Utiliser buildStockMarketingConfig */
export const buildMenuMarketingConfig = buildStockMarketingConfig;
