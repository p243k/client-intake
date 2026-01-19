import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import * as nodemailer from 'nodemailer';
import * as puppeteer from 'puppeteer';
import {  AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json({ limit: '2mb' }));
const angularApp = new AngularNodeAppEngine();

/**
 * Internal API protection (required in production):
 * Requires header `x-api-key` matching INTERNAL_API_KEY env var.
 */
function requireApiKey(req: any, res: any, next: any) {
  const expected = process.env['INTERNAL_API_KEY'];
  if (!expected) return res.status(500).json({ ok: false, error: 'INTERNAL_API_KEY_MISSING' });
  const got = req.headers['x-api-key'];
  if (got !== expected) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
  next();
}

function escapeHtml(str: unknown) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function labelBudget(range: unknown) {
  const map: Record<string, string> = {
    'lt1000': 'Moins de 1 000 €',
    '1000-2500': '1 000 – 2 500 €',
    '2500-5000': '2 500 – 5 000 €',
    'gt5000': 'Plus de 5 000 €',
  };
  return map[String(range ?? '')] ?? (range ? String(range) : '—');
}

function labelTimeline(timeline: unknown) {
  const map: Record<string, string> = {
    'asap': 'ASAP (le plus vite possible)',
    '1-2m': '1 – 2 mois',
    '3-4m': '3 – 4 mois',
    'no-deadline': 'Pas de délai précis',
  };
  return map[String(timeline ?? '')] ?? (timeline ? String(timeline) : '—');
}

function labelProjectType(type: unknown, otherLabel: unknown) {
  const t = String(type ?? '');
  if (t === 'autre' && otherLabel) return String(otherLabel);
  if (t === 'ecommerce') return 'E-commerce';
  if (t === 'vitrine') return 'Site vitrine';
  if (t === 'blog') return 'Blog / Média';
  return t || '—';
}

