import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function decodeHtmlEntities(value) {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function normaliseWhitespace(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function extractBrowserTitle(html, relativePath) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!titleMatch) {
    failures.push(`${relativePath} missing browser title.`);
    return "";
  }

  return normaliseWhitespace(decodeHtmlEntities(titleMatch[1]));
}

function readStudioManifests() {
  const studiosDir = path.join(root, "studios");
  return fs.readdirSync(studiosDir)
    .filter((slug) => fs.existsSync(path.join(studiosDir, slug, "templates.json")))
    .map((slug) => ({
      slug,
      manifest: JSON.parse(read(`studios/${slug}/templates.json`))
    }));
}

const rootIndex = read("index.html");
const studioIndex = read("studios/absolute-dance/index.html");
const styleIndex = read("styles/index.html");
const absoluteManifest = JSON.parse(read("studios/absolute-dance/templates.json"));
const visibleAbsoluteTemplates = absoluteManifest.templates.filter((template) => template.visibility === "visible" && template.status === "enabled");
const hiddenAbsoluteTemplates = absoluteManifest.templates.filter((template) => template.visibility === "hidden");

expect(rootIndex.includes("StudioLAB Admin"), "Root index missing admin title.");
expect(rootIndex.includes('name="robots"') && /noindex/i.test(rootIndex), "Root index missing noindex meta for search engines.");
expect(/slug:\s*["']absolute-dance["']/.test(rootIndex), "Root index static fallback missing absolute-dance entry.");
expect(!rootIndex.includes("github.com"), "Root index leaks external link to GitHub repo.");
expect(!/href=["'][^"']*styles\//.test(rootIndex), "Root index leaks link to internal styles tool.");
expect(absoluteManifest.studio.location && absoluteManifest.studio.location.length > 0, "Absolute Dance manifest missing studio.location field.");
expect(visibleAbsoluteTemplates.length === 4, "Absolute Dance should currently have exactly four visible templates.");
expect(visibleAbsoluteTemplates.some((template) => template.id === "demo-1-warm-modern-enrollment"), "Absolute Dance visible templates should include Demo 1 warm modern enrollment.");
expect(visibleAbsoluteTemplates.some((template) => template.id === "demo-2-conversion-journey"), "Absolute Dance visible templates should include Demo 2 conversion journey.");
expect(visibleAbsoluteTemplates.some((template) => template.id === "demo-3-editorial-feature"), "Absolute Dance visible templates should include Demo 3 editorial feature.");
expect(visibleAbsoluteTemplates.some((template) => template.id === "demo-4-program-pathways"), "Absolute Dance visible templates should include Demo 4 program pathways.");
expect(hiddenAbsoluteTemplates.length === 0, "Absolute Dance should have no hidden templates after cleanup.");
expect(studioIndex.includes("Demo 1"), "Absolute Dance gallery missing visible Demo 1.");
expect(studioIndex.includes("Demo 2"), "Absolute Dance gallery missing visible Demo 2.");
expect(studioIndex.includes("Demo 3"), "Absolute Dance gallery missing visible Demo 3.");
expect(studioIndex.includes("Demo 4"), "Absolute Dance gallery missing visible Demo 4.");
expect(!studioIndex.includes("StudioLAB Website Templates"), "Absolute Dance gallery exposes the master template hub.");
expect(!studioIndex.includes("styles/"), "Absolute Dance gallery exposes internal style tools.");
expect(!studioIndex.includes("mailto:"), "Absolute Dance gallery exposes feedback email.");
expect(!/shortlist|selected|Clear selection|View demos/i.test(studioIndex), "Absolute Dance gallery still includes internal selection or jump controls.");
expect(styleIndex.includes("Style shortlists"), "Style shortlist page missing title.");
expect(fs.existsSync(path.join(root, ".nojekyll")), "Missing .nojekyll for GitHub Pages.");

for (const { slug, manifest } of readStudioManifests()) {
  const studioName = manifest.studio?.name || slug;

  for (const template of manifest.templates || []) {
    const demoPath = `studios/${slug}/${template.path}index.html`;
    const demoIndex = read(demoPath);
    const browserTitle = extractBrowserTitle(demoIndex, demoPath);
    const expectedTitle = `${template.label} | ${studioName} | ${template.title}`;

    expect(
      browserTitle === expectedTitle,
      `${slug}/${template.id} browser tab title should be "${expectedTitle}".`
    );
  }
}

for (const template of absoluteManifest.templates) {
  const demoIndex = read(`studios/absolute-dance/${template.path}index.html`);
  expect(["enabled", "disabled", "archived"].includes(template.status), `${template.id} has invalid status: ${template.status}`);
  expect(["visible", "hidden"].includes(template.visibility), `${template.id} has invalid visibility: ${template.visibility}`);
  expect(demoIndex.includes(template.title), `${template.id} missing title: ${template.title}`);
  expect(demoIndex.includes("Back to template options"), `${template.id} missing same-gallery return link.`);
  expect(!demoIndex.includes("StudioLAB Website Templates"), `${template.id} exposes the master template hub.`);
  expect(demoIndex.includes("../../assets/"), `${template.id} does not use shared studio assets.`);
  expect(fs.existsSync(path.join(root, "studios/absolute-dance", template.preview)), `Missing preview image for ${template.id}.`);
}

const requiredAssets = [
  "logo-2.png",
  "hero-bg.jpg",
  "studio-bg.jpg",
  "faculty-bg.jpg",
  "gallery-1.jpeg",
  "gallery-2.jpeg",
  "team-hero-img.jpg",
  "competitive-team.jpg",
  "video-overlay.jpg",
  "nancy-o.jpg",
  "edward-b.jpg",
  "map.png",
  "favicon.png"
];

for (const asset of requiredAssets) {
  expect(fs.existsSync(path.join(root, "studios/absolute-dance/assets", asset)), `Missing Absolute Dance asset: ${asset}`);
}

if (failures.length) {
  console.error("Site validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Site validation passed.");
