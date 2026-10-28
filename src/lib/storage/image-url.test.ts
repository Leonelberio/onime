import { describe, expect, it } from "vitest";
import { isAllowedImageUrl } from "./image-url";

describe("isAllowedImageUrl", () => {
  it("accepte UploadThing et fichiers locaux", () => {
    expect(isAllowedImageUrl("https://utfs.io/f/abc.webp")).toBe(true);
    expect(isAllowedImageUrl("/api/files/resto/logo.webp")).toBe(true);
    expect(isAllowedImageUrl("http://evil.com/x.png")).toBe(false);
  });
});
