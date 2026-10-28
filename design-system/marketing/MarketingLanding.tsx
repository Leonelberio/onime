import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CirclePlay, MessageCircleQuestion } from "lucide-react";
import { MarketingNav } from "./MarketingNav";
import { TrustLogoSlider } from "./TrustLogoSlider";
import type { MarketingLandingConfig } from "./types";

function CtaLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary" | "tertiary";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={clsx("onime-btn", `onime-btn--${variant}`, className)}>
      {children}
    </Link>
  );
}

export function MarketingLanding({ config }: { config: MarketingLandingConfig }) {
  const {
    brandAccent = "full",
    logo,
    nav,
    loginHref,
    signupHref,
    signupLabel = "Essai gratuit",
    hero,
    trust,
    features,
    showcases,
    steps,
    pricing,
    faq,
    stats,
    finalCta,
    footer,
  } = config;

  const SecondaryIcon = hero.secondaryCta?.icon ?? CirclePlay;
  const subtle = brandAccent === "subtle";

  return (
    <div
      className={clsx("marketing-landing min-h-dvh", subtle && "marketing-landing--subtle-brand")}
      data-theme="light"
    >
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-page items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {logo}
          <MarketingNav items={nav} />
          <div className="flex shrink-0 items-center gap-2">
            <Link href={loginHref} className="onime-btn onime-btn--tertiary hidden sm:inline-flex">
              Connexion
            </Link>
            <CtaLink href={signupHref}>{signupLabel}</CtaLink>
          </div>
        </div>
      </header>

      <main id="contenu">
        <section className="landing-hero relative border-b border-border/60">
          <div
            className={clsx(
              "landing-hero-inner mx-auto w-full max-w-page px-4 py-16 sm:px-6 lg:py-24",
              hero.visual && "landing-hero-inner--split",
            )}
          >
            <div className="max-w-xl">
              <h1 className="font-display text-[2.35rem] font-bold leading-[1.08] tracking-tight sm:text-display lg:text-[3.25rem]">
                {hero.title}
              </h1>
              <p className="mt-6 text-body text-muted-foreground sm:text-lg sm:leading-relaxed">{hero.subtitle}</p>
              <div className="relative z-10 mt-8 flex flex-wrap items-center gap-3">
                <CtaLink href={hero.primaryCta.href} className="!px-6 !py-3">
                  {hero.primaryCta.label}
                </CtaLink>
                {hero.secondaryCta && (
                  <CtaLink
                    href={hero.secondaryCta.href}
                    variant="secondary"
                    className="inline-flex items-center gap-2 !px-6 !py-3"
                  >
                    <SecondaryIcon
                      className={clsx("h-5 w-5 shrink-0", subtle ? "text-muted-foreground" : "text-primary-text")}
                      aria-hidden="true"
                    />
                    {hero.secondaryCta.label}
                  </CtaLink>
                )}
              </div>
              {hero.footnote && <p className="mt-4 text-caption text-muted-foreground">{hero.footnote}</p>}
            </div>
            {hero.visual}
          </div>
        </section>

        {trust && (
          <section aria-labelledby="confiance" className="border-b border-border/60 bg-surface/50 py-12">
            <div className="mx-auto w-full max-w-page px-4 sm:px-6">
              <p id="confiance" className="text-center font-display text-xl font-semibold sm:text-2xl">
                {trust.title}
              </p>
              <TrustLogoSlider partners={trust.partners} label={trust.title} />
            </div>
          </section>
        )}

        <section id={features.id} aria-labelledby={`${features.id}-titre`} className="mx-auto w-full max-w-page px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id={`${features.id}-titre`} className="text-h2">
              {features.title}
            </h2>
            {features.subtitle && <p className="mt-3 text-body text-muted-foreground">{features.subtitle}</p>}
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {features.items.map(({ icon: Icon, title, text }) => (
              <li key={title} className="onime-card p-4 transition-colors hover:bg-surface/80 sm:p-6">
                <span
                  className={clsx(
                    "mb-4 flex h-11 w-11 items-center justify-center rounded-button",
                    subtle ? "bg-surface text-foreground ring-1 ring-border" : "bg-primary-soft text-primary-text",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-h4">{title}</h3>
                <p className="mt-2 text-body-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {showcases && (
          <section className="bg-surface/40 py-20">
            <div className="mx-auto grid w-full max-w-page gap-6 px-4 sm:px-6 lg:grid-cols-2">
              {[showcases.left, showcases.right].map((block) => (
                <article key={block.title} className="onime-card flex flex-col justify-between p-4 sm:p-6 lg:min-h-[320px]">
                  <div>
                    <p
                      className={clsx(
                        "text-caption font-semibold uppercase tracking-wider",
                        subtle ? "text-muted-foreground" : "text-primary-text",
                      )}
                    >
                      {block.kicker}
                    </p>
                    <h3 className="mt-2 max-w-md text-h3">{block.title}</h3>
                    <p className="mt-3 max-w-lg text-body-sm text-muted-foreground">{block.text}</p>
                  </div>
                  <div className="mt-8">{block.footer}</div>
                </article>
              ))}
            </div>
          </section>
        )}

        {steps && steps.items.length > 0 && (
          <section className="mx-auto w-full max-w-page px-4 py-20 sm:px-6">
            <h2 className="text-center text-h2">{steps.title ?? "Opérationnel en trois étapes"}</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.items.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-card bg-surface">
                    <Icon className={clsx("h-6 w-6", subtle ? "text-foreground" : "text-primary-text")} aria-hidden="true" />
                  </span>
                  <p
                    className={clsx(
                      "mt-4 font-display text-sm font-bold",
                      subtle ? "text-muted-foreground" : "text-primary-text",
                    )}
                  >
                    Étape {i + 1}
                  </p>
                  <h3 className="mt-1 text-h4">{title}</h3>
                  <p className="mt-2 text-body-sm text-muted-foreground">{text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {pricing}

        <section id="faq" aria-labelledby="faq-titre" className="mx-auto w-full max-w-page px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h2 id="faq-titre" className="text-h2">
                {faq.title}
              </h2>
              {faq.subtitle && <p className="mt-3 text-body text-muted-foreground">{faq.subtitle}</p>}
              {faq.aside ?? (
                <p className="mt-6 flex items-center gap-2 text-body-sm font-medium text-foreground">
                  <MessageCircleQuestion
                    className={clsx("h-5 w-5", subtle ? "text-muted-foreground" : "text-primary-text")}
                    aria-hidden="true"
                  />
                  Support en français
                </p>
              )}
            </div>
            <div className="divide-y divide-border rounded-card bg-card ring-1 ring-border">
              {faq.items.map((item, i) => (
                <details key={item.q} className="group" open={i === 0}>
                  <summary className="cursor-pointer list-none px-5 py-4 font-semibold transition-colors group-open:bg-foreground group-open:text-background [&::-webkit-details-marker]:hidden">
                    {item.q}
                  </summary>
                  <p className="border-t border-border/60 px-5 py-4 text-body-sm leading-relaxed text-muted-foreground group-open:border-foreground/20 group-open:bg-foreground group-open:text-background/85">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="stats-titre" className="landing-stats relative overflow-hidden bg-foreground py-20 text-background">
          <div className="landing-stats-dots pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-page px-4 sm:px-6">
            <h2 id="stats-titre" className="sr-only">
              Chiffres clés
            </h2>
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ value, label }) => (
                <li key={label} className="text-center lg:text-left">
                  <p
                    className={clsx(
                      "font-display text-4xl font-bold tracking-tight sm:text-5xl",
                      subtle ? "text-background" : "text-primary",
                    )}
                  >
                    {value}
                  </p>
                  <p className="mt-2 text-body-sm text-background/75">{label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-page px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="max-w-xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-h1">{finalCta.title}</h2>
              {finalCta.subtitle && <p className="mt-4 max-w-lg text-body text-muted-foreground">{finalCta.subtitle}</p>}
              <div className="mt-8">
                <CtaLink href={finalCta.button.href} className="!px-8 !py-3.5">
                  {finalCta.button.label}
                </CtaLink>
              </div>
            </div>
            <Link
              href={finalCta.circleHref ?? finalCta.button.href}
              className="press mx-auto flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.02] lg:mx-0 lg:h-44 lg:w-44"
              aria-label={finalCta.button.label}
            >
              <ArrowRight className="h-14 w-14 lg:h-16 lg:w-16" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface/30">
        <div className="mx-auto grid w-full max-w-page gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            {footer.brand}
            <p className="mt-4 max-w-xs text-body-sm text-muted-foreground">{footer.tagline}</p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-label font-semibold text-foreground">{col.title}</p>
              <ul className="mt-3 space-y-2 text-body-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="press-link hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-t border-border py-6 text-center text-caption text-muted-foreground">{footer.copyright}</p>
      </footer>
    </div>
  );
}
