# Architecture

This repository owns three static routes:

| Route | App | Responsibility |
|---|---|---|
| `/` | `apps/hub` | Birthday Worlds landing page |
| `/shruti/` | `apps/shruti` | Shruti's keepsake experience |
| `/rishi/` | `apps/rishi` | Rishi's interactive RPG |

## Boundaries

Each app owns its markup, styles, scripts, assets, and content. Changes to one app must not replace another app's page. Shared assets belong in `shared/` only when genuinely shared.

## Deployment

The Vercel project is `birthday-worlds`. Deploy the repository root and configure the static output/root so the built files resolve as:

```
index.html
shruti/index.html
rishi/index.html
```

Never assume that a deployment marked READY has correct route contents. Verify the deployment file tree and all three HTTP routes.
