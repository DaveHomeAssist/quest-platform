# Quest Platform — Feature Analysis

**Date:** 2026-03-25
**Project:** quest-platform
**Stack:** Vanilla JS shared core, Vercel monorepo build, no npm/bundler

---

## Summary Table

| Feature | Status | Data Source / Persistence | Critical Gap |
|---|---|---|---|
| Shared Config Registry | Complete | In-memory (`__QUEST_PLATFORM__` global) | No runtime validation of config shape |
| Shared Storage Engine | Complete | localStorage with debounced writes | No encryption; no storage quota monitoring |
| Shared Utility Library | Complete | Pure functions on `__QUEST_PLATFORM__.utils` | US-centric map projection; no international support |
| Shared Device Detection | Complete | `__QUEST_PLATFORM__.device` | Not yet consumed by page-level responsive logic |
| Product Registration Pattern | Complete | `createProductConfig()` / `registerProduct()` | Products must self-register; no auto-discovery |
| Monorepo Build Script | Complete | `build.sh` — copies into `dist/` | No file hashing; no incremental builds |
| Vercel Deployment Config | Complete | `vercel.json` with rewrites | Root URL rewrites to MLB; no landing page |
| MLB Product (Full Clone) | Complete | `products/mlb/` — full app files | Duplicated from standalone repo; drift risk |
| Festival Product (Full Clone) | Complete | `products/festival/` — full app files | Duplicated from standalone repo; drift risk |
| Shared Core Shim Pattern | Active | Product shim files bridge shared to product namespace | Double indirection adds complexity |
| Context Store (Planned) | Stub | `shared/js/core/context-store.js` | File exists but not integrated into products |
| Visits Core (Planned) | Stub | `shared/js/core/visits.js` | File exists but products still use their own visit logic |
| Notes Core (Planned) | Stub | `shared/js/core/notes.js` | File exists but products still use their own notes logic |
| Schedule Core (Planned) | Stub | `shared/js/core/schedule-core.js` | File exists but products still use custom schedule modules |

---

## Detailed Feature Analysis

### 1. Shared Config Registry

**Problem it solves:** Provides a centralized way for multiple products (MLB, Festival) to register their configuration — storage keys, entity labels, feature flags, UI page names — so shared infrastructure can operate product-agnostically.

**Implementation:** `shared/js/core/config.js` creates the `__QUEST_PLATFORM__.config` namespace with `createProductConfig()` (validates and clones a config object) and `registerProduct()` (stores it in a private registry). Products call this in their own `config.js` files. The config shape includes: `productId`, `productCode`, `appName`, `namespace`, `storage.keys`, `entities`, `schedule`, `route`, `theme`, and `features` (boolean flags like `scorekeeper`, `shortlist`, `tripShare`).

**Tradeoffs and limitations:**
- No schema validation. A product can register an incomplete config without errors.
- Config is read-only after registration (returned as deep clone), which is good for safety but means dynamic config changes require re-registration.

### 2. Shared Storage Engine

**Problem it solves:** Provides a namespaced, debounced localStorage wrapper that prevents key collisions between products and avoids performance issues from rapid writes.

**Implementation:** `shared/js/core/storage.js` exports `createStorage(options)` which returns a storage instance with `read()`, `write()`, `update()`, `flush()`, `remove()`, and scoped variants (`readScoped()`, `writeScoped()`, `removeScoped()`). Key features:
- **Namespacing:** Keys are prefixed with `namespace:key` (e.g., `bpq.prototype:visits`).
- **Debouncing:** Writes are batched via `setTimeout` (default 140ms). `flush()` forces immediate write.
- **Pending write awareness:** `read()` checks the pending write map before hitting localStorage, ensuring consistency.
- **Migration support:** `migrateScoped()` runs ordered migration functions when the stored version is behind.
- **Graceful fallback:** If localStorage is unavailable, operations silently no-op with in-memory values.

**Tradeoffs and limitations:**
- No storage quota monitoring. If localStorage fills up, writes fail silently.
- No encryption. All data is readable in DevTools.
- Deep cloning via `structuredClone` or `JSON.parse(JSON.stringify())` adds overhead for large data.

