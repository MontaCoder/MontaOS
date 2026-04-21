# MontaOS

MontaOS is an immersive 3D portfolio built with React, Three.js, CSS3DRenderer,
and baked GLTF assets. The experience includes a BIOS-style boot sequence, a
virtual monitor iframe, spatial audio, and cinematic camera transitions.

## Setup

```bash
npm ci
npm run dev
```

The dev server prints both localhost and local network URLs. Add `?debug` to the
URL to skip the loading start gate and show the FPS panel.

## Production

```bash
npm run build
npm start
```

The Express server serves `public/` and exposes `POST /api/send-email`.

## Validation

```bash
npm run typecheck
npm run build
```

Type checking is the main source-level validation step. Build the production
bundle after it passes.

## Environment

The contact endpoint uses these optional environment variables:

- `PORT`: Express port, default `8080`
- `FOLIO_EMAIL`: SMTP username
- `FOLIO_PASSWORD`: SMTP password
- `CORS_ORIGINS`: comma-separated allowed origins for production

Without `CORS_ORIGINS`, same-origin requests and local development origins are
allowed.

