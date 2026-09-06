import { Response } from 'express';
import { BaseController } from './BaseController';
import { prisma } from '../lib/prisma';
import { audit } from '../lib/audit';
import { htmlToPdf } from '../lib/pdf';
import { saveDocumentPdf, readDocumentPdf } from '../lib/documentStorage';
import {
  MERGE_FIELDS,
  buildClientContext,
  sampleContext,
  renderMerge,
  documentHtmlShell,
} from '../lib/templateRender';
import type { AuthRequest } from '../types/auth';

export class TemplateController extends BaseController {
  // ─── List ──────────────────────────────────────────────────────────────
  public list = async (req: AuthRequest, res: Response) => {
    const { format } = req.query as { format?: string };
    const templates = await prisma.template.findMany({
      where: format ? { format } : {},
      orderBy: { createdAt: 'desc' },
    });
    return this.sendSuccess(res, templates, 'Templates retrieved');
  };

  // ─── Merge-field catalog (drives the builder's insert-field picker) ──────
  public mergeFields = async (_req: AuthRequest, res: Response) => {
    return this.sendSuccess(res, MERGE_FIELDS, 'Merge fields retrieved');
  };

  // ─── Create ──────────────────────────────────────────────────────────────
  public create = async (req: AuthRequest, res: Response) => {
    const { name, type, format, channel, company, subject, body } = req.body as Record<string, string>;
    if (!name || !body) return this.sendError(res, 'Name and body are required');
    const t = await prisma.template.create({
      data: {
        name,
        type: type || 'general',
        format: format === 'document' ? 'document' : 'communication',
        channel: channel || 'email',
        company: company || null,
        subject: subject || null,
        body,
        isGlobal: true,
      },
    });
    await audit(req.user, 'create', 'template', t.id, `Created template "${name}"`);
    return this.sendSuccess(res, t, 'Template created', 201);
  };

  // ─── Update ────────────────────────────────────────────────────────────────
  public update = async (req: AuthRequest, res: Response) => {
    const { name, type, channel, company, subject, body } = req.body as Record<string, string>;
    const id = req.params['id'] as string;
    const t = await prisma.template.update({
      where: { id },
      data: {
        ...(name != null ? { name } : {}),
        ...(type != null ? { type } : {}),
        ...(channel != null ? { channel } : {}),
        ...(company !== undefined ? { company: company || null } : {}),
        ...(subject !== undefined ? { subject: subject || null } : {}),
        ...(body != null ? { body } : {}),
      },
    });
    await audit(req.user, 'update', 'template', id, `Updated template "${t.name}"`);
    return this.sendSuccess(res, t, 'Template updated');
  };

  // ─── Preview merged HTML (sample data, or a real client if provided) ─────
  public preview = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { clientId } = req.body as { clientId?: string };
    const template = await prisma.template.findUnique({ where: { id } });
    if (!template) return this.sendError(res, 'Template not found', 404);

    const context = clientId
      ? await buildClientContext(clientId, template.company)
      : sampleContext(template.company);
    const mergedBody = renderMerge(template.body, context);
    const html = documentHtmlShell(
      template.subject || template.name,
      (context['company'] as string) || '',
      ((context['broker'] as Record<string, string>)?.name) || '',
      mergedBody,
    );
    return this.sendSuccess(res, { html }, 'Preview rendered');
  };

  // ─── Generate PDF filled with a client's data → stored Document ──────────
  public generate = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { clientId } = req.body as { clientId?: string };
    if (!clientId) return this.sendError(res, 'clientId is required');

    const template = await prisma.template.findUnique({ where: { id } });
    if (!template) return this.sendError(res, 'Template not found', 404);
    if (template.format !== 'document') return this.sendError(res, 'Only document templates can be generated');

    let context;
    try {
      context = await buildClientContext(clientId, template.company);
    } catch {
      return this.sendError(res, 'Client not found', 404);
    }

    const mergedBody = renderMerge(template.body, context);
    const title = renderMerge(template.subject || template.name, context);
    const html = documentHtmlShell(
      title,
      (context['company'] as string) || '',
      ((context['broker'] as Record<string, string>)?.name) || '',
      mergedBody,
    );

    let pdf: Buffer;
    try {
      pdf = await htmlToPdf(html);
    } catch (err) {
      return this.sendError(res, `PDF generation failed: ${(err as Error).message}`, 500);
    }

    const doc = await prisma.document.create({
      data: {
        clientId,
        name: `${title} (${new Date().toLocaleDateString('en-ZA')})`,
        type: 'generated',
        status: 'ready',
        url: '', // set below once we have the id
      },
    });
    await saveDocumentPdf(doc.id, pdf);
    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: { url: `/api/documents/${doc.id}/download` },
    });

    await audit(req.user, 'generate', 'document', doc.id, `Generated "${title}" from template "${template.name}"`);
    return this.sendSuccess(res, updated, 'Document generated', 201);
  };

  // ─── Stream a generated PDF ──────────────────────────────────────────────
  public download = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return this.sendError(res, 'Document not found', 404);

    const pdf = await readDocumentPdf(id);
    if (!pdf) return this.sendError(res, 'Document file not available', 404);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.name.replace(/[^\w.-]+/g, '_')}.pdf"`);
    return res.send(pdf);
  };
}
