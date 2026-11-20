# MathCreations

## Stage 6 course slides

Browse the 36-week course at https://nahiphog.github.io/MathCreations/stage6/.
The buildless `stage6/` directory contains 144 lesson slides, weekly practice with
revealable answers, assessment guidance, and a teaching guide. Navigate with the
week menu or Previous/Next; reading position and completion are stored locally.
Edit course content in `stage6/course-data.js`; no build is required.

Mathematics practice with Venn diagrams, an exact matrix inverse solver, and printable geometry construction worksheets.

## GitHub Pages

Website: https://nahiphog.github.io/MathCreations/

GitHub Pages serves the production `index.html` from the root of the `main` branch. The standalone build embeds application code, fonts, styles, and the matrix worker.

## Development

Requires Node.js 22 and npm. Dependencies are pinned in `venn-lab/package-lock.json`.

```sh
cd venn-lab
npm ci
npm run dev
npm test
npm run build
```

For GitHub Pages, build using `npm run build -- --base=/MathCreations/`. The production build is packaged into the root `index.html` for branch-based GitHub Pages hosting.

Geometry worksheets are available at `/#geometry`. Interactive ruler-and-compass practice remains planned.

The older ChatGPT Sites deployment is https://mathcreations-venn-lab.gohpihan.chatgpt.site and has restricted access.

