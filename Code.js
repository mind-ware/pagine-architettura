/**
 * Pagine di architettura dei repository, lette da GitHub a ogni visita: un push su master è subito
 * visibile, senza ripubblicare. Le vedono solo gli utenti del dominio (appsscript.json); lo script
 * gira con l'account di chi lo pubblica. Le proprietà dello script tengono il token GitHub
 * (GITHUB_TOKEN) e l'elenco delle pagine (PAGES), così il codice, che è pubblico, non nomina
 * nessun repository. Come aggiungere una pagina e pubblicare una modifica: README.md.
 */
const BRANCH = 'master';
const PATH = 'docs/architettura.html';

// PAGES is JSON: {"chiave": {"label": "Nome nell'elenco", "repo": "mind-ware/Repository"}}.
function pages_() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty('PAGES') || '{}');
}

function doGet(e) {
  const page = pages_()[e.parameter.p];
  if (!page) return index_();
  // The link back to the index goes at the top of the sidebar, which stays on screen on wide displays.
  const back = `<a href="${ScriptApp.getService().getUrl()}" target="_top" style="margin-bottom:16px">← Pagine di architettura</a>`;
  const html = withGithubLinks_(fetchPage_(page), page)
    .replace('<nav class="side" aria-label="Indice">', (nav) => nav + back);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || page.label;
  return HtmlService.createHtmlOutput(html)
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function index_() {
  const url = ScriptApp.getService().getUrl();
  const items = Object.entries(pages_())
    .map(([key, page]) => `<li><a href="${url}?p=${key}" target="_top">${page.label}</a></li>`)
    .join('');
  return HtmlService.createHtmlOutput(`<h1>Pagine di architettura</h1><ul>${items}</ul>`)
    .setTitle('Pagine di architettura');
}

function fetchPage_(page) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const url = `https://api.github.com/repos/${page.repo}/contents/${PATH}?ref=${BRANCH}`;
  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.raw+json' },
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() !== 200) {
    throw new Error(`GitHub risponde ${response.getResponseCode()} per ${page.repo}/${PATH}`);
  }
  return response.getContentText('UTF-8');
}

// The page links the code relatively to docs/: those links lead to the files on GitHub, in a new
// tab, because GitHub refuses to be shown inside the frame of the web app.
function withGithubLinks_(html, page) {
  const base = `https://github.com/${page.repo}/blob/${BRANCH}/`;
  const dir = PATH.split('/').slice(0, -1);
  return html.replace(/href="(?![a-z]+:|#)([^"]+)"/g, (_, target) => {
    const parts = [...dir];
    for (const segment of target.split('/')) {
      if (segment === '..') parts.pop();
      else if (segment && segment !== '.') parts.push(segment);
    }
    return `href="${base}${parts.join('/')}" target="_blank" rel="noopener"`;
  });
}
