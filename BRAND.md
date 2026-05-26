# BRAND.md — Bridge To The Knowledge Base

This file is the **only** place brand, voice, and design context is referenced from inside this repo. It does not contain those rules. It points to where they live.

If a brand rule, colour token, type scale, photography direction, or design system component needs to change, change it in the knowledge base repo and let the change cascade. Do not copy the rule into this repo, do not paraphrase it into `CLAUDE.md` or a template, do not let it drift into a fork.

One source of truth, referenced from here.

---

## Knowledge Base Repo

`https://github.com/StudioLAB-Builds/studiolab-context`

This is the canonical home for StudioLAB brand voice, visual identity, design system specification, and the broader product and business context that informs every studio template generated in this repo.

---

## Required Reading Before Generating Any Studio Template

Read all four files before producing any HTML, copy, or design judgement for a studio template:

| Purpose | Direct link |
|---|---|
| Brand voice (tone, vocabulary, what to avoid) | https://github.com/StudioLAB-Builds/studiolab-context/blob/main/00-Core/Brand-Voice.md |
| Visual identity (colour, typography, photography, logo treatment) | https://github.com/StudioLAB-Builds/studiolab-context/blob/main/08-Marketing/Visual-Identity.md |
| Design system specification (components, layout, spacing, motion, accessibility) | https://github.com/StudioLAB-Builds/studiolab-context/blob/main/07-Websites/Design-System.md |
| Studio website template strategy (what these templates are for, what good looks like) | https://github.com/StudioLAB-Builds/studiolab-context/blob/main/07-Websites/Studio-Website-Templates.md |

If a session has not read these in the current context window, stop and read them. Brand and design rules evolve. The version a model remembers from a prior session is almost certainly stale.

---

## Cascading Updates, Not Duplicated Rules

The contract is simple:

- Brand change in the knowledge base → automatically applies to every new template generated here, because every AI session reads the knowledge base before writing.
- Brand change copy-pasted into this repo → two sources of truth, immediate drift, broken contract. Do not do this.

If you find a brand rule, a colour value, a font name, a tone phrase, or a design system component hard-coded into this repo's documentation, that is a bug. Move the rule back to the knowledge base and replace the inline copy with a reference.

The exception is template HTML itself. Template HTML obviously contains colour values and font references at the implementation level. That is the implementation reflecting the spec, not a competing source of truth.

---

## Hard Rules To Carry Through To Every Generated Template

These rules originate in the knowledge base and are restated here because they are non-negotiable. They apply to every variant, every studio, every model:

- **No em dashes**, ever. Use commas, full stops, or parentheses. No exceptions, including in headlines, button copy, microcopy, or alt text.
- **US English** for all website copy that appears in a studio template. Studios in this library are US-based unless a brief explicitly flags otherwise.
- **No generic AI openings or filler phrases** in any copy. Banned examples: "I hope you're doing well", "Just checking in", "In today's fast-paced world", "Welcome to our studio family", "Whether you're a beginner or an expert", "Look no further".
- **Benefits before features.** Lead with what the studio's audience gains. Describe the feature only after the benefit has landed.
- **Tone: professional, friendly, conversational, confident, clear.** Warm without being saccharine. Direct without being curt. Never breathless. Never corporate.
- **No reference to underlying platforms** (GoHighLevel, GHL, Stripe internals, etc.) in studio-facing copy. The StudioLAB Growth product name is the only label that appears externally.

If a model's default style conflicts with any of the above, the rules above win.

---

## What This File Is Not

- Not a brand voice guide. The guide is in the knowledge base.
- Not a design system. The system is in the knowledge base.
- Not a copy library. Generate copy from the brief, the voice file, and the audience, not from this file.

This file's only job is to point AI tools to the right source and enforce the rules that cannot be allowed to drift.
