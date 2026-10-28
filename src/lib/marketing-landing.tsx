import {
  BarChart3,
  BellRing,
  ChefHat,
  CirclePlay,
  LayoutGrid,
  MessageCircleQuestion,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { LinkButton } from "@/components/ui";
import { Logo } from "@/components/ui/logo";
import { formatFcfa } from "@/lib/money";
import { TRIAL_DAYS } from "@/lib/subscription";
import type { MarketingLandingConfig } from "../../design-system/marketing/types";
import { TRUST_RESTAURANTS as TRUST_PARTNERS } from "../../design-system/marketing/trust-presets";

export type LandingPlan = {
  id: string;
  name: string;
  priceMonthly: number;
  description: string | null;
};

function MenuPreviewMock() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[340px]">
      <div className="landing-glow absolute -inset-4 rounded-[32px] blur-2xl" />
      <div className="relative onime-card rounded-[28px] p-3 shadow-none">
        <div className="rounded-[22px] bg-card p-4 ring-1 ring-border/60">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-card bg-foreground font-display text-xl font-bold text-background">
              M
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">Maquis Chez Ama</p>
              <p className="text-caption text-muted-foreground">Table 4 · Menu du jour</p>
            </div>
          </div>
          {[
            ["Poulet braisé & attiéké", "3 500"],
            ["Alloco sauce graine", "1 500"],
            ["Bissap maison", "500"],
          ].map(([name, price]) => (
            <div key={name} className="mt-3 flex items-center gap-3 rounded-button bg-surface p-2.5">
              <span className="h-14 w-14 shrink-0 rounded-button bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-semibold">{name}</p>
                <p className="text-caption text-muted-foreground">{price} FCFA</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-pill border border-border bg-card text-caption font-bold text-foreground">
                +
              </span>
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between rounded-button bg-foreground px-4 py-3 text-body-sm font-semibold text-background">
            <span>Commande (3)</span>
            <span>5 500 FCFA</span>
          </div>
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
          { id: "pro", name: "Pro", priceMonthly: 15000, description: "1 établissement · QR illimités" },
          { id: "team", name: "Équipe", priceMonthly: 35000, description: "Serveurs · cuisine · support prioritaire" },
        ];

  const tierCount = tiers.length;
  const gridClass =
    tierCount === 1
      ? "max-w-md grid-cols-1"
      : tierCount === 2
        ? "max-w-3xl grid-cols-1 sm:grid-cols-2"
        : "max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

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
              {["Menu illimité", "QR tables & PDF", "Écran cuisine", featured ? "Serveurs invités" : "Support email"].map((line) => (
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

export function buildMenuMarketingConfig(plans: LandingPlan[]): MarketingLandingConfig {
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
    hero: {
      title: (
        <>
          Le menu digital et les{" "}
          <span className="relative whitespace-nowrap">
            commandes à table
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-pill bg-primary/35" aria-hidden="true" />
          </span>{" "}
          à l&apos;échelle de votre salle.
        </>
      ),
      subtitle:
        "QR code, carte mobile, cuisine en temps réel et équipe connectée - sans application à installer pour vos clients.",
      primaryCta: { href: "/inscription", label: "Demander une démo" },
      secondaryCta: { href: "/r/demo", label: "Voir le menu démo", icon: CirclePlay },
      footnote: `${TRIAL_DAYS} jours gratuits · sans carte bancaire · vous encaissez comme d'habitude`,
      visual: <MenuPreviewMock />,
    },
    trust: {
      title: "Des dizaines de Entreprises nous font confiance",
      partners: TRUST_PARTNERS,
    },
    features: {
      id: "fonctions",
      title: "Comment ça marche",
      subtitle:
        "Tout ce qu'il faut pour remplacer la carte papier et fluidifier le service - sans changer vos habitudes de paiement.",
      items: [
        {
          icon: Smartphone,
          title: "Menu mobile sans appli",
          text: "Photos, prix en FCFA, catégories claires : vos clients commandent depuis leur téléphone en quelques secondes.",
        },
        {
          icon: QrCode,
          title: "QR par table",
          text: "Un QR global ou un QR par table, prêt à imprimer. Le numéro de table est déjà renseigné.",
        },
        {
          icon: BellRing,
          title: "Cuisine en direct",
          text: "Nouvelle commande, alerte sonore, colonnes Nouveau → En préparation → Prêt → Servi.",
        },
        {
          icon: ChefHat,
          title: "Serveurs sur le terrain",
          text: "Invitez l'équipe : prise de commande à table et suivi des tables depuis le mobile.",
        },
      ],
    },
    showcases: {
      left: {
        kicker: "Tout-en-un",
        title: "Une seule plateforme pour la salle, la cuisine et le manager",
        text: "Carte, commandes, équipe et QR : plus besoin de jongler entre WhatsApp, feuilles volantes et tickets illisibles.",
        footer: (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {[Smartphone, QrCode, ChefHat, UtensilsCrossed, BarChart3, ShieldCheck].map((Icon, i) => (
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
        kicker: "Pilotage",
        title: "Visibilité sur l'activité du service",
        text: "Suivez les commandes en cours, l'état des tables et la charge cuisine - en direct, depuis n'importe quel appareil.",
        footer: (
          <div className="grid grid-cols-3 gap-2">
            {["Entrées", "Grillades", "Boissons", "Desserts", "Spécialités", "Menu enfant"].map((label) => (
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
        { icon: LayoutGrid, title: "Créez votre carte", text: "Plats, photos, disponibilité - tout se gère depuis le tableau de bord." },
        { icon: Sparkles, title: "Imprimez vos QR", text: "PDF prêt pour vos tables et votre comptoir, avec votre identité visuelle." },
        { icon: Zap, title: "Servez plus vite", text: "Moins d'allers-retours, moins d'erreurs, plus de turnover aux heures de pointe." },
      ],
    },
    pricing: (
      <section id="tarifs" aria-labelledby="tarifs-titre" className="mx-auto w-full max-w-page px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="tarifs-titre" className="text-h2">
            Tarifs simples, en FCFA
          </h2>
          <p className="mt-3 text-body text-muted-foreground">
            Commencez gratuitement, passez au forfait qui correspond à votre volume quand vous êtes prêt.
          </p>
        </div>
        <PricingCards plans={plans} />
      </section>
    ),
    faq: {
      title: "Questions fréquentes",
      subtitle: "Besoin d'un coup de main pour la mise en place ? Écrivez-nous depuis votre espace après inscription.",
      aside: (
        <p className="mt-6 flex items-center gap-2 text-body-sm font-medium text-foreground">
          <MessageCircleQuestion className="h-5 w-5 text-primary-text" aria-hidden="true" />
          Support en français, fuseau Afrique de l&apos;Ouest
        </p>
      ),
      items: [
        {
          q: "Faut-il du matériel spécial ?",
          a: "Non. Un smartphone ou une tablette pour la cuisine et le service suffit. Vos clients utilisent leur propre téléphone.",
        },
        {
          q: "Comment mes clients paient-ils ?",
          a: "Comme aujourd'hui : à table auprès du serveur. Onime Menu ne prend aucune commission sur les encaissements.",
        },
        {
          q: "Puis-je modifier le menu en cours de service ?",
          a: "Oui. Plats épuisés, prix du jour, nouvelles suggestions : les changements sont visibles immédiatement sur le QR.",
        },
        {
          q: "Que se passe-t-il après l'essai gratuit ?",
          a: `Vous choisissez un forfait mensuel en FCFA, sans engagement. Vos données restent en place si vous mettez en pause.`,
        },
      ],
    },
    stats: [
      { value: "120+", label: "Entreprises équipés" },
      { value: "48k+", label: "Commandes traitées" },
      { value: "4.9/5", label: "Satisfaction équipes" },
      { value: "< 2 min", label: "Mise en route moyenne" },
    ],
    finalCta: {
      title: "Transformez votre salle et accélérez le service dès aujourd'hui",
      subtitle: "Rejoignez les Entreprises qui ont déjà adopté le menu QR. Configuration guidée, équipe invitée en un clic.",
      button: { href: "/inscription", label: "Créer mon Boutique" },
      circleHref: "/inscription",
    },
    footer: {
      brand: <Logo href="/" />,
      tagline: "Menus numériques et commandes à table pour Entreprises - produit de l'écosystème ONIME.",
      columns: [
        {
          title: "Produit",
          links: [
            { href: "#fonctions", label: "Fonctionnalités" },
            { href: "#tarifs", label: "Tarifs" },
            { href: "/r/demo", label: "Menu démo" },
          ],
        },
        {
          title: "Compte",
          links: [
            { href: "/connexion", label: "Connexion" },
            { href: "/inscription", label: "Inscription" },
          ],
        },
        {
          title: "Aide",
          links: [{ href: "#faq", label: "FAQ" }],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Onime Menu · Tous droits réservés`,
    },
  };
}
