import "server-only";

import { deflateSync, inflateSync } from "node:zlib";

/**
 * A minimal, valid PDF built around one full-page image.
 *
 * **Why this rather than a PDF library.** The certificates and invoices have to
 * carry Arabic participant names, and Arabic in a PDF needs a shaped, embedded
 * font — which every pure-JS PDF writer either cannot do or does by drawing
 * glyphs in logical order, producing text that is backwards and unjoined.
 *
 * The build already solved that problem once: `opengraph-image.tsx` renders
 * Arabic correctly through `ImageResponse`, which shapes properly. So the page
 * is composed there, as a picture, and this wraps the picture in a PDF. No new
 * dependency, no font embedding, and the Arabic is right because it was never
 * text in the PDF to begin with.
 *
 * **The trade is explicit**: the text in these files is not selectable or
 * searchable. For a provisional certificate and a provisional invoice in a mock
 * build that is the right trade; a real one is generated server-side by the
 * backend that owns the template.
 */

/** Un-filters a non-interlaced 8-bit RGBA PNG into raw RGB rows. */
function pngToRgb(png: Buffer): { width: number; height: number; rgb: Buffer } {
  if (png.readUInt32BE(0) !== 0x89504e47) throw new Error("Not a PNG");

  let width = 0;
  let height = 0;
  let channels = 4;
  const idat: Buffer[] = [];

  // Walk the chunks. Only IHDR and IDAT matter; anything else is skipped.
  let offset = 8;
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const body = png.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const bitDepth = body[8];
      const colorType = body[9];
      const interlace = body[12];
      if (bitDepth !== 8) throw new Error(`Unsupported bit depth ${bitDepth}`);
      if (interlace !== 0) throw new Error("Interlaced PNG is not supported");
      channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
      if (!channels) throw new Error(`Unsupported colour type ${colorType}`);
    } else if (type === "IDAT") {
      idat.push(body);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * 3);
  // The previous *unfiltered* row, which the filters refer back to.
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const row = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));

    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? row[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      switch (filter) {
        case 0: break;
        case 1: row[i] = (row[i] + a) & 0xff; break;
        case 2: row[i] = (row[i] + b) & 0xff; break;
        case 3: row[i] = (row[i] + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          // Paeth
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          row[i] = (row[i] + pred) & 0xff;
          break;
        }
        default: throw new Error(`Unknown PNG filter ${filter}`);
      }
    }

    // Alpha is composited onto white rather than carried: a certificate is
    // printed on paper, and an SMask would double the file for nothing.
    for (let x = 0; x < width; x++) {
      const src = x * channels;
      const dst = (y * width + x) * 3;
      if (channels === 4) {
        const alpha = row[src + 3] / 255;
        out[dst] = Math.round(row[src] * alpha + 255 * (1 - alpha));
        out[dst + 1] = Math.round(row[src + 1] * alpha + 255 * (1 - alpha));
        out[dst + 2] = Math.round(row[src + 2] * alpha + 255 * (1 - alpha));
      } else {
        out[dst] = row[src];
        out[dst + 1] = row[src + 1];
        out[dst + 2] = row[src + 2];
      }
    }
    prev = row;
  }

  return { width, height, rgb: out };
}

/**
 * One PNG, one page, at the picture's own aspect ratio.
 *
 * The page is sized in PDF points from the pixel dimensions at 96dpi, so a
 * 1600x1131 render becomes a landscape A4-ish page rather than something the
 * reader has to rotate.
 */
export function pdfFromPng(png: Buffer, title: string): Buffer {
  const { width, height, rgb } = pngToRgb(png);
  const scale = 72 / 96;
  const pageW = Math.round(width * scale);
  const pageH = Math.round(height * scale);
  const image = deflateSync(rgb, { level: 9 });

  const objects: (string | Buffer)[] = [];
  const push = (body: string | Buffer) => objects.push(body);

  push(`<< /Type /Catalog /Pages 2 0 R >>`);
  push(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);
  push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
      `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  push(
    Buffer.concat([
      Buffer.from(
        `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode ` +
          `/Length ${image.length} >>\nstream\n`,
      ),
      image,
      Buffer.from("\nendstream"),
    ]),
  );
  const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`;
  push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  push(
    `<< /Title (${title.replace(/([()\\])/g, "\\$1")}) /Producer (Gridliners Awards \\(provisional\\)) >>`,
  );

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary")];
  const offsets: number[] = [];
  let position = chunks[0].length;

  objects.forEach((body, i) => {
    offsets.push(position);
    const head = Buffer.from(`${i + 1} 0 obj\n`);
    const tail = Buffer.from("\nendobj\n");
    const bodyBuf = typeof body === "string" ? Buffer.from(body) : body;
    const object = Buffer.concat([head, bodyBuf, tail]);
    chunks.push(object);
    position += object.length;
  });

  const xrefAt = position;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  xref +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\n` +
    `startxref\n${xrefAt}\n%%EOF\n`;
  chunks.push(Buffer.from(xref));

  return Buffer.concat(chunks);
}
