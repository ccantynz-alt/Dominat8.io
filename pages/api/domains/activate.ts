/**
 * PRODUCTION DOMAIN ACTIVATE (Pages API)
 *
 * This endpoint intentionally re-uses the existing, proven logic in:
 *   pages/api/debug/map-domain.ts
 *
 * We expose it under a stable, non-debug URL:
 *   POST /api/domains/activate
 *
 * No behavior changes here — only the public path changes.
 */
export { default } from "../debug/map-domain";
