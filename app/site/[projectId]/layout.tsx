import AnalyticsBeacon from "../../components/AnalyticsBeacon";

export default function SiteProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  return (
    <>
      <AnalyticsBeacon projectId={params.projectId} />
      {children}
    </>
  );
}
