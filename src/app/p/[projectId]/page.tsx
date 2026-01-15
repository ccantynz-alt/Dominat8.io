import { loadSiteSpec } from "@/app/lib/projectSpecStore";
import {
  loadPublishedSiteSpec,
  isProjectPublished,
} from "@/app/lib/publishedSpecStore";

type PageProps = {
  params: {
    projectId: string;
  };
};

export default async function PublicProjectPage({ params }: PageProps) {
  const { projectId } = params;

  let spec = null;
  let published = false;

  try {
    published = await isProjectPublished(projectId);
    spec = published
      ? await loadPublishedSiteSpec(projectId)
      : await loadSiteSpec(projectId);
  } catch (e) {
    console.error("Failed to load site spec", e);
  }

  if (!spec) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            This site isn’t published yet
          </h1>
          <p className="text-gray-600">
            Go back to the builder and click <strong>Publish</strong>.
          </p>
        </div>
      </main>
    );
  }

  const page =
    spec.pages.find((p: any) => p.slug === "/") ?? spec.pages[0];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {page.sections.map((section: any, idx: number) => {
        switch (section.type) {
          case "hero":
            return (
              <section
                key={idx}
                className="py-24 px-6 text-center bg-gray-50"
              >
                <h1 className="text-4xl font-bold mb-4">
                  {section.headline}
                </h1>
                {section.subheadline && (
                  <p className="text-lg text-gray-600 mb-8">
                    {section.subheadline}
                  </p>
                )}
                <div className="flex justify-center gap-4">
                  {section.primaryCta && (
                    <button className="px-6 py-3 rounded-lg bg-black text-white">
                      {section.primaryCta}
                    </button>
                  )}
                  {section.secondaryCta && (
                    <button className="px-6 py-3 rounded-lg border border-gray-300">
                      {section.secondaryCta}
                    </button>
                  )}
                </div>
              </section>
            );

          case "features":
            return (
              <section key={idx} className="py-20 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                  {section.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="border rounded-xl p-6 bg-white shadow-sm"
                    >
                      <h3 className="text-lg font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "faq":
            return (
              <section key={idx} className="py-20 px-6 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-8 text-center">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-6">
                    {section.items.map((item: any, i: number) => (
                      <div key={i}>
                        <h4 className="font-semibold">{item.q}</h4>
                        <p className="text-gray-600 mt-1">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "finalCta":
            return (
              <section
                key={idx}
                className="py-24 px-6 text-center bg-black text-white"
              >
                <h2 className="text-3xl font-bold mb-4">
                  {section.headline}
                </h2>
                {section.body && (
                  <p className="text-gray-300 mb-8">
                    {section.body}
                  </p>
                )}
                {section.primaryCta && (
                  <button className="px-8 py-4 rounded-lg bg-white text-black font-semibold">
                    {section.primaryCta}
                  </button>
                )}
              </section>
            );

          default:
            return null;
        }
      })}
    </main>
  );
}
