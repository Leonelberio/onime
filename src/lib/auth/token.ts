import { authSecret } from "../env";

export const SESSION_COOKIE = "onime_menu_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 jours

export interface SessionClaims {
  uid: string;
}

/**
 * JWT HS256 minimal via WebCrypto : compatible Node ET Edge (middleware), sans dépendance.
 * (jose tire des modules non-Edge dans le middleware et fait remonter des avertissements de build.)
 */
const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
const key = (usage: "sign" | "verify") => crypto.subtle.importKey("raw", authSecret() as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, [usage]);

export async function signSession(claims: SessionClaims, now = Date.now()): Promise<string> {
  const iat = Math.floor(now / 1000);
  const head = b64url(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = b64url(enc.encode(JSON.stringify({ uid: claims.uid, iat, exp: iat + SESSION_MAX_AGE })));
  const sig = await crypto.subtle.sign("HMAC", await key("sign"), enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined, now = Date.now()): Promise<SessionClaims | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key("verify"), fromB64url(parts[2]) as BufferSource, enc.encode(`${parts[0]}.${parts[1]}`));
    if (!ok) return null;
    const header = JSON.parse(new TextDecoder().decode(fromB64url(parts[0])));
    if (header.alg !== "HS256") return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(parts[1])));
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number" || payload.exp * 1000 <= now) return null;
    return { uid: payload.uid };
  } catch {
    return null;
  }
}
