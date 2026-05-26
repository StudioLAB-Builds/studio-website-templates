# GENERATION-WORKFLOW.md — Multi-AI Variation Workflow

End-to-end process for generating, reviewing, and shipping studio website templates when multiple AI tools (Claude Code, Codex, Antigravity's built-in agent, Gemini, others) are working from the same studio brief.

The point of this workflow is to compare design directions across models on equal footing, then merge the chosen direction (or a hybrid of two) to the studio's gallery. Every AI starts from identical inputs. Variation comes from the models, not the brief.

---

## Step 1. Receive Prospect Interest

A studio gets in touch (inbound enquiry, demo request, referral, sales conversation). Capture the basics:

- Studio name and location.
- Existing website URL if they have one.
- Approximate student count and number of locations.
- The vibe Gary read off the conversation (warm-and-friendly, premium-competitive, contemporary-urban, ballet-traditional, etc.).
- Any "must have" features they mentioned.

Quick notes only at this stage. The full brief comes next.

---

## Step 2. Fill In The Studio Brief

Copy `STUDIO-BRIEF-TEMPLATE.md` to a working file (kept locally, not committed) and fill in every field. Treat empty fields as a problem to fix before generation, not a gap for the AI to invent its way around.

If a section genuinely does not apply, write `N/A` with a one-line reason. Do not delete the section.

The completed brief is the single input that every AI tool will consume. The quality of the brief sets the ceiling on the quality of every variant.

---

## Step 3. Hand The Brief To Each AI Tool

For every AI tool being used in this round (Claude Code, Codex, Antigravity, Gemini, others), open a fresh session in this repo and give it the same opening message:

> Read `CLAUDE.md`, then `BRAND.md`, then the four required knowledge base files referenced in `BRAND.md`, then read the attached studio brief. Generate a homepage variant for [studio-slug] under `studios/[studio-slug]/demos/[variant-slug]/index.html`. Commit it to branch `[tool-prefix]/[studio-slug]-[variant-slug]` with the manifest entry set to `status: hidden`. Add a preview PNG under `studios/[studio-slug]/previews/[variant-slug].png`.

Each AI then:

1. Reads `CLAUDE.md` for repo conventions.
2. Reads `BRAND.md` and follows the links into the knowledge base for brand voice, visual identity, design system spec, and template strategy.
3. Reads the studio brief.
4. Generates its variant.

Identical inputs. Different models. Different outputs.

---

## Step 4. Each AI Commits To Its Own Branch

Branches are named with the AI tool prefix so it is instantly obvious which model produced which design.

Format:

```
<tool>/<studio-slug>-<variant-slug>
```

Examples:

```
claude/rivertown-dance-warm-modern-enrollment
codex/rivertown-dance-warm-modern-enrollment
antigravity/rivertown-dance-warm-modern-enrollment
gemini/rivertown-dance-warm-modern-enrollment

claude/rivertown-dance-bold-competition-energy
codex/rivertown-dance-conversion-journey
```

File locations within the branch:

```
studios/<studio-slug>/demos/<variant-slug>/index.html
studios/<studio-slug>/previews/<variant-slug>.png
studios/<studio-slug>/templates.json      # updated with new entry, status: hidden
```

Each AI's commit message should follow the pattern:

```
Add <variant-slug> variant for <studio-slug> (<tool-name>)
```

---

## Step 5. Variants Stay Hidden Until Review

In `studios/<studio-slug>/templates.json`, the new variant lands with `status: hidden`. The studio does not see unreviewed work in their gallery.

Example manifest state after three AI tools have each contributed a variant:

```json
{
  "studio": "rivertown-dance",
  "templates": [
    {
      "slug": "warm-modern-enrollment-claude",
      "title": "Warm Modern Enrollment",
      "preview": "previews/warm-modern-enrollment-claude.png",
      "generated_by": "claude",
      "order": 10,
      "status": "hidden"
    },
    {
      "slug": "warm-modern-enrollment-codex",
      "title": "Warm Modern Enrollment",
      "preview": "previews/warm-modern-enrollment-codex.png",
      "generated_by": "codex",
      "order": 20,
      "status": "hidden"
    },
    {
      "slug": "warm-modern-enrollment-antigravity",
      "title": "Warm Modern Enrollment",
      "preview": "previews/warm-modern-enrollment-antigravity.png",
      "generated_by": "antigravity",
      "order": 30,
      "status": "hidden"
    }
  ]
}
```

---

## Step 6. Review The Variants

Two equally valid review paths:

**Local review.** Check out each branch, run `npm run start`, and open the per-studio gallery. Walk through each variant in the browser at full resolution. This is the right path when comparing motion, interaction, and responsive behaviour.

**GitHub review.** Open the branches on GitHub and view the rendered preview PNGs side by side. This is the right path for a fast visual-only triage before committing to a deeper local review.

Compare across:

- How clearly the variant reads against the brief's stated audience and vibe.
- How well it follows the design system spec from the knowledge base.
- How well the copy lands against the brand voice rules.
- Whether the conversion path matches what the studio said they need (trial booking, enquiry form, recital info page, etc.).
- Whether anything in the variant breaks the hard rules (em dashes, generic openings, off-brand colour, platform names in copy).

---

## Step 7. Merge The Chosen Direction

The chosen variant (or a hybrid built from two variants) is merged to `main`. At merge time:

1. Update the variant's manifest entry to `status: visible`.
2. Keep the unchosen variants as `status: hidden` in the manifest, but leave their branches available so the team can return to them later.
3. Run the validation script (`npm run validate`) and any gallery build script. Fix anything that flags.

Manifest update example (the chosen variant flips visible):

```diff
 {
-  "slug": "warm-modern-enrollment-claude",
-  "status": "hidden",
+  "slug": "warm-modern-enrollment-claude",
+  "status": "visible",
   "order": 10
 }
```

Push to `main`. GitHub Pages picks up the change on the next deploy.

---

## Step 8. Share The Gallery Link With The Studio

Send the studio the per-studio gallery URL:

```
https://studiolab-builds.github.io/studio-website-templates/studios/<studio-slug>/
```

That URL only shows variants with `status: visible`. Hidden variants stay invisible to the studio even though they remain in the repo.

The internal hub at `https://studiolab-builds.github.io/studio-website-templates/` is for StudioLAB use only and should not be shared with studios.

---

## Step 9. Iterate On Feedback

When the studio sends feedback, the loop is the same shape as the first round, just narrower:

1. Update the brief with the new direction or constraint.
2. Reopen the relevant AI session (often just one tool this round, not all of them).
3. Generate a new variant on a new branch using the same prefix convention.
4. Commit as `hidden`.
5. Review.
6. Merge, flip to `visible`, share the updated gallery link.

Old variants stay in the repo as `hidden` for reference. Do not delete them. They are useful when a later studio brief looks similar.

---

## Quick Reference

| Action | Convention |
|---|---|
| Branch name | `<tool>/<studio-slug>-<variant-slug>` |
| Variant location | `studios/<studio-slug>/demos/<variant-slug>/index.html` |
| Preview location | `studios/<studio-slug>/previews/<variant-slug>.png` |
| Manifest path | `studios/<studio-slug>/templates.json` |
| New variant default status | `hidden` |
| Visibility flip | `hidden` → `visible` only after internal review and merge to `main` |
| Studio-facing URL | `https://studiolab-builds.github.io/studio-website-templates/studios/<studio-slug>/` |
| Internal hub URL | `https://studiolab-builds.github.io/studio-website-templates/` (StudioLAB only, do not share with studios) |
