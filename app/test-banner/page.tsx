import UpgradeBanner from "@/app/components/UpgradeBanner";

export default function TestBannerPage() {
  return (
    <div className="p-6 space-y-6">
      <UpgradeBanner isPro={false} />

      <div>
        <h1 className="text-2xl font-bold">Test Banner Page</h1>
        <p className="text-gray-600">
          If you can see the yellow banner above, the component works.
        </p>
      </div>
    </div>
  );
}
