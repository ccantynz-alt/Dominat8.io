import SeoLinks from "@/components/SeoLinks";
export const metadata = {
  title: "Templates",
  description:
    "Browse high-converting website templates. Start from a proven layout and customize with AI.",
  robots: {
    index: true,
    follow: true,
  },
};
<SeoLinks
  title="Related use-cases"
  links={[
    { href: "/use-cases/saas", label: "SaaS websites" },
    { href: "/use-cases/startups", label: "Startup websites" },
    { href: "/use-cases/local-services", label: "Local service websites" },
  ]}
/>

<SeoLinks
  title="Learn more"
  links={[
    { href: "/guides/how-to-build-a-saas-website", label: "How to build a SaaS website" },
    { href: "/comparisons/ai-website-builder-vs-wix", label: "AI website builder vs Wix" },
  ]}
/>
