# Studio Website Templates

A shareable demo library for StudioLAB-generated studio website concepts.

Each studio has its own folder under `studios/`. Each studio folder can contain multiple visual directions or page concepts, with a studio-level selector page that lets the client flick between options from a single link.

## Current Structure

```text
/
├── index.html
├── studios/
│   └── absolute-dance/
│       ├── index.html
│       ├── assets/
│       └── options/
│           └── warm-modern-enrollment/
│               └── index.html
└── scripts/
    └── validate-site.mjs
```

## Adding A New Studio

1. Create a new folder under `studios/`, using a kebab-case studio name.
2. Add shared studio assets to `studios/<studio>/assets/`.
3. Add each design option under `studios/<studio>/options/<option-name>/index.html`.
4. Create or update the studio's `index.html` selector page so the option appears in the header bar.
5. Add the studio card to the root `index.html`.
6. Run `npm run validate`.

## Local Preview

```bash
npm run start
```

Then open `http://127.0.0.1:8765/`.
