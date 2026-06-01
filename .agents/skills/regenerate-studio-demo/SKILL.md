---
name: regenerate-studio-demo
description: Replace a single demo within an existing studio's gallery in the studio-demos repo. Keep what works, retry what does not. Use this whenever Gary asks to regenerate a demo, replace a demo, redo demo number N, swap out a demo, try a different direction for a specific demo, iterate on a demo, or any variation of targeted single-demo replacement for an existing studio. Trigger on phrases like "regenerate demo 3 for absolute-dance", "replace the editorial one", "redo demo 2", "the magazine direction is not working, try something else", "swap demo 4", or "iterate on the third demo". Do not use for generating a full new set of demos (use new-studio-demo-set for that) and do not use for studios that do not yet exist in the repo.
---

# Regenerate Studio Demo

Targeted single-demo replacement inside an existing studio's gallery. Surgical, not a full rebuild.

## How this skill collects inputs

At the start of every run, ask Gary the following via the AskUserQuestion tool (or proceed with provided values if he supplied them in the invoking message). Treat any value he gives inline as the answer and do not ask again.

1. **Studio slug** (required, text): "The studio's slug in the repo (e.g. absolute-dance)"
2. **Demo to replace** (required, text): "The demo slug to replace (e.g. demo-3-editorial-magazine) or the demo number (e.g. 3)"
3. **New design direction** (optional, text): "The new design direction to use, or leave blank to let Codex pick something different"
4. **Iteration notes** (optional, long text): "What didn't work about the previous version, what to do differently, or any specific requirements"

If Gary provided some but not all in the invoking message, only ask for the missing ones.

## Hard rules

Make all technical execution decisions yourself.

No em dashes anywhere in any file, copy, comment, or commit message. Use commas, full stops, colons, semicolons, or restructure the sentence instead.

Use the same regional English variant as the studio's existing demos. Detect AU/US/UK/NZ/CA from existing demo content for consistency. One studio, one variant, across all demos.

Follow every rule in the Master Design Brief.

## Working directory

`/Users/gary/Claude_Projects/StudioLAB-Builds/studio-demos`

## Required reading before generating

Read these first in order. Do not skip.

1. `AGENTS.md` and `BRAND.md` at the root of this repo.
2. `https://github.com/StudioLAB-Builds/studiolab-context/blob/main/02-Architecture/Master-Design-Brief.md`
3. `https://github.com/StudioLAB-Builds/studiolab-context/blob/main/00-Core/Brand-Voice.md`
4. `https://github.com/StudioLAB-Builds/studiolab-context/blob/main/00-Core/AI-Decision-Authority.md`
5. The studio's existing folder at `studios/{studio-slug}/`. Review the manifest, see what demos already exist, look at the visible ones to:
   - maintain visual brand consistency with the studio's established identity
   - detect the regional English variant already in use (AU/US/UK/NZ/CA spelling conventions)
   - detect the currency in use for any pricing

## Pipeline

### 1. Identify the demo to replace

Based on the input, accept either the full slug or a demo number. If a number, look it up in the manifest by label.

### 2. Choose the new design direction

If Gary provided a new design direction, use that.

If not, pick a direction that is genuinely different from all OTHER demos still in the studio's gallery, not just different from the one being replaced. The goal is a meaningful spread across the four demos.

### 3. Delete the old demo

Remove the old demo folder at `studios/{studio-slug}/demos/{old-demo-slug}/` and the old preview at `studios/{studio-slug}/previews/{old-demo-slug}.png`. Use `git rm`.

### 4. Generate the new demo

Path: `studios/{studio-slug}/demos/demo-{n}-{new-direction-slug}/index.html`

Keep the same demo number from the old position so the gallery numbering stays consistent.

### 5. Apply the Master Design Brief in full

Use the studio's existing brand assets from `studios/{studio-slug}/assets/`. Honor the iteration notes if provided, these explain what did not work last time. Use the same regional English variant as the studio's existing demos, consistent across all demos for one studio. Display any pricing in the same currency as the existing demos.

No em dashes. No generic AI eyebrow labels. No bracketed numbers as section markers. No banned fonts.

### 6. Generate the new preview image

`studios/{studio-slug}/previews/demo-{n}-{new-direction-slug}.png`

### 7. Update the manifest

`studios/{studio-slug}/templates.json`:

- Remove the old entry
- Add the new entry with the same demo number/order as the old one
- `status`: "visible"
- `source`: `"Codex regenerated demo, {today's date}, iteration of previous {old-direction-name}"`

### 8. Build and validate

```
npm run build:galleries
npm run validate
```

Fix any errors.

### 9. Commit and push

Commit message: `"Replace demo-{n} for {Studio Name} ({old-direction} -> {new-direction})"`. Push to `main`.

### 10. Wait for GitHub Pages

Wait 60 seconds for GitHub Pages to rebuild.

### 11. Output the gallery URL

`https://studiolab-builds.github.io/studio-demos/studios/{studio-slug}/?hub=1`

## Final report

Output:

- Gallery URL with the updated demo
- Old demo slug removed
- New demo slug created
- New design direction
- Regional English variant maintained
- Commit hash
- Any issues encountered
