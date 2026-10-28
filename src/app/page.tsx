import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth/session";

export default async function Home() {
  const me = await getCurrentUser();
  redirect(me ? homeFor(me.role) : "/connexion");
}
