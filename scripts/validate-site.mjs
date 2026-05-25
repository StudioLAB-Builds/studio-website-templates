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
const optionIndex = read("studios/absolute-dance/options/warm-modern-enrollment/index.html");

expect(rootIndex.includes("Studio Website Templates"), "Root index missing project title.");
expect(rootIndex.includes("studios/absolute-dance/"), "Root index missing Absolute Dance link.");
expect(studioIndex.includes("Warm Modern Enrollment"), "Absolute Dance selector missing option label.");
expect(studioIndex.includes("options/warm-modern-enrollment/"), "Absolute Dance selector missing option path.");
expect(optionIndex.includes("Dance lessons in Midland, TX"), "Absolute Dance option missing expected homepage copy.");
expect(optionIndex.includes("../../assets/logo-2.png"), "Absolute Dance option does not use repo-relative assets.");
expect(!optionIndex.includes("absolute-dance-assets/"), "Absolute Dance option still points at output assets.");
expect(fs.existsSync(path.join(root, ".nojekyll")), "Missing .nojekyll for GitHub Pages.");

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
