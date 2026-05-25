# Studio Website Templates

A shareable demo library for StudioLAB-generated studio website concepts.

The root page is the internal StudioLAB hub. From there, select a studio folder and send that studio's gallery link to the client. Each studio gallery contains labelled demo previews, and each demo includes a return link back to the studio gallery.

## Current Structure

```text
/
├── index.html
├── styles/
│   └── index.html
├── studios/
│   └── absolute-dance/
│       ├── index.html
│       ├── assets/
│       ├── previews/
│       └── demos/
│           ├── demo-1-current-website/
│           ├── demo-2-warm-modern-enrollment/
│           ├── demo-3-editorial-community/
│           └── demo-4-bold-class-pathways/
└── scripts/
    └── validate-site.mjs
```

## Adding A New Studio

1. Create a new folder under `studios/`, using a kebab-case studio name.
2. Add shared studio assets to `studios/<studio>/assets/`.
3. Add each design option under `studios/<studio>/demos/demo-n-<option-name>/index.html`.
4. Generate a preview image into `studios/<studio>/previews/`.
5. Create or update the studio's `index.html` gallery page so the demo appears as a labelled preview card.
5. Add the studio card to the root `index.html`.
6. Run `npm run validate`.

## Current Absolute Dance Demos

- Demo 1: Current Website Reference
- Demo 2: Warm Modern Enrollment
- Demo 3: Editorial Community
- Demo 4: Bold Class Pathways

## Style Shortlists

Studio gallery pages include shortlist checkboxes. Selecting demos and choosing "View selected styles" opens the `styles/` page with those demos grouped together. This gives StudioLAB a place to start identifying reusable visual directions across studios.

## Local Preview

```bash
npm run start
```

Then open `http://127.0.0.1:8765/`.
