import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { uploadRouter } from "@/app/api/uploadthing/core";
import { isUploadThingProvider } from "@/lib/upload-config";

/** Évite l'état de chargement des permissions UploadThing (voir docs.uploadthing.com). */
export function UploadthingSSR() {
  if (!isUploadThingProvider()) return null;
  return <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />;
}
