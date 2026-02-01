type Props = { token: string; builtAtUtc: string };

export default function DeployProofBanner({ token, builtAtUtc }: Props) {
  return (
    <div className="mt-8 rounded-2xl border border-black/15 bg-emerald-50 p-4 text-sm">
      <div className="font-semibold">✅ DEPLOY PROOF</div>
      <div className="mt-2">
        <span className="opacity-80">Token:</span>{" "}
        <span className="font-mono font-semibold">{token}</span>
      </div>
      <div className="mt-1">
        <span className="opacity-80">Built (UTC):</span>{" "}
        <span className="font-mono">{builtAtUtc}</span>
      </div>
      <div className="mt-3 text-xs opacity-70">
        If you can see this banner AND the API returns the same token, you are viewing the latest deployed code.
      </div>
    </div>
  );
}