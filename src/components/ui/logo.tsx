import Image from "next/image";
import Link from "next/link";
import { CLIENT_LEGAL_NAME, CLIENT_LOGO_PATH, CLIENT_NAME } from "@/lib/branding";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Image
      src={CLIENT_LOGO_PATH}
      alt=""
      width={Math.round(size * 2.2)}
      height={size}
      className="h-auto w-auto object-contain"
      style={{ maxHeight: size, width: "auto" }}
      priority
    />
  );
}

export function Logo({
  href = "/",
  compact = false,
  showWordmark = false,
}: {
  href?: string;
  compact?: boolean;
  /** Affiche le nom texte à côté du logo (sidebar étroite). */
  showWordmark?: boolean;
}) {
  const height = compact ? 36 : 52;

  return (
    <Link
      href={href}
      className="press-link inline-flex max-w-full items-center gap-2"
      aria-label={`${CLIENT_LEGAL_NAME} — accueil`}
    >
      <Image
        src={CLIENT_LOGO_PATH}
        alt={CLIENT_LEGAL_NAME}
        width={320}
        height={height}
        className="h-auto w-auto object-contain object-left"
        style={{ maxHeight: height, maxWidth: compact ? 160 : 240 }}
        priority
      />
      {showWordmark && !compact && (
        <span className="font-display text-lg font-bold leading-tight tracking-tight sm:text-xl">{CLIENT_NAME}</span>
      )}
    </Link>
  );
}
