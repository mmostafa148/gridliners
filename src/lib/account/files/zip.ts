import "server-only";

import { crc32 } from "node:zlib";

/**
 * A store-only ZIP.
 *
 * **No compression, and that is deliberate.** The archive holds a PDF and a
 * handful of SVGs; the PDF's image stream is already deflated and the SVGs are
 * a few kilobytes, so compressing would save almost nothing and would double
 * the amount of format there is to get wrong. Method 0 is read by every
 * unzipper, including macOS Archive Utility and Windows Explorer.
 *
 * Written by hand rather than with a library for the same reason `pdf.ts` is:
 * one file of understood format beats a dependency added for a mock.
 */

export interface ZipEntry {
  name: string;
  data: Buffer;
}

export function zip(entries: ZipEntry[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  // A fixed timestamp. Real DOS time would make the archive's bytes change on
  // every request, which turns a cache into a miss and a diff into noise.
  const dosTime = 0x9c00; // 19:32
  const dosDate = 0x5c21; // 2026-01-01

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const sum = crc32(entry.data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(0, 8); // stored
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(sum, 14);
    local.writeUInt32LE(entry.data.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, entry.data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(sum, 16);
    central.writeUInt32LE(entry.data.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);

    offset += local.length + name.length + entry.data.length;
  }

  const centralSize = centrals.reduce((sum, buffer) => sum + buffer.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, ...centrals, end]);
}
