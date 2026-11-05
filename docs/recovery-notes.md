# Recovery Notes

## Current production incident (2026-11-05)

A sequence of inline Vercel deployments created static file trees with nested `src/src` and `src/` layouts. During attempted fixes, the hub and Shruti page were reconstructed from scratch, overwriting the prior production experience. Rishi's source was also partially reconstructed.

The first known production version had pages under `src/index.html`, `src/rishi/index.html`, and `src/shruti/index.html` but static routing did not resolve them correctly under the deployed root. A subsequent deployment introduced nested `src/src`.

## Recovery priority

1. Restore the original hub, Shruti, and Rishi source from an earlier deployment where the actual contents are still retrievable, or from a user-provided local copy.
2. Place the canonical files in this repo under `apps/`.
3. Fix modal focus, keyboard close, and pause behavior for Rishi without modifying Shruti.
4. Use a deterministic deployment configuration and verify exact route responses.

Do not claim a page has been restored unless its previous source has been retrieved and compared. The deployment API file listing gives file IDs, but file-content retrieval may truncate large payloads, so confirm content integrity before reuse.
