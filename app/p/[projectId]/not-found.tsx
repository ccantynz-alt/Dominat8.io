import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 32, maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>This site isn’t published yet</h1>
      <p style={{ opacity: 0.85 }}>
        The project exists, but it hasn’t been published. Go back to the builder and click Publish.
      </p>

      <div style={{ marginTop: 16 }}>
        <Link href="/projects" style={{ textDecoration: "underline" }}>
          Back to Projects
        </Link>
      </div>
    </div>
  );
}
