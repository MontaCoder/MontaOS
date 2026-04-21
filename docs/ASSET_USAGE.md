# Static Asset Usage

Webpack copies `static/` into `public/` during production builds. Keep assets
there only when they are referenced by source code, HTML metadata, or the remote
monitor experience.

Current asset groups:

- `audio/atmosphere`, `audio/cc`, `audio/keyboard`, `audio/mouse`, and
  `audio/startup` are loaded through `src/Application/sources.ts`.
- `images` contains favicons, touch icons, and the social preview image used by
  `src/index.html`.
- `models` contains GLB scene assets and baked textures loaded through
  `src/Application/sources.ts`.
- `textures/monitor` contains monitor layer textures, hidden video elements,
  cursor assets, and UI control icons referenced by source and HTML.

Before adding large files, add the source reference in the same change. If an
asset is experimental, keep it outside `static/` until it is wired into the app.
