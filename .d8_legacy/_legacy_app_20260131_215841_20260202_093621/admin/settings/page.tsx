export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-wide text-white/60">SETTINGS</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-white/60">
          Keep this simple. Only the controls you actually use.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="text-sm font-semibold">Workspace</div>
        <div className="mt-2 text-sm text-white/60">
          Add items like: default projectId, feature toggles, debug mode, and safe admin tools.
        </div>
      </div>
    </div>
  );
}