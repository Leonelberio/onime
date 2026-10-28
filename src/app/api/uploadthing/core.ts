import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";

const f = createUploadthing();

export const uploadRouter = {
  CompanyImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .input(z.object({ kind: z.enum(["logo", "item"]) }))
    .middleware(async ({ input }) => {
      const me = await getCurrentUser();
      if (!me?.organization || me.role !== "OWNER") throw new UploadThingError("Non autorisé");
      if (!me.subscription?.canWrite) throw new UploadThingError("Abonnement terminé : lecture seule.");
      if (!rateLimit(`upload:${me.user.id}`, 40, 10 * 60 * 1000)) {
        throw new UploadThingError("Trop d'envois, patientez.");
      }
      return { organizationId: me.organization.id, kind: input.kind };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return { url: file.ufsUrl ?? file.url, kind: metadata.kind, organizationId: metadata.organizationId };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
