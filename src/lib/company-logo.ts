export type ClientTheme = "light" | "dark";

export type CompanyLogos = {
  logoUrl: string | null;
  logoUrlLight: string | null;
  logoUrlDark: string | null;
};

export function resolveCompanyLogo(theme: ClientTheme, logos: CompanyLogos): string | null {
  if (theme === "dark") return logos.logoUrlLight ?? logos.logoUrl ?? logos.logoUrlDark;
  return logos.logoUrlDark ?? logos.logoUrl ?? logos.logoUrlLight;
}

export function hasCompanyLogo(logos: CompanyLogos): boolean {
  return Boolean(logos.logoUrlLight || logos.logoUrlDark || logos.logoUrl);
}
