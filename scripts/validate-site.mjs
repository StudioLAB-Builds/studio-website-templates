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

expect(rootIndex.includes("StudioLAB Website Templates"), "Root index missing project title.");
expect(rootIndex.includes("studios/absolute-dance/"), "Root index missing Absolute Dance link.");
expect(rootIndex.includes("styles/"), "Root index missing style shortlist link.");
expect(studioIndex.includes("Demo 1"), "Absolute Dance gallery missing Demo 1.");
expect(studioIndex.includes("Demo 2"), "Absolute Dance gallery missing Demo 2.");
expect(studioIndex.includes("Demo 3"), "Absolute Dance gallery missing Demo 3.");
expect(studioIndex.includes("Demo 4"), "Absolute Dance gallery missing Demo 4.");
expect(studioIndex.includes("View selected styles"), "Absolute Dance gallery missing shortlist action.");
expect(styleIndex.includes("Style shortlists"), "Style shortlist page missing title.");
expect(fs.existsSync(path.join(root, ".nojekyll")), "Missing .nojekyll for GitHub Pages.");

const demos = [
  ["demo-1-current-website", "Current Website Reference"],
  ["demo-2-warm-modern-enrollment", "Warm Modern Enrollment"],
  ["demo-3-editorial-community", "Editorial Community"],
  ["demo-4-bold-class-pathways", "Bold Class Pathways"]
];

for (const [slug, label] of demos) {
  const demoIndex = read(`studios/absolute-dance/demos/${slug}/index.html`);
  expect(demoIndex.includes(label), `${slug} missing label: ${label}`);
  expect(demoIndex.includes("Back to Absolute Dance templates"), `${slug} missing return link.`);
  expect(demoIndex.includes("../../assets/"), `${slug} does not use shared studio assets.`);
  expect(fs.existsSync(path.join(root, `studios/absolute-dance/previews/${slug}.png`)), `Missing preview image for ${slug}.`);
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
