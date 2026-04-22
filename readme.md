# MontaOS

<p align="center">
  <b>A cinematic 3D portfolio shell paired with a live embedded portfolio site.</b>
</p>

<p align="center">
  <img
    src="https://raw.githubusercontent.com/MontaCoder/MontaOS/main/static/images/preview-new.jpg"
    alt="MontaOS preview"
    width="100%"
  />
</p>

## Overview

MontaOS and InnerPortfolio work together as one experience with two distinct
layers.

MontaOS is the outer layer: a workstation-style 3D scene built with React,
Three.js, CSS3DRenderer, and baked GLTF assets. It handles the BIOS-inspired
boot sequence, the desktop environment, ambient audio, camera motion, and the
overall presentation.

InnerPortfolio is the inner layer: the live portfolio site that appears inside
the in-scene monitor. In production it loads from
`https://innerportfolio.netlify.app/`, and in development it points to
`http://localhost:3000/`.

## Highlights

- MontaOS frames the whole experience with the boot flow, the 3D desk setup,
  and the cinematic camera work.
- InnerPortfolio is the live content layer inside the monitor, giving the desk
  a real portfolio to reveal.
- The monitor is rendered in-scene with CSS3D and forwarded events.
- Ambient audio and loading states keep the experience feeling like a real OS.
- Contact form support is backed by Express and Nodemailer.

## Tech Stack

- React 19
- Three.js
- CSS3DRenderer
- Framer Motion
- Express
- Nodemailer
- TypeScript
- Webpack

## Setup

```bash
npm ci
npm run dev
```

The dev server prints both localhost and local network URLs. Add `?debug` to
the URL to skip the loading start gate and jump straight into the experience.

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

## InnerPortfolio

- Live site: [innerportfolio.netlify.app](https://innerportfolio.netlify.app/)
- Source repo: [MontaCoder/innerPortfolio](https://github.com/MontaCoder/innerPortfolio)

