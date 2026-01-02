// app/site/[projectId]/location/[country]/[city]/route.ts
import { NextResponse } from "next/server";
import { storeGet } from "@/app/lib/store";
import { isAdmin } from "@/app/lib/isAdmin";
import { getProjectSEO, injectSEOIntoHtml } from "@/app/lib/seo";
import { LOCATIONS } from "@/app/lib/locations";

type Visibility = "public" | "private";

function visibilityKey(projectId: string) {
  return `project:visibility:${projectId}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; country: string; city: string } }
) {
  const admin = await isAdmin();

  const v = await storeGet(visibilityKey(params.projectId));
  const visibility: Visibility = v === "public" ? "public" : "private";

  if (visibility === "private" && !admin) {
    return new NextResponse("Private site", { status: 403 });
  }

  const location = LOCATIONS.find(
    (l) => l.slug === params.city && l.country.toLowerCase() === params.country.toLowerCase()
  );

  if (!location) {
    return new NextResponse("Not found", { status: 404 });
  }

  const seo = await getProjectSEO(params.projectId);

  const service =
    seo.schema?.services?.[0] || "Professional Services";

  const cityName = location.name;
  const countryName = location.country === "AU" ? "Australia" : "New Zealand";

  const html = `
<!doctype html>
<html>
<head></head>
<body>
  <main style="max-width:900px;margin:40px auto;padding:16px;">
    <h1>${service} in ${cityName}</h1>

    <p>
      We provide trusted ${service.toLowerCase()} services in ${cityName} and across ${countryName}.
      Our team understands local requirements, regulations, and customer expectations.
    </p>

    <h2>Why choose us in ${cityName}?</h2>
    <ul>
      <li>Local experts serving ${cityName}</li>
      <li>Fully compliant with ${countryName} regulations</li>
      <li>Transparent pricing</li>
      <li>Trusted across ${countryName}</li>
    </ul>

    <h2>Areas we serve</h2>
    <ul>
      ${LOCATIONS.filter(l => l.country === location.country)
        .map(l => `<li><a href="/site/${params.projectId}/location/${location.country.toLowerCase()}/${l.slug}">${service} in ${l.name}</a></li>`)
        .join("")}
    </ul>

    <h2>Book ${service.toLowerCase()} in ${cityName}</h2>
    <p>Contact us today to get started.</p>
  </main>
</body>
</html>
`;

  const finalHtml = injectSEOIntoHtml({
    html,
    path: `/site/${params.projectId}/location/${location.country.toLowerCase()}/${location.slug}`,
    seo,
    pageTitleFallback: `${service} in ${cityName}`,
    pageOverride: {
      description: `Trusted ${service.toLowerCase()} services in ${cityName}, ${countryName}. Local experts, transparent pricing, and reliable service.`,
      schemaJsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${service} in ${cityName}`,
        areaServed: cityName,
      },
    },
  });

  return new NextResponse(finalHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
