/**
 * DEPRECATED: This file was used for a broken middleware pattern.
 * 
 * Next.js 16 requires middleware to be exported directly from middleware.ts at the root.
 * The clerkMiddleware() function returns a middleware function expecting (request, event)
 * parameters, which must be provided by Next.js when calling exported middleware directly.
 * 
 * The proxy() function pattern doesn't work because it only passes (request) when calling
 * clerkHandler, missing the required event parameter.
 * 
 * Solution: See middleware.ts at the project root for the correct implementation.
 * This file is kept for reference only and should not be used.
 */

// This file is no longer used. All middleware logic has been moved to middleware.ts at the project root.
