import { NextResponse } from "next/server";
import { findProductByScannedCode } from "@/lib/barcode/lookup";
import { requireStaff } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const ctx = await requireStaff({ ownerOnly: true });
    if (!ctx.boutique) {
      return NextResponse.json({ error: "Sélectionnez une boutique pour scanner." }, { status: 400 });
    }
    const code = new URL(req.url).searchParams.get("code");
    if (!code?.trim()) {
      return NextResponse.json({ error: "Code manquant." }, { status: 400 });
    }
    const product = await findProductByScannedCode(ctx.boutique!.id, code);
    if (!product) {
      return NextResponse.json({ error: "Aucun produit pour ce code." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
}
