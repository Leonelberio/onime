import Image from "next/image";

export type PartnerLogoProps = {
  name: string;
  src?: string;
  width?: number;
  height?: number;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Wordmark SVG (marque + nom) quand aucun fichier logo n'est fourni. */
function GeneratedWordmark({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const mark = (parts[0]?.[0] ?? "O").toUpperCase();
  const line1 = parts.slice(0, 2).join(" ");
  const line2 = parts.slice(2).join(" ");

  return (
    <svg
      viewBox="0 0 176 44"
      className="landing-trust-logo h-10 w-auto max-w-[11rem] shrink-0 text-foreground"
      role="img"
      aria-label={name}
    >
      <rect x="0" y="4" width="36" height="36" rx="9" fill="rgb(var(--onime-primary-rgb))" />
      <text
        x="18"
        y="28"
        textAnchor="middle"
        fill="rgb(var(--onime-on-primary-rgb))"
        fontSize="15"
        fontWeight="700"
        fontFamily="var(--onime-font-display, system-ui, sans-serif)"
      >
        {mark}
      </text>
      <text
        x="46"
        y={line2 ? 20 : 28}
        fill="currentColor"
        fontSize="12.5"
        fontWeight="700"
        fontFamily="var(--onime-font-display, system-ui, sans-serif)"
      >
        {line1}
      </text>
      {line2 ? (
        <text
          x="46"
          y="34"
          fill="currentColor"
          fontSize="9.5"
          fontWeight="500"
          opacity="0.72"
          fontFamily="var(--onime-font-body, system-ui, sans-serif)"
        >
          {line2}
        </text>
      ) : null}
    </svg>
  );
}

export function PartnerLogo({ name, src, width = 140, height = 40 }: PartnerLogoProps) {
  if (src) {
    const isSvg = src.includes(".svg");
    return (
      <Image
        src={src}
        alt={name}
        width={width}
        height={height}
        unoptimized={isSvg}
        className="landing-trust-logo h-11 w-auto max-w-[9.5rem] object-contain object-center sm:h-12 sm:max-w-[10.5rem]"
      />
    );
  }

  return <GeneratedWordmark name={name} />;
}

export { slugify as partnerLogoSlug };
