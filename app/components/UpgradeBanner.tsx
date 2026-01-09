import UpgradeBanner from "@/app/components/UpgradeBanner";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <UpgradeBanner isPro={false} />

      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Manage your projects and generate websites using AI.
        </p>
      </div>
    </div>
  );
}
