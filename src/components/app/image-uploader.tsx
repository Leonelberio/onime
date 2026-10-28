"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

/** Réduit l'image côté navigateur (max 1200 px, WebP) avant envoi → économie de données mobiles. */
async function downscale(file: File, max = 1200): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Format non supporté (JPEG, PNG ou WebP).");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", 0.86));
  if (!blob) throw new Error("Conversion impossible.");
  return blob;
}

function useUploadProvider() {
  return process.env.NEXT_PUBLIC_UPLOAD_PROVIDER === "uploadthing" ? "uploadthing" : "legacy";
}

function ImageUploaderLegacy({ name, kind, initialUrl, label }: { name: string; kind: "logo" | "item"; initialUrl?: string | null; label: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await downscale(file);
      const fd = new FormData();
      fd.set("file", new File([blob], "image.webp", { type: "image/webp" }));
      fd.set("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec de l'envoi");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'envoi");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <ImageUploaderView id={id} name={name} label={label} url={url} setUrl={setUrl} busy={busy} error={error} input={input} onFile={onFile} />
  );
}

function ImageUploaderUploadThing({ name, kind, initialUrl, label }: { name: string; kind: "logo" | "item"; initialUrl?: string | null; label: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  const { startUpload, isUploading } = useUploadThing("CompanyImage", {
    onClientUploadComplete: (res) => {
      const uploaded = res[0]?.url ?? res[0]?.serverData?.url;
      if (uploaded) setUrl(uploaded);
    },
    onUploadError: (e) => setError(e.message || "Échec de l'envoi"),
  });

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const blob = await downscale(file);
      const webp = new File([blob], "image.webp", { type: "image/webp" });
      await startUpload([webp], { kind });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'envoi");
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  return (
    <ImageUploaderView id={id} name={name} label={label} url={url} setUrl={setUrl} busy={isUploading} error={error} input={input} onFile={onFile} />
  );
}

function ImageUploaderView({
  id, name, label, url, setUrl, busy, error, input, onFile,
}: {
  id: string;
  name: string;
  label: string;
  url: string;
  setUrl: (v: string) => void;
  busy: boolean;
  error: string | null;
  input: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <div>
      <span className="onime-label" id={`${id}-l`}>{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-button border border-border bg-surface text-subtle">
          {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" aria-hidden="true" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="onime-btn onime-btn--secondary" onClick={() => input.current?.click()} aria-busy={busy || undefined} disabled={busy} aria-describedby={`${id}-l`}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {url ? "Changer" : "Choisir une image"}
          </button>
          {url && !busy && (
            <button type="button" className="onime-btn onime-btn--tertiary" onClick={() => setUrl("")}>
              <X className="h-4 w-4" aria-hidden="true" /> Retirer
            </button>
          )}
        </div>
        <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label={label ?? "Fichier image"} onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {error && <p className="onime-help onime-help--error" role="alert">{error}</p>}
    </div>
  );
}

export function ImageUploader(props: { name: string; kind: "logo" | "item"; initialUrl?: string | null; label: string }) {
  const provider = useUploadProvider();
  if (provider === "uploadthing") return <ImageUploaderUploadThing {...props} />;
  return <ImageUploaderLegacy {...props} />;
}
