const HEIC_MIME_TYPES = ["image/heic", "image/heif"];
const HEIC_EXTENSION_RE = /\.hei[cf]$/i;

function isHeicFile(file: File): boolean {
  return (
    HEIC_MIME_TYPES.includes(file.type.toLowerCase()) ||
    HEIC_EXTENSION_RE.test(file.name)
  );
}

function withJpegName(name: string): string {
  return name.replace(HEIC_EXTENSION_RE, "") + ".jpg";
}

export async function ensureBrowserDecodableImage(file: File): Promise<File> {
  if (!isHeicFile(file)) {
    return file;
  }

  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;

  return new File([blob], withJpegName(file.name), { type: "image/jpeg" });
}
