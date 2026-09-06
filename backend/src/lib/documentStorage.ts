import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_DIR = path.resolve(process.cwd(), 'storage', 'documents');

const ensureDir = async () => {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
};

export const saveDocumentFile = async (id: string, filename: string, buffer: Buffer): Promise<string> => {
  await ensureDir();
  const ext = path.extname(filename) || '.pdf';
  const diskName = `${id}${ext}`;
  const targetPath = path.join(STORAGE_DIR, diskName);
  await fs.writeFile(targetPath, buffer);
  return diskName;
};

export const readDocumentFile = async (id: string, storedName?: string): Promise<{ buffer: Buffer; filename: string; mime: string } | null> => {
  try {
    await ensureDir();
    const files = await fs.readdir(STORAGE_DIR);
    const matched = files.find(f => f.startsWith(id));
    if (!matched) return null;

    const fullPath = path.join(STORAGE_DIR, matched);
    const buffer = await fs.readFile(fullPath);
    const ext = path.extname(matched).toLowerCase();

    let mime = 'application/octet-stream';
    if (ext === '.pdf') mime = 'application/pdf';
    else if (['.jpg', '.jpeg'].includes(ext)) mime = 'image/jpeg';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (['.doc', '.docx'].includes(ext)) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return {
      buffer,
      filename: storedName || matched,
      mime
    };
  } catch {
    return null;
  }
};

export const deleteDocumentFile = async (id: string): Promise<boolean> => {
  try {
    await ensureDir();
    const files = await fs.readdir(STORAGE_DIR);
    const matched = files.filter(f => f.startsWith(id));
    for (const f of matched) {
      await fs.unlink(path.join(STORAGE_DIR, f));
    }
    return true;
  } catch {
    return false;
  }
};

export const saveDocumentPdf = async (id: string, buffer: Buffer): Promise<void> => {
  await saveDocumentFile(id, 'document.pdf', buffer);
};

export const readDocumentPdf = async (id: string): Promise<Buffer | null> => {
  const result = await readDocumentFile(id);
  return result?.buffer || null;
};
