import PublishButton from "./PublishButton";

export default function Page() {
  const projectId = "REPLACE_ME_WITH_REAL_PROJECT_ID";

  return (
    <div style={{ padding: 24 }}>
      <h1>Publish</h1>
      <PublishButton projectId={projectId} />
    </div>
  );
}
