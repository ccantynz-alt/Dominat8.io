type Props = { label?: string };

export default function BuildMarker({ label = 'BUILD MARKER' }: Props) {
  return (
    <div className='mt-8 rounded-2xl border border-black/15 bg-yellow-50 p-4 text-sm'>
      <div className='font-semibold'>{label}</div>
      <div className='mt-1 opacity-80'>
        If you can see this box, the latest deploy is live.
      </div>
      <div className='mt-2 font-mono text-xs opacity-70'>
        utc: 2026-01-23T22:22:38Z
      </div>
    </div>
  );
}