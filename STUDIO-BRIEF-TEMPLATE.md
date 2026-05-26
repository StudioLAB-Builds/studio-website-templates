# Studio Brief — Standard Input Format

Every studio website demo is generated from a single JSON brief at `studio-briefs/<slug>.json`. Edit the brief, run the generator, every demo direction re-skins itself. This is the only studio-specific source of truth in this repo. No copy lives inside template files.

## How To Create A Brief

1. Copy `studio-briefs/absolute-dance.json` as a starting reference for a new studio.
2. Replace every field with the new studio's content.
3. Drop replacement images into `studios/<slug>/assets/<demo-or-shared>/` and update the `assets.*` paths in the brief.
4. Run `npm run generate -- <slug>` to render every template engine for that studio.
5. Run `npm run build:galleries` to refresh the studio-facing gallery.
6. Run `npm run validate` to confirm links and structure are healthy.

## Field Inventory

A brief is one JSON object. Top-level keys group fields by concern.

### `identity`
Studio name, short name, tagline, founding year, owner-since year, city/state/region. Used in headlines, header logo alt, footer copyright, SEO metadata.

### `contact`
Address, city line, phone (display + tel:), email, opening hours. Used in footer, FAQ section, click-to-call buttons.

### `links`
External destinations: `portal` (student/parent portal URL), `instagram`, `facebook`. The generator wires these into every CTA, header Register button, and footer social icons. Add new platforms as needed; templates that don't reference them simply ignore the extra fields.

### `brand`
Five OKLCH color tokens (`ink`, `cream`, `teal`, `pink`, `gold`), display + sans font stacks, and the Google Fonts `<link>` href. Re-coloring the entire site is five lines of edit.

### `assets`
Per-studio image paths, relative to `studios/<slug>/assets/`. Logo, favicon, hero, mission, events, class images (keyed by class `id`), faculty (ordered array), parents (ordered array). Drop image files into `studios/<slug>/assets/` and reference them here.

### Content sections
Each major section of the homepage has its own group: `hero`, `marquee`, `mission`, `classesSection` + `classes` array, `whyUs`, `facultySection` + `faculty` array, `events`, `testimonialsSection` + `testimonials` array, `faqSection` + `faq` array, `finalCta`, `footer`, `meta`.

Sections that share a pattern (eyebrow + headline lead/accent/tail) use the same field names so a template engine can render any of them with the same partial. Italic accent words are isolated into `headlineAccent` so the template controls styling without parsing inline markup.

### `meta`
SEO title, description, OpenGraph title and description. The generator wires these into `<head>`.

## Constraints

- **Australian English** in all copy unless the brief explicitly flags a market context (e.g. `identity.market: "US"` for US studios — let the engine override AU defaults).
- **No HTML in field values.** The generator escapes interpolations by default. Use template structure to express formatting, not inline markup in the brief.
- **No brand rules in the brief.** Colors and fonts are tokens; brand voice and design system rules live in the knowledge base repo (see `BRAND.md`).
- **All image paths are relative to `studios/<slug>/assets/`.** Use subfolders to scope per-demo imagery (e.g. `demo-3/hero-stage.jpg`) when an image is bespoke to one template direction.

## Adding A New Template Engine

Each engine lives at `template-engines/<engine-slug>/` and contains:
- `engine.json` — id, label, demoNumber, order, description
- `template.html` — single self-contained HTML file with `{{placeholders}}`

When you add a new engine, the generator picks it up automatically — `npm run generate -- <studio-slug>` will render the new engine for every brief without code changes. Engines are the design directions; briefs are the studios; the generator is the crank that turns one studio into N demos.
