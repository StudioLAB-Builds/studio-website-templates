import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studiosRoot = path.join(root, "studios");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function renderCards(templates) {
  if (!templates.length) {
    return `
        <article class="empty-card">
          <span class="demo-label">No visible demos</span>
          <h2>Template options are being prepared.</h2>
          <p>This studio folder is ready, but no templates are currently marked visible in the studio manifest.</p>
        </article>`;
  }

  return templates
    .map((template) => {
      const label = escapeHtml(template.label);
      const title = escapeHtml(template.title);
      const description = escapeHtml(template.description);
      const href = escapeHtml(template.path);
      const preview = escapeHtml(template.preview);
      const alt = escapeHtml(template.previewAlt || `${template.label} ${template.title} preview`);

      return `
        <article class="demo-card">
          <a class="preview-link demo-link" href="${href}"><img src="${preview}" alt="${alt}"></a>
          <div class="demo-copy">
            <span class="demo-label">${label}</span>
            <h2>${title}</h2>
            <p>${description}</p>
            <a class="button demo-link" href="${href}">View ${label}</a>
          </div>
        </article>`;
    })
    .join("\n");
}

function renderGallery(studioSlug, manifest) {
  const visibleTemplates = manifest.templates
    .filter((template) => template.status === "visible")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const studio = manifest.studio;
  const gridClass = visibleTemplates.length === 1 ? "demo-grid single" : "demo-grid";
  const cards = renderCards(visibleTemplates);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(studio.pageTitle)}</title>
    <meta name="description" content="${escapeHtml(studio.description)}">
    <link rel="icon" href="${escapeHtml(studio.favicon)}">
    <style>
      :root {
        --ink: #12383d;
        --muted: #60777b;
        --paper: #fbfffe;
        --mist: #eefbf8;
        --teal: #075b60;
        --deep: #04333a;
        --aqua: #16c9b2;
        --pink: #ed2d83;
        --line: rgba(7, 91, 96, 0.16);
        --shadow: rgba(6, 51, 58, 0.14);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
        overflow-x: clip;
      }

      body {
        background:
          radial-gradient(circle at top left, rgba(22, 201, 178, 0.2), transparent 34rem),
          linear-gradient(180deg, #f4fffc, var(--paper) 48%);
        color: var(--ink);
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      img {
        display: block;
        max-width: 100%;
      }

      .wrap {
        margin: 0 auto;
        max-width: 1220px;
        padding: 42px 24px 78px;
      }

      .intro {
        display: grid;
        gap: 28px;
        margin-bottom: 38px;
        max-width: 850px;
      }

      .studio-logo {
        background: #ffffff;
        border: 1px solid var(--line);
        border-radius: 10px;
        box-shadow: 0 18px 44px rgba(6, 51, 58, 0.08);
        display: inline-flex;
        padding: 12px 14px;
        width: fit-content;
      }

      .studio-logo img {
        width: min(300px, 70vw);
      }

      .kicker {
        color: var(--pink);
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        color: var(--deep);
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(2.7rem, 8vw, 5rem);
        font-weight: 500;
        letter-spacing: 0;
        line-height: 1;
      }

      p {
        color: var(--muted);
        font-size: 17px;
        line-height: 1.65;
        max-width: 720px;
      }

      .demo-grid {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .demo-grid.single {
        max-width: 650px;
      }

      .demo-card,
      .empty-card {
        background: #ffffff;
        border: 1px solid var(--line);
        border-radius: 12px;
        box-shadow: 0 24px 60px var(--shadow);
        display: grid;
        overflow: hidden;
      }

      .empty-card {
        gap: 12px;
        padding: 24px;
      }

      .preview-link {
        background: var(--mist);
        display: block;
        min-height: 320px;
        overflow: hidden;
      }

      .preview-link img {
        height: 100%;
        object-fit: cover;
        object-position: top;
        transition: transform 220ms ease;
        width: 100%;
      }

      .demo-card:hover .preview-link img {
        transform: scale(1.02);
      }

      .demo-copy {
        display: grid;
        gap: 12px;
        padding: 22px;
      }

      .demo-label {
        background: var(--aqua);
        border-radius: 999px;
        color: var(--deep);
        display: inline-flex;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.08em;
        padding: 7px 10px;
        text-transform: uppercase;
        width: fit-content;
      }

      .demo-copy h2,
      .empty-card h2 {
        color: var(--deep);
        font-size: 24px;
        font-weight: 900;
        line-height: 1.12;
      }

      .button {
        align-items: center;
        background: var(--pink);
        border-radius: 999px;
        color: #ffffff;
        display: inline-flex;
        font-size: 13px;
        font-weight: 900;
        justify-content: center;
        min-height: 42px;
        padding: 0 16px;
        white-space: nowrap;
        width: fit-content;
      }

      @media (max-width: 900px) {
        .wrap {
          padding: 30px 18px 62px;
        }

        .demo-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .preview-link {
          min-height: 240px;
        }
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="intro" aria-label="${escapeHtml(studio.name)} website template options">
        <div class="studio-logo"><img src="${escapeHtml(studio.logo)}" alt="${escapeHtml(studio.name)}"></div>
        <div>
          <span class="kicker">${escapeHtml(studio.kicker)}</span>
          <h1>${escapeHtml(studio.heading)}</h1>
        </div>
        <p>${escapeHtml(studio.intro)}</p>
      </section>

      <section class="${gridClass}" aria-label="${escapeHtml(studio.name)} demos">${cards}
      </section>
    </main>
  </body>
</html>
`;
}

for (const studioSlug of fs.readdirSync(studiosRoot)) {
  const studioDir = path.join(studiosRoot, studioSlug);
  const manifestPath = path.join(studioDir, "templates.json");

  if (!fs.statSync(studioDir).isDirectory() || !fs.existsSync(manifestPath)) {
    continue;
  }

  const manifest = readJson(manifestPath);
  const html = renderGallery(studioSlug, manifest);
  fs.writeFileSync(path.join(studioDir, "index.html"), html);
  console.log(`Built gallery: studios/${studioSlug}/index.html`);
}
