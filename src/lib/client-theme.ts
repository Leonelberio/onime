export type ClientTheme = "light" | "dark";

export const CLIENT_THEME_STORAGE_KEY = "onime-client-theme";
export const CLIENT_THEME_COOKIE = "onime-client-theme";

export function parseClientTheme(raw: unknown): ClientTheme {
  return raw === "light" ? "light" : "dark";
}

/** Miroir du thème menu client pour le squelette SSR (`loading.tsx`). */
export function writeClientThemeCookie(theme: ClientTheme) {
  if (typeof document === "undefined") return;
  document.cookie = `${CLIENT_THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}
