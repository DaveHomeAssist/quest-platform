# Quest Platform

Shared platform scaffold for:

- MLB Ballparks Quest
- Festival Atlas

This workspace is intentionally standalone so shared extraction can begin
without destabilizing either live repo.

## Phase 1 Files

Shared core:

- `shared/js/core/storage.js`
- `shared/js/core/utils.js`
- `shared/js/core/device.js`
- `shared/js/core/config.js`
- `shared/js/core/context-store.js`
- `shared/js/core/visits.js`
- `shared/js/core/notes.js`
- `shared/js/core/schedule-core.js`

Product configs:

- `products/mlb/config.js`
- `products/festival/config.js`

## Design Constraints

- Vanilla browser JavaScript only
- Compatible with current IIFE/global patterns
- No build step required
- Product-specific features stay out of shared core

## Immediate Next Move

Extract `storage.js`, `utils.js`, and `device.js` into the shared core,
then shim both products to consume the new namespace before moving on to
route, visits, and schedule abstractions.
