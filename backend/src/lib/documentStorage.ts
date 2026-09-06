import { promises as fs } from 'fs';
import path from 'path';

/**
 * Local filesystem stand-in for object storage.
 *
 * Generated PDFs are written to backend/storage/documents/{id}.pdf. This keeps
 * the feature fully self-contained while the platform's R2 bucket
 * (royalsync-documents) is not yet wired. To move to R2 later, swap the three
 * functions below for putObject/getObject calls — the callers only depend on
 * this interface.
 */
const STORAGE_DIR = path.resolve(process.cwd(), 'storage', 'documents');

const ensureDir = async () => {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
};

const filePath = (id: string) => path.join(STORAGE_DIR, `${id}.pdf`);

export const saveDocumentPdf = async (id: string, buffer: Buffer): Promise<void> => {
  await ensureDir();
  await fs.writeFile(filePath(id), buffer);
};

export const readDocumentPdf = async (id: string): Promise<Buffer | null> => {
  try {
    return await fs.readFile(filePath(id));
  } catch {
    return null;
  }
};