### 3. Shared Utility Library

**Problem it solves:** Centralizes common calculations and formatting used by both products: distance, dates, map projection, HTML escaping, color/token validation.

**Implementation:** `shared/js/core/utils.js` provides:
- `distanceMiles()` — Haversine formula for straight-line distance
- `formatDate()` — `Intl.DateTimeFormat` wrapper
- `minutesToReadable()` — human-readable travel time strings
- `escapeHtml()` — XSS-safe string escaping
- `safeToken()` / `safeColor()` — validation for CSS class names and color values
- `projectPoint()` / `projectLine()` — map coordinate to SVG pixel projection
- `buildUsBasemap()` — generates SVG path elements for a contiguous US outline with region dividers

**Tradeoffs and limitations:**
- Map projection is US-centric with hardcoded lat/lng bounds. Festival Atlas would need different projection for non-US festivals.
- No unit tests included in the repo.

### 4. Monorepo Build and Deployment

**Problem it solves:** Deploys both products (MLB + Festival) from a single repository with shared code, avoiding duplication on the hosting side.

**Implementation:** `build.sh` is a simple shell script that copies `shared/js/` and both `products/mlb/` and `products/festival/` into a flat `dist/` directory. `vercel.json` configures Vercel to:
- Run `build.sh` as the build command
- Serve from `dist/`
- Rewrite `/mlb/shared/js/*` and `/festival/shared/js/*` to `/shared/js/*` (shared core served once)
- Rewrite `/mlb` and `/festival` to their respective `index.html` files
- Default root `/` rewrites to MLB
- Cache shared files with 1-hour max-age and 24-hour stale-while-revalidate

**Tradeoffs and limitations:**
- No file hashing or cache-busting. Shared core updates may not reach users immediately.
- No incremental build; every deploy copies everything.
- Root URL goes to MLB with no platform landing page or product selector.

### 5. Product Shim Pattern

**Problem it solves:** Allows existing product code (which expects `BPQ.storage`, `BPQ.utils`, etc.) to consume the shared core without rewriting every call site.

**Implementation:** Each product has shim files (`storage.js`, `utils.js`, `device.js`, `config.js`) that import from `__QUEST_PLATFORM__` and re-export under the product namespace. For example, MLB's `storage.js` wraps `QP.storage.createStorage()` and aliases `read`->`get`, `write`->`set` to preserve the original API.

**Tradeoffs and limitations:**
- Every product loads 4 shim files plus the shared core files, totaling 8 script tags just for infrastructure.
- Shim files add a maintenance surface. If shared API changes, shims must update too.
- The pattern is a migration bridge, not a permanent architecture.

### 6. Planned But Incomplete Shared Modules

**Problem they solve:** The `shared/js/core/` directory contains stubs for `context-store.js`, `visits.js`, `notes.js`, and `schedule-core.js` — intended to extract the visit tracking, notes, and schedule logic that is currently duplicated in each product's `data.js`, `app.js`, and `schedule.js`.

**Current state:** These files exist in the repo but are not yet loaded by either product. Both MLB and Festival still carry their own complete implementations of visits, notes, and schedule logic.

**Tradeoffs and limitations:**
- Until these are completed and integrated, the shared platform is only sharing ~40% of the common code (storage, utils, device, config).
- The duplicated logic means bug fixes must be applied to both products independently.

---

## Top 3 Priorities

1. **Complete shared visit/notes/schedule extraction** — The four stub modules (`context-store.js`, `visits.js`, `notes.js`, `schedule-core.js`) represent the next phase of platform value. Without them, the platform is a partial extraction that still requires parallel maintenance.

2. **Add a platform landing page** — The root URL currently rewrites to MLB. A simple index page that lets users choose between MLB and Festival (and future products) would make the platform feel intentional rather than accidental.

3. **Build cache-busting into the deploy** — The shared core files have no content hashing. A query-string version parameter or filename hash would prevent stale shared code from breaking products after updates.
