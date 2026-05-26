# AI Entry Point — Studio Website Templates

This file is the master entry point for any AI tool working in this repo: Claude, Codex, Gemini, or anything that comes next. Read this first, then read the files it points to, then start work.

## What This Repo Is

A demo library of studio website templates. Each studio gets its own folder containing one or more homepage concept builds. The repo is served as a static site via GitHub Pages so prospects and existing studios can review template directions through a clean gallery link.

The repo holds the **how** — the actual HTML, assets, and manifest plumbing. The brand voice, visual identity, and design system that the templates should express live in a separate knowledge base repo. See `BRAND.md` for the bridge.

## What This Repo Is Not

Not a production hosting platform. Not a CMS. Not the source of brand truth. Templates here are review artefacts shown to prospective studio clients to anchor a conversation about direction, then handed off to build.

## Repo Structure

```
/
├── CLAUDE.md                     ← you are here
├── BRAND.md                      ← bridge to knowledge base for brand/design
├── GENERATION-WORKFLOW.md        ← multi-AI variation workflow
├── STUDIO-BRIEF-TEMPLATE.md      ← standard input format for a new studio
├── README.md                     ← human operational documentation
├── index.html                    ← internal StudioLAB hub (lists studios)
├── .nojekyll                     ← forces GitHub Pages to serve as-is
├── package.json                  ← scripts only, no runtime deps
├── scripts/
│   ├── build-studio-galleries.mjs  ← renders studio gallery pages from manifest
│   └── validate-site.mjs           ← link and structure validation
├── styles/
│   └── index.html                ← internal holding area for style groupings
└── studios/
    └── <studio-slug>/
        ├── index.html            ← generated studio-facing gallery
        ├── templates.json        ← manifest controlling visibility and order
        ├── assets/               ← shared imagery for this studio
        ├── previews/             ← preview PNGs referenced by manifest
        └── demos/
            └── <template-slug>/
                └── index.html    ← the actual demo build
```

## Required Reading Before Any Generation Work

Every AI session that is about to generate, modify, or critique a studio template MUST read both sources before writing any HTML:

1. **Knowledge base repo** — brand voice, visual identity, design system spec, and studio website template strategy. See `BRAND.md` for the exact file paths in the knowledge base repo.
2. **This repo's `STUDIO-BRIEF-TEMPLATE.md`** — confirms the input shape the studio brief will arrive in, so the AI knows what fields it can rely on.

If either source has not been read in the current session, stop and read it. Do not generate from memory of past sessions. The knowledge base is the source of truth and it can change between sessions.

## Manifest System

Each studio has a `templates.json` at `studios/<studio>/templates.json`. The manifest controls what the prospect sees when they open the studio's gallery link. Two fields matter most:

- `status`: `visible` shows the demo in the studio-facing gallery. `hidden` keeps the demo in the repo but excludes it from the gallery. Use `hidden` for drafts, AI variants that were not selected, and reference builds.
- `order`: lower numbers render first. Leave gaps (10, 20, 30) so new entries can slot between existing ones without renumbering.

After any manifest change, run `npm run build:galleries` then `npm run validate`. The gallery `index.html` is generated, not hand-edited.

## Multi-AI Variation Workflow

This repo expects multiple AI tools to produce competing variants for the same studio brief. Branch naming convention:

- `claude/<studio-slug>-<variant-slug>`
- `codex/<studio-slug>-<variant-slug>`
- `gemini/<studio-slug>-<variant-slug>`

Variants live at `studios/<studio>/demos/<variant-slug>/`. When tracking which AI produced which build matters, include the AI tool in the variant slug (for example `demo-warm-modern-claude`, `demo-warm-modern-codex`). Full workflow in `GENERATION-WORKFLOW.md`.

## Cross-AI Parity Expectation

Every AI tool working here reads the same brand source, the same design system, and the same studio brief. Variation between outputs is expected to come from differences between the models, not from differences in inputs. If an AI is producing off-brand work, the failure is almost always one of these, in order:

1. The AI did not read the knowledge base brand and design files this session.
2. The studio brief was incomplete and the AI filled gaps from training data instead of asking.
3. The AI optimised for visual flourish over the StudioLAB design system rules.

Read the sources. Ask if the brief is missing a field. Follow the design system over your instinct.

## Australian English

All written copy in templates uses Australian English unless the studio brief explicitly flags a US, UK, or other market context.
