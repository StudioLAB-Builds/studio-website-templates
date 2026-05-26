# Studio Website Templates

A shareable template library for StudioLAB-generated studio website concepts.

The root page is the internal StudioLAB hub. From there, select a studio folder and send that studio's clean gallery link to the client. Each studio gallery is generated from a `templates.json` manifest so drafts can be kept in the repo without being shown to the studio.

## Current Structure

```text
/
├── index.html
├── styles/
│   └── index.html
├── studios/
│   └── absolute-dance/
│       ├── index.html
│       ├── templates.json
│       ├── assets/
│       ├── previews/
│       └── demos/
│           ├── demo-1-current-website/
│           ├── demo-2-warm-modern-enrollment/
│           ├── demo-3-conversion-journey/
│           ├── demo-3-editorial-community/
│           └── demo-4-bold-class-pathways/
└── scripts/
    └── validate-site.mjs
```

## Adding A New Studio

1. Create a new folder under `studios/`, using a kebab-case studio name.
2. Add shared studio assets to `studios/<studio>/assets/`.
3. Add a `templates.json` manifest for the studio.
4. Add each design option under `studios/<studio>/demos/<template-slug>/index.html`.
5. Generate a preview image into `studios/<studio>/previews/`.
6. Add the template to `templates.json`.
7. Add the studio card to the root `index.html`.
8. Run `npm run build:galleries`.
9. Run `npm run validate`.

## Current Absolute Dance Demos

- Visible: Demo 2, Warm Modern Enrollment. This is the prompt-built homepage redesign.
- Visible: Demo 3, Conversion Journey. This is the cleaned earlier conversion-focused homepage build.
- Hidden: Demo 1, Editorial Community, and Bold Class Pathways. These stay out of the client-facing gallery because they are not approved template options.

## Showing, Hiding, Or Removing Templates

Each studio manifest uses a `status` field:

- `visible` renders the template in the studio-facing gallery.
- `hidden` keeps the file in the repo but removes it from the studio-facing gallery.

To hide a template, change its status to `hidden` in `studios/<studio>/templates.json`, then run `npm run build:galleries` and `npm run validate`.

To remove a template completely, delete the manifest entry, delete its demo folder and preview image, then run `npm run build:galleries` and `npm run validate`.

## Uploading New Template Files

For a finished template generated outside chat, upload the complete project folder into `studios/<studio>/demos/<template-slug>/`. The folder must contain an `index.html`. If it has its own images, keep them inside that same template folder, or use the studio-level shared assets in `studios/<studio>/assets/`.

Add a matching preview image to `studios/<studio>/previews/`, then add a manifest entry with `status` set to `visible` when it is ready for the studio to see. Set it to `hidden` while it is still being reviewed internally.

## Style Shortlists

The `styles/` page remains an internal holding area for future reusable style groupings. Studio-facing galleries no longer show shortlist controls.

## Local Preview

```bash
npm run start
```

Then open `http://127.0.0.1:8765/`.
