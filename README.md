# Greetings

Birthday microsites for Shruti and Rishi.

## Structure

- `apps/hub/` — landing page and navigation
- `apps/shruti/` — Shruti's keepsake experience
- `apps/rishi/` — Rishi's Maze of Memories RPG
- `docs/` — product notes, deployment conventions, recovery notes

## Working agreement

- This repository is the source of truth for the birthday microsites.
- Preserve unrelated pages when working on one experience.
- Deploy from the repository root with explicit root/output configuration.
- Verify `/`, `/shruti/`, and `/rishi/` after every production deployment.
- Do not reconstruct existing pages from memory; restore from Git history or retained deployment source.
