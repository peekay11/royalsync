export interface EmailProvider {
  send(input: { to: string; subject: string; html: string }): Promise<void>;
}

export interface SmsProvider {
  send(input: { to: string; message: string }): Promise<void>;
}

export interface StorageProvider {
  createUploadUrl(input: { key: string; contentType: string; size: number }): Promise<string>;
  createDownloadUrl(key: string): Promise<string>;
}

export interface PaymentProvider {
  createMandate(input: Record<string, unknown>): Promise<{ id: string; status: string }>;
  verifyWebhook(signature: string, payload: string): boolean;
}

export interface InsurerGateway {
  requestQuote(input: Record<string, unknown>): Promise<{ requestId: string }>;
}

export interface AiProvider {
  answer(input: { question: string; context: string[] }): Promise<Record<string, unknown>>;
}

export const integrationConfig = {
  email: process.env.EMAIL_PROVIDER_URL || null,
  sms: process.env.SMS_PROVIDER_URL || null,
  storage: process.env.STORAGE_ENDPOINT || null,
  payments: process.env.PAYMENT_PROVIDER_URL || null,
  insurers: process.env.INSURER_GATEWAY_URL || null,
  ai: process.env.AI_PROVIDER_URL || null
};
