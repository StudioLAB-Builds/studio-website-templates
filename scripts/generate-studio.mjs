#!/usr/bin/env node
/**
 * generate-studio.mjs — turn one studio brief into N static demo HTMLs.
 *
 * Usage:
 *   node scripts/generate-studio.mjs <studio-slug>          → run all engines
 *   node scripts/generate-studio.mjs <studio-slug> <engine> → run one engine only
 *   node scripts/generate-studio.mjs --all                  → every brief × every engine
 *
 * Inputs:
 *   studio-briefs/<slug>.json          → canonical studio data
 *   template-engines/<engine>/         → template.html + engine.json
 *
 * Output:
 *   studios/<slug>/demos/demo-N-<engine>/index.html
 *   studios/<slug>/assets/<...>        → assets are NOT copied here; the brief
 *                                        points to paths already in this folder.
 *
 * Zero deps. Stdlib only. Tiny Mustache-like template:
 *   {{var}}                  HTML-escaped interpolation, dotted paths supported
 *   {{{var}}}                raw interpolation
 *   {{var.[0]}}              array index access
 *   {{#each list}}…{{/each}} iteration; {{this}}, {{@index}}, field access
 *   {{#if val}}…{{/if}}      truthy conditional
 *   {{helper arg}}           registered helpers (see HELPERS below)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ----------------------------- template engine ----------------------------- */

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function resolvePath(ctx, path, scopes = []) {
  if (path === "this" || path.startsWith("this.")) {
    // Resolve the current `this` (innermost __this from each-loop, else innermost scope)
    let thisVal;
    for (let i = scopes.length - 1; i >= 0; i--) {
      const s = scopes[i];
      if (s && Object.prototype.hasOwnProperty.call(s, "__this")) { thisVal = s.__this; break; }
    }
    if (thisVal === undefined) thisVal = scopes[scopes.length - 1] ?? ctx;
    if (path === "this") return thisVal;
    return resolveIn(thisVal, path.slice("this.".length));
  }
  if (path === "@index") {
    for (let i = scopes.length - 1; i >= 0; i--) {
      if (scopes[i]?.["@index"] !== undefined) return scopes[i]["@index"];
    }
    return undefined;
  }
  if (path === "currentYear") return new Date().getFullYear();
  // Try scopes innermost-out (for {{var}} inside {{#each}})
  for (let i = scopes.length - 1; i >= 0; i--) {
    const v = resolveIn(scopes[i], path);
    if (v !== undefined) return v;
  }
  return resolveIn(ctx, path);
}

function resolveIn(obj, path) {
  if (obj == null) return undefined;
  const parts = path.split(".").flatMap((p) => {
    // support .[0] array index syntax: "foo.[0]" → ["foo", "0"]
    const m = p.match(/^\[(\d+)\]$/);
    return m ? [m[1]] : [p];
  });
  let v = obj;
  for (const p of parts) {
    if (v == null) return undefined;
    v = v[p];
  }
  return v;
}

function render(template, ctx, helpers = {}, scopes = []) {
  // 1. {{#each list}} … {{/each}}
  template = template.replace(/{{#each\s+([^}]+?)}}([\s\S]*?){{\/each}}/g, (_, path, body) => {
    const list = resolvePath(ctx, path.trim(), scopes);
    if (!Array.isArray(list)) return "";
    return list
      .map((item, i) => {
        const scope = typeof item === "object" && item !== null ? { ...item, "@index": i } : { "@index": i };
        // For primitive items, {{this}} should resolve to the item itself
        const sub = render(body, ctx, helpers, [...scopes, scope, { __this: item }]);
        return sub.replace(/{{this}}/g, escapeHtml(item));
      })
      .join("");
  });

  // 2. {{#if cond}} … {{/if}}
  template = template.replace(/{{#if\s+([^}]+?)}}([\s\S]*?){{\/if}}/g, (_, path, body) => {
    const v = resolvePath(ctx, path.trim(), scopes);
    return v ? render(body, ctx, helpers, scopes) : "";
  });

  // 3. {{{raw}}} (must run before {{x}})
  template = template.replace(/{{{\s*([^}]+?)\s*}}}/g, (_, expr) => {
    const v = resolveExpr(expr.trim(), ctx, helpers, scopes);
    return v == null ? "" : String(v);
  });

  // 4. {{var}} or {{helper arg}}
  template = template.replace(/{{\s*([^}]+?)\s*}}/g, (_, expr) => {
    const v = resolveExpr(expr.trim(), ctx, helpers, scopes);
    return v == null ? "" : escapeHtml(v);
  });

  return template;
}

function resolveExpr(expr, ctx, helpers, scopes) {
  const tokens = expr.split(/\s+/);
  if (tokens.length === 1) return resolvePath(ctx, tokens[0], scopes);
  // helper form: helperName arg
  const [name, ...args] = tokens;
  const helper = helpers[name];
  if (!helper) return "";
  const resolvedArgs = args.map((a) => {
    // numeric literal?
    if (/^-?\d+$/.test(a)) return Number(a);
    return resolvePath(ctx, a, scopes);
  });
  return helper(...resolvedArgs);
}

/* ------------------------- helpers (template fns) ------------------------- */

