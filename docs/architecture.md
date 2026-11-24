# Architecture

This repository owns three static routes:

| Route | App | Responsibility |
|---|---|---|
| `/` | `index.html` | Birthday Worlds landing page |
| `/shruti/` | `shruti/` | Shruti's keepsake experience |
| `/rishi/` | `rishi/` | Rishi's interactive RPG |

## Boundaries

Each app owns its markup, styles, scripts, assets, and content. Changes to one app must not replace another app's page. Shared assets belong in `shared/` only when genuinely shared.

## Deployment

The site is published to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`. The workflow uploads the repository root, so everything in the repo (including `docs/`) is publicly served under `https://mystify7777.github.io/greetings/`.

Routes resolve as:

```
index.html
shruti/index.html
rishi/index.html
```

Rishi's page references media with relative paths (`../apps/rishi/assets/`), so those folders must stay siblings.

Never assume that a deployment marked successful has correct route contents. Verify all three HTTP routes.
