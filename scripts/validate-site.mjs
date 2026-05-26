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

const rootIndex = read("index.html");
const studioIndex = read("studios/absolute-dance/index.html");
const styleIndex = read("styles/index.html");
const absoluteManifest = JSON.parse(read("studios/absolute-dance/templates.json"));
const visibleAbsoluteTemplates = absoluteManifest.templates.filter((template) => template.status === "visible");
const hiddenAbsoluteTemplates = absoluteManifest.templates.filter((template) => template.status === "hidden");

expect(rootIndex.includes("StudioLAB Website Templates"), "Root index missing project title.");
expect(rootIndex.includes("studios/absolute-dance/"), "Root index missing Absolute Dance link.");
expect(rootIndex.includes("styles/"), "Root index missing style shortlist link.");
expect(visibleAbsoluteTemplates.length === 1, "Absolute Dance should currently have exactly one visible template.");
expect(visibleAbsoluteTemplates[0]?.id === "demo-2-warm-modern-enrollment", "Absolute Dance visible template should be the prompt-built Demo 2.");
expect(hiddenAbsoluteTemplates.length === 3, "Absolute Dance should keep three rough concepts hidden.");
expect(studioIndex.includes("Demo 2"), "Absolute Dance gallery missing visible Demo 2.");
expect(!studioIndex.includes("Demo 1"), "Absolute Dance gallery still exposes hidden Demo 1.");
expect(!studioIndex.includes("Demo 3"), "Absolute Dance gallery still exposes hidden Demo 3.");
expect(!studioIndex.includes("Demo 4"), "Absolute Dance gallery still exposes hidden Demo 4.");
expect(!studioIndex.includes("StudioLAB Website Templates"), "Absolute Dance gallery exposes the master template hub.");
expect(!studioIndex.includes("styles/"), "Absolute Dance gallery exposes internal style tools.");
expect(!studioIndex.includes("mailto:"), "Absolute Dance gallery exposes feedback email.");
expect(!/shortlist|selected|Clear selection|View demos/i.test(studioIndex), "Absolute Dance gallery still includes internal selection or jump controls.");
expect(styleIndex.includes("Style shortlists"), "Style shortlist page missing title.");
expect(fs.existsSync(path.join(root, ".nojekyll")), "Missing .nojekyll for GitHub Pages.");

for (const template of absoluteManifest.templates) {
  const demoIndex = read(`studios/absolute-dance/${template.path}index.html`);
  expect(["visible", "hidden"].includes(template.status), `${template.id} has invalid status: ${template.status}`);
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
