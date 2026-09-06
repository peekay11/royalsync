import { existsSync } from 'fs';

const CHROME_CANDIDATES = [
  process.env['PUPPETEER_EXECUTABLE_PATH'],
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
].filter(Boolean) as string[];

const resolveChrome = (): string | null => {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  return found || null;
};

export const htmlToPdf = async (html: string): Promise<Buffer> => {
  try {
    // @ts-ignore
    const puppeteerModule = (await import('puppeteer-core').catch(() => null)) as any;
    if (!puppeteerModule) {
      return Buffer.from(html, 'utf-8');
    }
    const puppeteer = puppeteerModule.default || puppeteerModule;
    const executablePath = resolveChrome() || process.env['PUPPETEER_EXECUTABLE_PATH'];
    if (!executablePath) {
      return Buffer.from(html, 'utf-8');
    }
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await page.close();
      await browser.close();
    }
  } catch {
    return Buffer.from(html, 'utf-8');
  }
};
