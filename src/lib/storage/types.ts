/** Interface unique de stockage d'images : le reste de l'app ne connaît pas le fournisseur. */
export interface StoredFile {
  url: string;
  key: string;
}

export interface StorageProvider {
  readonly name: string;
  put(params: { key: string; body: Buffer; contentType: string }): Promise<StoredFile>;
  remove?(urlOrKey: string): Promise<void>;
}

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
