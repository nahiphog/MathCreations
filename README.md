# MathCreations

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

