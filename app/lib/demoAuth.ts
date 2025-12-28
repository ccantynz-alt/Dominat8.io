// app/lib/demoAuth.ts
// Demo auth helper for single-user / demo mode

export function getCurrentUserId() {
  // In demo mode, always return the same user
  return "demo-user";
}
