import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const crypto = globalThis.crypto;

const bytesToBase64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const derivePassword = async (password: string, salt: Uint8Array) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt.buffer, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
};

const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hashBytes = await derivePassword(password, salt);
  return `pbkdf2:${bytesToBase64Url(salt)}:${bytesToBase64Url(hashBytes)}`;
};

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    let plain = 'password12345';
    if (user.email.includes('paseka')) plain = 'paseka2026!';
    if (user.email.includes('olive')) plain = 'olive2026!';
    if (user.email.includes('bhekani')) plain = 'bhekani2026!';
    if (user.email.includes('tshepiso')) plain = 'tshepiso2026!';
    
    const newHash = await hashPassword(plain);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });
    console.log(`Updated ${user.email} -> ${newHash}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
