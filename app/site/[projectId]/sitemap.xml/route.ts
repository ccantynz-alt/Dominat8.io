import { LOCATIONS } from "@/app/lib/locations";

// after collecting normal pages
const locationUrls = LOCATIONS.map((l) =>
  buildCanonical(seo, `/site/${params.projectId}/location/${l.country.toLowerCase()}/${l.slug}`)
).filter(Boolean);

const urls = [...pageUrls, ...locationUrls];