function buildHelpers(brief) {
  const sparkleSpans = [
    { l: "8%", t: "22%", s: 8, d: 0, tw: 3.2, df: 9, dx: 30, dy: -50 },
    { l: "14%", t: "68%", s: 5, d: 1.4, tw: 2.6, df: 7, dx: -20, dy: -40 },
    { l: "22%", t: "12%", s: 6, d: 2.1, tw: 3.8, df: 10, dx: 25, dy: 30 },
    { l: "32%", t: "78%", s: 4, d: 0.6, tw: 2.4, df: 8, dx: -15, dy: -30 },
    { l: "44%", t: "18%", s: 7, d: 3.0, tw: 3.4, df: 11, dx: 35, dy: -25 },
    { l: "55%", t: "62%", s: 5, d: 1.0, tw: 2.8, df: 9, dx: -25, dy: -45 },
    { l: "63%", t: "28%", s: 9, d: 2.4, tw: 4.0, df: 12, dx: 20, dy: 40 },
    { l: "72%", t: "82%", s: 4, d: 0.3, tw: 2.5, df: 7, dx: -30, dy: -20 },
    { l: "80%", t: "16%", s: 6, d: 1.7, tw: 3.0, df: 10, dx: 15, dy: -35 },
    { l: "88%", t: "55%", s: 8, d: 2.8, tw: 3.6, df: 9, dx: -20, dy: -50 },
    { l: "92%", t: "30%", s: 5, d: 0.9, tw: 2.7, df: 8, dx: 10, dy: 30 },
    { l: "38%", t: "45%", s: 4, d: 2.0, tw: 2.3, df: 7, dx: 20, dy: -25 },
  ]
    .map(
      (p) =>
        `<span class="sparkle" style="left:${p.l};top:${p.t};--s:${p.s}px;--d:${p.d}s;--tw:${p.tw}s;--df:${p.df}s;--dx:${p.dx}px;--dy:${p.dy}px"></span>`,
    )
    .join("");

  const star =
    '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>';
  const star5 = star.repeat(5);

  const classIcons = {
    ballet:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14c2 2 6 3 10 3 5 0 8-2 8-4 0-2-2-3-5-3l-5-1c-3 0-6 1-7 3-1 1-1 2-1 2Z"/><path d="M9 13c1-1 4-1 5 0M11 17l-1 3M14 17l1 3"/></svg>',
    jazz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
    hiphop:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
    tap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16c0-2 1-3 3-3l3-1 4 2 5 1c2 0 3 1 3 2v2H3v-3Z"/><path d="M6 13V8M10 14V7"/></svg>',
    contemporary:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h12a3 3 0 1 0-3-3M3 12h17a3 3 0 1 1-3 3M3 16h10"/></svg>',
    tots: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8.5a5.5 5.5 0 0 0-9.5-3.8L9 6 7.5 4.7A5.5 5.5 0 0 0 4 8.5c0 6 9 11 9 11s7-5 7-11Z"/></svg>',
  };

  const whyUsIcons = [
    // safe — heart
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8.5a5.5 5.5 0 0 0-9.5-3.8L9 6 7.5 4.7A5.5 5.5 0 0 0 4 8.5c0 6 9 11 9 11s7-5 7-11Z"/></svg>',
    // discipline — compass
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 15 2-5 5-2-2 5-5 2Z"/></svg>',
    // stage time — spotlight
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7l9 12-5 4-11-9V4Z"/><circle cx="7" cy="7" r="2"/></svg>',
  ];

  // Marquee doubled for seamless loop
  const marqueeItemsDoubled = brief.marquee?.items
    ? [...brief.marquee.items, ...brief.marquee.items]
    : [];

  return {
    helpers: {
      lookupClassImage: (id) => brief.assets?.classes?.[id] ?? "",
      lookupFacultyImage: (i) => brief.assets?.faculty?.[i] ?? "",
      lookupParentImage: (i) => brief.assets?.parents?.[i] ?? "",
      iconFor: (id) => classIcons[id] ?? "",
      whyUsIcon: (i) => whyUsIcons[i] ?? "",
    },
    extras: {
      sparkleSpans,
      star5,
      marqueeItemsDoubled,
    },
  };
}

/* --------------------------------- runner --------------------------------- */

function listEngines() {
  return readdirSync(join(ROOT, "template-engines")).filter((n) => {
    try {
      return statSync(join(ROOT, "template-engines", n)).isDirectory();
    } catch {
      return false;
    }
  });
}

function listBriefs() {
  return readdirSync(join(ROOT, "studio-briefs"))
    .filter((n) => n.endsWith(".json"))
    .map((n) => n.replace(/\.json$/, ""));
}

function generate(studioSlug, engineSlug) {
  const briefPath = join(ROOT, "studio-briefs", `${studioSlug}.json`);
  const brief = JSON.parse(readFileSync(briefPath, "utf8"));

  const engineDir = join(ROOT, "template-engines", engineSlug);
  const engineMeta = JSON.parse(readFileSync(join(engineDir, "engine.json"), "utf8"));
  const template = readFileSync(join(engineDir, "template.html"), "utf8");

  const { helpers, extras } = buildHelpers(brief);
  const ctx = { ...brief, ...extras };

  const html = render(template, ctx, helpers);

  const demoFolder = `demo-${engineMeta.demoNumber}-${engineMeta.id}`;
  const outDir = join(ROOT, "studios", studioSlug, "demos", demoFolder);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);

  return { studioSlug, engineSlug, outDir, demoFolder };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
    console.log("Usage: node scripts/generate-studio.mjs <studio-slug> [engine-slug]");
    console.log("       node scripts/generate-studio.mjs --all");
    process.exit(0);
  }

  let pairs = [];
  if (args[0] === "--all") {
    for (const s of listBriefs()) for (const e of listEngines()) pairs.push([s, e]);
  } else {
    const studio = args[0];
    const engines = args[1] ? [args[1]] : listEngines();
    pairs = engines.map((e) => [studio, e]);
  }

  for (const [s, e] of pairs) {
    try {
      const r = generate(s, e);
      console.log(`  ✓ ${r.studioSlug} × ${r.engineSlug}  →  studios/${r.studioSlug}/demos/${r.demoFolder}/`);
    } catch (err) {
      console.error(`  ✗ ${s} × ${e}: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

main();
