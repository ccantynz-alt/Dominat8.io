"use client";

type ProjectBadgesProps = {
  published: boolean;
  domain?: string | null;
  domainStatus?: "pending" | "verified" | null;
};

export default function ProjectBadges({
  published,
  domain,
  domainStatus,
}: ProjectBadgesProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {/* Publish badge */}
      <span
        style={{
          padding: "4px 8px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          background: published ? "#16a34a" : "#9ca3af",
          color: "white",
        }}
      >
        {published ? "Published" : "Unpublished"}
      </span>

      {/* Domain badge */}
      {domain ? (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            background: domainStatus === "verified" ? "#2563eb" : "#f59e0b",
            color: "white",
          }}
          title={domainStatus === "verified" ? "Verified domain" : "Domain pending"}
        >
          {domainStatus === "verified" ? `Domain: ${domain}` : "Domain: Pending"}
        </span>
      ) : (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            background: "#e5e7eb",
            color: "#374151",
          }}
        >
          No domain
        </span>
      )}
    </div>
  );
}
