# Greetings

Birthday microsites for Shruti and Rishi.

## Structure

- `index.html` — landing page (hub) linking to both worlds
- `shruti/` — Shruti's keepsake experience
- `rishi/` — Rishi's Maze of Memories RPG (page, script, styles, service worker)
- `apps/<name>/assets/` — media used by each page (Rishi's page loads from `apps/rishi/assets/`)
- `docs/` — product notes, deployment conventions, recovery notes

## Working agreement

- This repository is the source of truth for the birthday microsites.
- Preserve unrelated pages when working on one experience.
- The site is deployed to GitHub Pages from `main` (see `.github/workflows/pages.yml`).
- Verify `/`, `/shruti/`, and `/rishi/` after every deployment.
- Do not reconstruct existing pages from memory; restore from Git history or retained deployment source.
- When Rishi's page changes, bump `CACHE_NAME` in `rishi/sw.js` only if the precached file list changes; HTML, JS and CSS are fetched network-first.