function buildBriefHtml(payload: any, submissionId: string) {
  const d = payload || {};
  const client = d.client || {};
  const project = d.project || {};
  const vb = d.vitrineBlog || {};
  const ec = d.ecommerce || {};
  const content = d.content || {};
  const design = d.design || {};
  const budget = d.budget || {};
  const recap = d.recap || {};

  const brand = process.env['BRAND_NAME'] || 'Brief';

  const payments = (ec.payments || {});
  const paymentLabels: string[] = [];
  if (payments.cb) paymentLabels.push('Carte bancaire');
  if (payments.paypal) paymentLabels.push('PayPal');
  if (payments.stripe) paymentLabels.push('Stripe');
  if (payments.other && payments.otherLabel) paymentLabels.push(String(payments.otherLabel));

  const refs = design.references || {};

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Cahier des charges</title>
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color:#0f172a; }
    .muted { color:#475569; }
    .small { font-size: 12px; }
    .h1 { font-size: 22px; font-weight: 700; margin:0; }
    .h2 { font-size: 13px; font-weight: 700; letter-spacing: .06em; color:#334155; margin: 22px 0 8px; text-transform: uppercase;}
    .grid { display:flex; gap:12px; }
    .col { flex:1; }
    .card-muted { border:1px solid #e2e8f0; background:#f8fafc; border-radius:14px; padding:14px; }
    .row { display:flex; gap:10px; flex-wrap:wrap; }
    .pill { display:inline-block; background:#f1f5f9; border-radius:999px; padding:6px 10px; font-size:12px; color:#334155; }
    .kv { margin: 0; line-height: 1.45; }
    .k { color:#64748b; font-size: 12px; margin-bottom:2px; }
    .v { font-size: 14px; font-weight: 600; }
    ul { margin: 6px 0 0 18px; padding:0; }
    li { margin: 4px 0; }
    .hr { height:1px; background:#e2e8f0; margin: 14px 0; }
  </style>
</head>
<body>
  <div class="row" style="justify-content:space-between; align-items:flex-start;">
    <div>
      <p class="h1">Cahier des charges — version préliminaire</p>
      <p class="muted small" style="margin:6px 0 0;">
        ${escapeHtml(brand)} · Soumission ${escapeHtml(submissionId.slice(0,8))}
      </p>
    </div>
    <div class="pill">À valider</div>
  </div>

  <div class="h2">1. Contexte & contact</div>
  <div class="grid">
    <div class="col card-muted">
      <div class="k">Contact</div>
      <div class="v">${escapeHtml(client.firstName)} ${escapeHtml(client.lastName)}</div>
      ${client.company ? `<p class="kv muted" style="margin:6px 0 0;">${escapeHtml(client.company)}</p>` : ``}
      ${client.sector ? `<p class="kv muted" style="margin:4px 0 0;">${escapeHtml(client.sector)}</p>` : ``}
    </div>
    <div class="col card-muted">
      <div class="k">Coordonnées</div>
      <p class="kv"><span class="muted small">Email :</span> <strong>${escapeHtml(client.email)}</strong></p>
      ${client.phone ? `<p class="kv"><span class="muted small">Téléphone :</span> <strong>${escapeHtml(client.phone)}</strong></p>` : ``}
      <div class="hr"></div>
      <p class="kv"><span class="muted small">Site existant :</span> <strong>${client.hasWebsite ? "Oui" : "Non"}</strong></p>
      ${(client.hasWebsite && client.websiteUrl) ? `<p class="kv"><span class="muted small">URL :</span> <strong>${escapeHtml(client.websiteUrl)}</strong></p>` : ``}
    </div>
  </div>

  <div class="h2">2. Nature du projet</div>
  <div class="card-muted">
    <p class="kv"><span class="muted small">Type :</span> <strong>${escapeHtml(labelProjectType(project.type, project.otherTypeLabel))}</strong></p>
  </div>

  <div class="h2">3. Périmètre fonctionnel</div>
  ${project.type === "ecommerce" ? `
    <div class="card-muted">
      <p class="kv"><span class="muted small">Catalogue :</span> <strong>${escapeHtml(ec.productCount ?? "—")}</strong></p>
      <p class="kv"><span class="muted small">Stock géré par le client :</span> <strong>${ec.manageStock === true ? "Oui" : (ec.manageStock === false ? "Non" : "—")}</strong></p>
      ${paymentLabels.length ? `<p class="kv"><span class="muted small">Paiements :</span> <strong>${escapeHtml(paymentLabels.join(", "))}</strong></p>` : ``}
      <p class="kv"><span class="muted small">Livraison :</span> <strong>${
        ec.shipsFranceOnly === true ? "France uniquement" :
        ec.shipsFranceOnly === false ? "Hors France" : "—"
      }</strong></p>
      ${(ec.shipsFranceOnly === false && ec.countries) ? `<p class="kv"><span class="muted small">Pays :</span> <strong>${escapeHtml(ec.countries)}</strong></p>` : ``}
    </div>
  ` : `
    <div class="card-muted">
      <p class="kv"><span class="muted small">Blog :</span> <strong>${vb.needsBlog === true ? "Oui" : (vb.needsBlog === false ? "Non" : "—")}</strong></p>
      ${vb.needsBlog ? `
        <ul class="muted small">
          <li>Fréquence : <strong>${escapeHtml(vb.blogFrequency ?? "—")}</strong></li>
          <li>Catégories : <strong>${escapeHtml(vb.blogCategories ?? "—")}</strong></li>
        </ul>
      ` : ``}
      <div class="hr"></div>
      <p class="kv"><span class="muted small">Prise de rendez-vous :</span> <strong>${vb.needsBooking === true ? "Oui" : (vb.needsBooking === false ? "Non" : "—")}</strong></p>
      ${vb.needsBooking ? `
        <ul class="muted small">
          <li>Outil : <strong>${escapeHtml(vb.bookingTool ?? "—")}</strong></li>
          ${vb.connectAgenda ? `<li>Agenda : <strong>${escapeHtml(vb.agendaType ?? "—")}</strong></li>` : ``}
        </ul>
      ` : ``}
    </div>
  `}

  <div class="h2">4. Contenus</div>
  <div class="card-muted">
    <p class="kv"><span class="muted small">Disponibilité :</span> <strong>${escapeHtml(content.hasContent ?? "—")}</strong></p>
    ${content.hasContent === "oui"
      ? `<p class="kv"><span class="muted small">Transmission :</span> <strong>${escapeHtml(content.sendMethod ?? "—")}</strong></p>`
      : (content.hasContent
          ? `<p class="kv"><span class="muted small">Aide rédaction :</span> <strong>${content.needsCopywriting === true ? "Oui" : (content.needsCopywriting === false ? "Non" : "—")}</strong></p>
             <p class="kv"><span class="muted small">Aide visuels :</span> <strong>${content.needsVisualHelp === true ? "Oui" : (content.needsVisualHelp === false ? "Non" : "—")}</strong></p>`
          : ``)
    }
  </div>

  <div class="h2">5. Design & inspirations</div>
  <div class="card-muted">
    <p class="kv"><span class="muted small">Charte / logo :</span> <strong>${design.hasBranding === true ? "Oui" : (design.hasBranding === false ? "Non" : "—")}</strong></p>
    ${(design.hasBranding && design.brandingLink) ? `<p class="kv"><span class="muted small">Lien :</span> <strong>${escapeHtml(design.brandingLink)}</strong></p>` : ``}
    <div class="hr"></div>
    <p class="kv"><span class="muted small">Références :</span> <strong>${design.hasReferences === true ? "Oui" : (design.hasReferences === false ? "Non" : "—")}</strong></p>
    ${design.hasReferences ? `
      <ul class="muted small">
        ${refs.ref1Url ? `<li>${escapeHtml(refs.ref1Url)}${refs.ref1Notes ? ` — ${escapeHtml(refs.ref1Notes)}` : ""}</li>` : ``}
        ${refs.ref2Url ? `<li>${escapeHtml(refs.ref2Url)}${refs.ref2Notes ? ` — ${escapeHtml(refs.ref2Notes)}` : ""}</li>` : ``}
        ${refs.ref3Url ? `<li>${escapeHtml(refs.ref3Url)}${refs.ref3Notes ? ` — ${escapeHtml(refs.ref3Notes)}` : ""}</li>` : ``}
      </ul>
    ` : ``}
  </div>

  <div class="h2">6. Budget & délais</div>
  <div class="grid">
    <div class="col card-muted">
      <div class="k">Budget</div>
      <div class="v">${escapeHtml(labelBudget(budget.range))}</div>
    </div>
    <div class="col card-muted">
      <div class="k">Délai</div>
      <div class="v">${escapeHtml(labelTimeline(budget.timeline))}</div>
    </div>
  </div>

  <div class="h2">7. Notes complémentaires</div>
  <div class="card-muted">
    ${recap.additionalNotes
      ? `<p class="kv">${escapeHtml(recap.additionalNotes)}</p>`
      : `<p class="kv muted">Aucune remarque complémentaire.</p>`
    }
    <div class="hr"></div>
    <p class="kv"><span class="muted small">Souhaite être rappelé :</span> <strong>${recap.wantsCallback ? "Oui" : "Non"}</strong></p>
  </div>

</body>
</html>`;
}

async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env['SMTP_HOST'],
    port: Number(process.env['SMTP_PORT'] || '587'),
    secure: Number(process.env['SMTP_PORT']) === 465,
    auth: {
      user: process.env['SMTP_USER'],
      pass: process.env['SMTP_PASS'],
    },
  });
}

/**
 * Restrictive CORS for /api (optional):
 * If ALLOWED_ORIGIN is set, any other Origin will be rejected.
 */
app.post('/api/brief/submit', requireApiKey, async (req: any, res: any) => {
  const submissionId = randomUUID();
  const payload = req.body;

  try {
    const html = buildBriefHtml(payload, submissionId);
    const pdfBuffer = await renderPdf(html);

    const to = process.env['MAIL_TO'];
    const from = process.env['MAIL_FROM'] || 'no-reply@example.com';
    if (!to) return res.status(500).json({ ok: false, error: 'MAIL_TO_MISSING', submissionId });

    const c = payload?.client || {};
    const subjectName = c.company || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Client';
    const subject = `Nouveau cahier des charges — ${subjectName} (${submissionId.slice(0, 8)})`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from,
      to,
      subject,
      text: `Bonjour MERAKI, \n\nVous trouverez en pièce les informations et les demandes d'un client potentiel.\n\n\nCordialement, \nEquipe Interne - MERAKI.`,
      replyTo: c.email || undefined,
      attachments: [
        {
          filename: `cahier-des-charges-${submissionId.slice(0, 8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return res.json({ ok: true, submissionId });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      error: 'PDF_OR_MAIL_FAILED',
      message: err?.message ?? String(err),
      stack: err?.stack ?? null
    });
  }  
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

app.use('/api', (req: any, res: any, next: any) => {
  const allowed = process.env['ALLOWED_ORIGIN'];
  const origin = req.headers.origin;

  if (allowed && origin) {
    if (origin === allowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    } else {
      return res.status(403).json({ ok: false, error: 'CORS_FORBIDDEN' });
    }
  }

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});