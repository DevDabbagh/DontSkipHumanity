/**
 * Certificates — the template an editor designs in the dashboard (migration
 * 051) and how it is drawn.
 *
 * Positions and sizes are fractions of the design image, so the on-screen
 * version (HTML over an <img>) and the download (a canvas at the image's full
 * resolution) put every word in the same place. Keep this file in step with
 * dsh-admin/src/lib/course-builder.ts, where the editor writes the template.
 */

export type CertFieldKey = "name" | "course" | "date" | "code";

export interface CertField {
  enabled: boolean;
  x: number;
  y: number;
  size: number;
  color: string;
  weight: 400 | 600 | 700;
  font: "sans" | "serif";
  align: "left" | "center" | "right";
}

export interface CertTemplate {
  image_url: string;
  width: number;
  height: number;
  fields: Record<CertFieldKey, CertField>;
}

export interface CertValues {
  name: string;
  course: string;
  date: string;
  code: string;
}

const field = (o: Partial<CertField>): CertField => ({
  enabled: true, x: 0.5, y: 0.5, size: 0.05, color: "#1A1A1A", weight: 700, font: "serif", align: "center", ...o,
});

const DEFAULT: CertTemplate = {
  image_url: "",
  width: 0,
  height: 0,
  fields: {
    name: field({}),
    course: field({ enabled: false, y: 0.62, size: 0.022, weight: 600, font: "sans" }),
    date: field({ enabled: false, x: 0.25, y: 0.84, size: 0.016, weight: 400, font: "sans" }),
    code: field({ enabled: false, x: 0.75, y: 0.84, size: 0.013, weight: 400, font: "sans" }),
  },
};

export function normaliseCertTemplate(raw: unknown): CertTemplate {
  const t = (raw && typeof raw === "object" ? raw : {}) as Partial<CertTemplate>;
  const f = (t.fields ?? {}) as Partial<Record<CertFieldKey, Partial<CertField>>>;
  return {
    image_url: typeof t.image_url === "string" ? t.image_url : "",
    width: Number(t.width) || 0,
    height: Number(t.height) || 0,
    fields: {
      name: { ...DEFAULT.fields.name, ...f.name },
      course: { ...DEFAULT.fields.course, ...f.course },
      date: { ...DEFAULT.fields.date, ...f.date },
      code: { ...DEFAULT.fields.code, ...f.code },
    },
  };
}

export const SERIF = "Georgia, 'Times New Roman', serif";

export function certDate(iso: string, locale = "pt-PT"): string {
  try {
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

/** Text for each field on the certificate. */
export function certText(key: CertFieldKey, v: CertValues): string {
  return key === "code" ? `Nº ${v.code}` : v[key];
}

/**
 * The design image through our own origin. A canvas that draws an image from
 * another host without CORS headers can't be exported, and the CDN doesn't
 * send them — so the download goes through /api/certificate-image.
 */
export function proxiedImage(url: string): string {
  return `/api/certificate-image?src=${encodeURIComponent(url)}`;
}

/**
 * Draws the finished certificate at the design's full resolution and returns
 * a PNG. With no design uploaded, a clean plain certificate is drawn instead
 * so a learner is never left without one.
 */
export async function renderCertificatePng(tpl: CertTemplate, v: CertValues, sansFamily: string): Promise<Blob> {
  const hasImage = Boolean(tpl.image_url);
  const W = hasImage && tpl.width ? tpl.width : 3508;
  const H = hasImage && tpl.height ? tpl.height : 2480;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't draw the certificate.");

  if (hasImage) {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Couldn't load the certificate design."));
      i.src = proxiedImage(tpl.image_url);
    });
    ctx.drawImage(img, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#FBFAF7";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#B23495";
    ctx.lineWidth = W * 0.004;
    ctx.strokeRect(W * 0.04, H * 0.06, W * 0.92, H * 0.88);
    ctx.fillStyle = "#1A1A1A";
    ctx.textAlign = "center";
    ctx.font = `600 ${W * 0.018}px ${sansFamily}`;
    ctx.fillText("CERTIFICATE OF COMPLETION · DON'T SKIP HUMANITY", W / 2, H * 0.25);
  }

  // Fonts used on a canvas must be loaded first, or the browser falls back.
  if (document.fonts?.ready) await document.fonts.ready;

  const tplFields = hasImage
    ? tpl.fields
    : normaliseCertTemplate({ fields: { course: { enabled: true }, date: { enabled: true }, code: { enabled: true } } }).fields;

  (Object.keys(tplFields) as CertFieldKey[]).forEach((k) => {
    const f = tplFields[k];
    if (!f.enabled) return;
    const text = certText(k, v);
    if (!text) return;
    const px = Math.round(f.size * W);
    ctx.font = `${f.weight} ${px}px ${f.font === "serif" ? SERIF : sansFamily}`;
    ctx.fillStyle = f.color;
    ctx.textAlign = f.align;
    ctx.textBaseline = "middle";
    // Long names shrink to fit rather than run off the design.
    const maxW = W * 0.86;
    let size = px;
    while (ctx.measureText(text).width > maxW && size > 8) {
      size = Math.floor(size * 0.94);
      ctx.font = `${f.weight} ${size}px ${f.font === "serif" ? SERIF : sansFamily}`;
    }
    ctx.fillText(text, f.x * W, f.y * H);
  });

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't create the image."))), "image/png"));
}
