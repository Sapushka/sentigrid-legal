// tools/build-legal.js
// Convert EULA.md, PRIVACY.md, TERMS.md, RISK.md -> HTML twins with canonical + meta + JSON-LD
// Run: node tools/build-legal.js

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

// Simple MD -> HTML
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, '0');
const d = String(today.getDate()).padStart(2, '0');
const dateModified = `${y}-${m}-${d}`;

const PAGES = [
  {
    md: 'PRIVACY.md',
    html: 'PRIVACY.html',
    title: 'SentiGrid — Privacy Policy',
    canonical: 'https://sentigridlegal.github.io/sentigrid-legal/PRIVACY.html',
    description: 'SentiGrid Privacy Policy: how we handle data, security, and user information.',
    jsonldName: 'SentiGrid Privacy Policy',
    altMd: 'https://github.com/SentiGridLegal/sentigrid-legal/blob/main/PRIVACY.md'
  },
  {
    md: 'EULA.md',
    html: 'EULA.html',
    title: 'SentiGrid — End User License Agreement (EULA)',
    canonical: 'https://sentigridlegal.github.io/sentigrid-legal/EULA.html',
    description: 'SentiGrid End User License Agreement (EULA) — rights, restrictions, and usage terms.',
    jsonldName: 'SentiGrid EULA',
    altMd: 'https://github.com/SentiGridLegal/sentigrid-legal/blob/main/EULA.md'
  },
  {
    md: 'TERMS.md',
    html: 'TERMS.html',
    title: 'SentiGrid — Terms of Service',
    canonical: 'https://sentigridlegal.github.io/sentigrid-legal/TERMS.html',
    description: 'SentiGrid Terms of Service: user responsibilities, acceptable use, and legal terms.',
    jsonldName: 'SentiGrid Terms of Service',
    altMd: 'https://github.com/SentiGridLegal/sentigrid-legal/blob/main/TERMS.md'
  },
  {
    md: 'RISK.md',
    html: 'RISK.html',
    title: 'SentiGrid — Risk Disclosure & Educational Disclaimer',
    canonical: 'https://sentigridlegal.github.io/sentigrid-legal/RISK.html',
    description: 'SentiGrid Risk Disclosure and educational disclaimer: no financial advice; trading involves risk of loss.',
    jsonldName: 'SentiGrid Risk Disclosure',
    altMd: 'https://github.com/SentiGridLegal/sentigrid-legal/blob/main/RISK.md'
  }
];

function htmlShell({ title, canonical, description, jsonldName, bodyHtml, altMd }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#page`,
    url: canonical,
    name: jsonldName,
    inLanguage: 'en',
    isAccessibleForFree: true,
    dateModified,
    about: { '@type': 'SoftwareApplication', name: 'SentiGrid', applicationCategory: 'FinanceApplication' }
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="${canonical}">
  <meta name="description" content="${escapeHtmlAttr(description)}">
  <meta name="robots" content="index,follow">
  <link rel="alternate" type="text/markdown" href="${altMd}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    body{font:15px/1.6 system-ui,Segoe UI,Helvetica,Arial,sans-serif;max-width:900px;margin:0 auto;padding:24px;color:#0b1324}
    main h1{margin-top:0}
    main a{word-break:break-word}
    blockquote{border-left:4px solid #e5e7eb;margin:1em 0;padding:.5em 1em;color:#334155;background:#f8fafc;border-radius:6px}
    pre,code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
    pre{white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:8px;border:1px solid #eee}
    table{border-collapse:collapse}
    td,th{border:1px solid #e5e7eb;padding:6px 8px}
  </style>
</head>
<body>
  <main>
${bodyHtml}
  </main>
</body>
</html>`;
}

function escapeHtmlAttr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}

function run() {
  let ok = true;
  for (const page of PAGES) {
    const srcPath = path.resolve(page.md);
    if (!fs.existsSync(srcPath)) {
      console.error(`Missing ${page.md} — skipped`);
      ok = false;
      continue;
    }
    const mdText = fs.readFileSync(srcPath, 'utf8');
    const bodyHtml = md.render(mdText);
    const full = htmlShell({ ...page, bodyHtml });
    fs.writeFileSync(path.resolve(page.html), full, 'utf8');
    console.log(`Built ${page.html} from ${page.md}`);
  }
  if (!ok) process.exitCode = 1;
}

run();
