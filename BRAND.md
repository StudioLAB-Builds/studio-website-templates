# Brand Bridge

The brand voice, visual identity, and design system for StudioLAB live in the knowledge base repo, not in this repo. This file is the only place brand context is referenced from. Update brand in the knowledge base, not here.

## Knowledge Base Repo

`https://github.com/StudioLAB-Builds/studiolab-context`

If that org path is not accessible, fall back to the `studiolab-context` repo under the personal GitHub account.

## Required Files To Read Before Generating Templates

Read all four before producing any studio template HTML, design critique, or content variant:

| Purpose | Path in knowledge base repo |
|---|---|
| Brand voice — tone, vocabulary, what to avoid | `00-Core/Brand-Voice.md` |
| Visual identity — colour, typography, photography, logo treatment | `08-Marketing/Visual-Identity.md` |
| Design system specification — components, layout rules, spacing, motion | `07-Websites/Design-System.md` |
| Studio website template strategy — purpose of these templates, what good looks like | `07-Websites/Studio-Website-Templates.md` |

## Cascading Updates, Not Duplicated Rules

If a brand rule, colour token, type scale, or design system component needs to change, change it in the knowledge base repo. This repo will pick it up the next time an AI session reads the source. Do not copy brand rules into this repo. Do not paraphrase them into `CLAUDE.md` or anywhere else. One source of truth, referenced from here.

## What Lives In This Repo Instead

The implementations. Per-studio asset folders, demo HTML files, the manifest system that decides what a prospect sees, the gallery generator, the validation script. Anything brand-shaped that ends up hard-coded here is a bug — flag it and move the rule back to the knowledge base.
