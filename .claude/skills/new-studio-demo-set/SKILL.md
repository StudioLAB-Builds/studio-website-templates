---
name: new-studio-demo-set
description: Generate a full set of 3-4 HTML website demos for a new dance studio prospect by scraping their live site, creating a studio folder in the studio-website-templates repo, applying the Master Design Brief, building distinct design directions, generating preview images, committing to GitHub, and outputting the live gallery URL. Use this whenever Gary mentions a new studio prospect, onboarding a studio, building demos for a studio, generating website mockups for a studio, creating a website pack, scraping a studio site to build demos, or any variation involving producing initial website options for a prospective StudioLAB client. Trigger even if Gary just provides a studio URL, a bare domain, or just a studio name and says something like "build demos for this one", "make me a set for this studio", "new prospect, can you do the demos", or pastes a studio link or name. The skill accepts any of: full URL (https://example.com), bare domain (example.com), or studio name only (Absolute Dance Brisbane). Do not use this skill for editing an existing studio's demos (use regenerate-studio-demo for that).
---

# New Studio Demo Set

Generates a complete set of HTML website demos for a new dance studio prospect. Single end-to-end pipeline from input to live gallery URL.

## How this skill collects inputs

At the start of every run, ask Gary the following via the AskUserQuestion tool (or proceed with provided values if he supplied them in the invoking message). Treat any value he gives inline as the answer and do not ask again.

1. **Studio website or name** (required, text): "The studio's existing website URL, bare domain, or just the studio name"
2. **Number of demos** (optional, number, default 4): "How many demos to generate (default 4)"
3. **Optional notes** (optional, long text): "Any specific direction notes, design directions to use or avoid, or context not on the website"

If Gary provided some but not all in the invoking message, only ask for the missing ones.

## Input normalization (do this before anything else)

The first input can arrive in any of three shapes. Resolve it to a final URL before scraping:

1. **Full URL** (starts with `http://` or `https://`): use as-is.
2. **Bare domain** (contains a dot, no spaces, no scheme, e.g. `absolutedance.com.au` or `www.absolutedance.com.au`): prepend `https://` and use that.
3. **Studio name only** (free text, contains spaces or no dot, e.g. `Absolute Dance Brisbane`): use WebSearch to find the studio's official website. Confirm the match is actually a dance studio with that name (check the homepage). If two or more results look plausible, list the top 2 to 3 with their URLs and ask Gary which one before proceeding. Do not silently pick a wrong studio.

Once you have a confirmed URL, log it briefly ("Resolved to: https://..."), then move on to the pipeline.

## Hard rules

Make all technical execution decisions yourself. Apply these constraints to every part of the output.

No em dashes anywhere in any file, copy, comment, or commit message. Use commas, full stops, colons, semicolons, or restructure the sentence instead.

Use language and spelling appropriate to the studio's geographic location. Detect from URL TLD, scraped content, currency symbols, and location signals. AU studios get AU English (enrolment, organisation, colour, mum, centre, recognise). UK studios get UK English. NZ studios get NZ English (close to AU). Canadian studios get Canadian English. US studios get US English. Default to US English only if location is genuinely US or unclear. Use the variant consistently across ALL copy: headlines, body, buttons, FAQ, alt text, everything.

Tone is professional, friendly, conversational, confident. Benefits before features. No generic AI openings. No bracketed numbers as section markers (no "[01]", "[02]" labels). No banned fonts. Follow every rule in the Master Design Brief.

## Working directory

`/Users/gary/Claude_Projects/StudioLAB-Builds/studio-website-templates`

## Required reading before generating

Read these first in order. Do not skip.

1. `CLAUDE.md` and `BRAND.md` at the root of this repo.
2. `https://github.com/StudioLAB-Builds/studiolab-context/blob/main/02-Architecture/Master-Design-Brief.md`, the authoritative design rules. Every demo must pass the Pre-Launch Checklist in this brief.
3. `https://github.com/StudioLAB-Builds/studiolab-context/blob/main/00-Core/Brand-Voice.md`
4. `https://github.com/StudioLAB-Builds/studiolab-context/blob/main/00-Core/AI-Decision-Authority.md`
5. `https://github.com/StudioLAB-Builds/studiolab-context/blob/main/07-Websites/Design-System.md`

## Pipeline

### 1. Scrape the resolved studio URL

Pull and capture:

- Studio name
- Location (city, state or region, country)
- Language and spelling region (AU, US, UK, NZ, CA, or other) based on URL TLD (.com.au, .co.uk, .co.nz, .ca, etc), currency symbols, location names, and copy conventions
- Currency in use (AUD, USD, GBP, NZD, CAD, etc) from any pricing shown
- Brand colors (primary palette)
- Logo
- Typography in use
- Existing copy and voice
- Instructor names and bios if shown
- Class types offered
- Target audience signals
- Schedule structure
- Existing CTAs
- Photography style

Capture brand assets to use in the demos.

### 2. Derive a studio slug in kebab-case from the studio name

### 3. Create folder structure

`studios/{studio-slug}/` with subfolders:

- `assets/`
- `demos/`
- `previews/`

Save the studio's logo and any usable imagery into `assets/`.

### 4. Select the requested number of design directions (default 4)

Each direction must be visually and structurally distinct from the others. Cover a meaningful spread of options. Examples to pick from (not exhaustive):

`warm-modern-enrollment`, `conversion-journey`, `editorial-magazine`, `premium-minimalist`, `story-driven-narrative`, `community-warmth`, `performance-cinematic`, `pathway-program-led`, `family-focused-trust`

Never use the same direction twice in one set. If the optional notes specify directions to use or avoid, honor those.

### 5. Generate each HTML demo

For each design direction, generate a complete demo at:

`studios/{studio-slug}/demos/demo-{n}-{direction-slug}/index.html`

Each demo must:

- Apply the Master Design Brief in full including the Pre-Launch Checklist.
- Use the studio's actual brand colors as the base palette.
- Use the studio's actual logo and imagery where usable, with AI-generated supplements where gaps exist.
- Include an HTML comment at the top explaining the design direction and inspiration.
- Include all required sections per the Master Design Brief's Dance Studio addons: faculty grid with real photos, class catalog, schedule, recital info, parent portal CTA, trial booking flow, parent testimonials, FAQ.
- Use a reassuring, confidence-building tone, not urgency-driven.
- Use the studio's regional English variant consistently across ALL copy.
- Display any pricing in the studio's local currency with the correct symbol.
- Contain no em dashes anywhere.
- Use no generic AI eyebrow labels.
- Use no bracketed numbers as section markers.
- Use no banned fonts.

### 6. Generate preview images

Render each demo's HTML and screenshot the hero region. Save to:

`studios/{studio-slug}/previews/demo-{n}-{direction-slug}.png`

### 7. Create the manifest

`studios/{studio-slug}/templates.json` with an entry for each demo:

- `id`
- `label`: "Demo 1", "Demo 2", etc
- `title`: direction name as proper title
- `description`: one-line in StudioLAB brand voice, in the appropriate regional English
- `path`
- `preview`
- `previewAlt`
- `status`: "visible"
- `order`: 10, 20, 30, 40
- `source`: `"Claude-generated demo for new studio onboarding, {today's date}"`

### 8. Update the studio listing

Update the root `index.html` or relevant studio listing to include the new studio in the gallery hub.

### 9. Build and validate

```
npm run build:galleries
npm run validate
```

Fix any validation errors before continuing.

### 10. Commit and push

Commit message: `"Add {Studio Name} with {n} demos"`. Push to `main`.

### 11. Wait for GitHub Pages

Wait 60 seconds for GitHub Pages to rebuild.

### 12. Output the gallery URL

`https://studiolab-builds.github.io/studio-website-templates/studios/{studio-slug}/?hub=1`

## Final report

Output:

- Final gallery URL
- Studio slug
- Resolved studio URL (especially important if input was a name)
- Detected regional English variant
- Detected currency
- Design directions chosen
- Commit hash
- Any issues encountered

## Failure handling

If at any point the scrape fails or critical info is missing, report what failed and continue with reasonable defaults rather than stopping. Use the optional notes to fill gaps where Gary provided them.
