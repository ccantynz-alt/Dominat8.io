import type { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";

import { kv } from "@/src/lib/kv";
import { templatesCatalog } from "@/src/lib/templatesCatalog";
import { DEFAULT_TEMPLATE_ID } from "@/src/lib/defaultTemplate";

type AllowedSectionType =
  | "hero"
  | "socialProof"
  | "valueProps"
  | "howItWorks"
  | "gallery"
  | "pricing"
  | "faq"
  | "footerCta";

type MarketingPageSpec = {
  kind: "marketing";
  version: 1;
  title?: string;
  sections: Array<{ type: AllowedSectionType; data?: any }>;
};

type PageProps = {
  ok: boolean;
  source: "project" | "marketingKey" | "defaultTemplate" | "none";
  projectId: string | null;
  spec: MarketingPageSpec | null;
  debug: boolean;
  wire: boolean;
  error?: string;
};

function isMarketingSpec(v: any): v is MarketingPageSpec {
  if (!v || typeof v !== "object") return false;
  if (v.kind !== "marketing") return false;
  if (v.version !== 1) return false;
  if (!Array.isArray(v.sections)) return false;
  return true;
}

function Section({ type, data, wire }: { type: AllowedSectionType; data: any; wire: boolean }) {
  const box = (children: React.ReactNode) => (
    <section className={wire ? "border border-dashed p-4 rounded-lg" : ""}>
      {children}
    </section>
  );

  switch (type) {
    case "hero":
      return box(
        <div className="py-10">
          <div className="text-sm opacity-70">{data?.eyebrow || "AI Website Builder"}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{data?.headline || "Build your site"}</h1>
          <p className="mt-4 text-lg opacity-80">{data?.subheadline || ""}</p>

          {Array.isArray(data?.bullets) && data.bullets.length > 0 ? (
            <ul className="mt-6 list-disc pl-6 opacity-90">
              {data.bullets.map((b: any, i: number) => (
                <li key={i}>{String(b)}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex gap-3">
            <a className="px-4 py-2 rounded-md bg-black text-white" href={data?.primaryCta?.href || "#"}>
              {data?.primaryCta?.label || "Get started"}
            </a>
            <a className="px-4 py-2 rounded-md border" href={data?.secondaryCta?.href || "#pricing"}>
              {data?.secondaryCta?.label || "View pricing"}
            </a>
          </div>
        </div>
      );

    case "socialProof":
      return box(
        <div className="py-8">
          <h2 className="text-xl font-semibold">{data?.eyebrow || "Social proof"}</h2>
          {Array.isArray(data?.stats) ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.stats.map((s: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="text-2xl font-semibold">{String(s?.value || "")}</div>
                  <div className="mt-1 text-sm opacity-70">{String(s?.label || "")}</div>
                </div>
              ))}
            </div>
          ) : null}
          {Array.isArray(data?.logos) ? (
            <div className="mt-4 flex flex-wrap gap-2 opacity-70">
              {data.logos.map((l: any, i: number) => (
                <span key={i} className="px-3 py-1 rounded-full border text-sm">
                  {String(l)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      );

    case "valueProps":
      return box(
        <div className="py-10">
          <h2 className="text-2xl font-semibold">{data?.title || "Value"}</h2>
          {Array.isArray(data?.items) ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.items.map((it: any, i: number) => (
                <div key={i} className="rounded-lg border p-5">
                  <div className="font-semibold">{String(it?.title || "")}</div>
                  <div className="mt-2 opacity-80">{String(it?.body || "")}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );

    case "howItWorks":
      return box(
        <div className="py-10">
          <h2 className="text-2xl font-semibold">{data?.title || "How it works"}</h2>
          {Array.isArray(data?.steps) ? (
            <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.steps.map((st: any, i: number) => (
                <li key={i} className="rounded-lg border p-5">
                  <div className="text-sm opacity-70">Step {i + 1}</div>
                  <div className="mt-1 font-semibold">{String(st?.title || "")}</div>
                  <div className="mt-2 opacity-80">{String(st?.body || "")}</div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      );

    case "gallery":
      return box(
        <div className="py-10">
          <h2 className="text-2xl font-semibold">{data?.title || "Gallery"}</h2>
          {Array.isArray(data?.items) ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.items.map((g: any, i: number) => (
                <div key={i} className="rounded-lg border p-5">
                  <div className="font-semibold">{String(g?.title || "")}</div>
                  <div className="mt-2 opacity-70">{String(g?.caption || "")}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );

    case "pricing":
      return box(
        <div id={data?.anchor || "pricing"} className="py-10">
          <h2 className="text-2xl font-semibold">{data?.title || "Pricing"}</h2>
          {Array.isArray(data?.tiers) ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.tiers.map((t: any, i: number) => {
                const hi = !!t?.highlight;
                return (
                  <div key={i} className={"rounded-lg border p-6 " + (hi ? "border-black" : "")}>
                    <div className="flex items-baseline justify-between">
                      <div className="text-lg font-semibold">{String(t?.name || "")}</div>
                      <div className="text-2xl font-bold">{String(t?.price || "")}</div>
                    </div>
                    <div className="mt-1 opacity-70">{String(t?.tagline || "")}</div>
                    {Array.isArray(t?.features) ? (
                      <ul className="mt-4 list-disc pl-6 opacity-90">
                        {t.features.map((f: any, j: number) => (
                          <li key={j}>{String(f)}</li>
                        ))}
                      </ul>
                    ) : null}
                    <a className={"mt-5 inline-block px-4 py-2 rounded-md " + (hi ? "bg-black text-white" : "border")} href={t?.cta?.href || "#"}>
                      {t?.cta?.label || "Choose"}
                    </a>
                  </div>
                );
              })}
            </div>
          ) : null}
          {data?.footnote ? <div className="mt-4 text-sm opacity-70">{String(data.footnote)}</div> : null}
        </div>
      );

    case "faq":
      return box(
        <div className="py-10">
          <h2 className="text-2xl font-semibold">{data?.title || "FAQ"}</h2>
          {Array.isArray(data?.items) ? (
            <div className="mt-6 space-y-3">
              {data.items.map((it: any, i: number) => (
                <details key={i} className="rounded-lg border p-5">
                  <summary className="cursor-pointer font-semibold">{String(it?.q || "")}</summary>
                  <div className="mt-2 opacity-80">{String(it?.a || "")}</div>
                </details>
              ))}
            </div>
          ) : null}
        </div>
      );

    case "footerCta":
      return box(
        <div className="py-10 rounded-xl border p-8">
          <h2 className="text-2xl font-semibold">{data?.headline || "Ready?"}</h2>
          <div className="mt-2 opacity-80">{data?.subheadline || ""}</div>
          <a className="mt-6 inline-block px-4 py-2 rounded-md bg-black text-white" href={data?.cta?.href || "#"}>
            {data?.cta?.label || "Get started"}
          </a>
        </div>
      );

    default:
      return null;
  }
}

function StrictRenderer({ spec, debug, wire }: { spec: MarketingPageSpec; debug: boolean; wire: boolean }) {
  const allowed: Record<string, true> = {
    hero: true,
    socialProof: true,
    valueProps: true,
    howItWorks: true,
    gallery: true,
    pricing: true,
    faq: true,
    footerCta: true,
  };

  return (
    <div className="space-y-8">
      {spec.sections.map((s, idx) => {
        if (!allowed[s.type]) {
          return (
            <div key={idx} className="rounded-lg border border-red-500 p-4">
              <div className="font-semibold text-red-700">Rejected section type</div>
              <div className="mt-1 text-sm opacity-80">{String(s.type)}</div>
            </div>
          );
        }

        return (
          <div key={idx}>
            {debug ? (
              <div className="mb-2 inline-flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full border">#{idx + 1}</span>
                <span className="px-2 py-1 rounded-full border">{s.type}</span>
              </div>
            ) : null}
            <Section type={s.type} data={s.data} wire={wire} />
          </div>
        );
      })}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const q = ctx.query || {};
  const projectId = typeof q.projectId === "string" ? q.projectId : null;
  const debug = q.debug === "1" || q.debug === "true";
  const wire = q.wire === "1" || q.wire === "true";

  try {
    if (projectId) {
      const v = (await kv.get(`generated:project:${projectId}:latest`)) as any;
      const spec = isMarketingSpec(v) ? v : null;

      return {
        props: {
          ok: !!spec,
          source: "project",
          projectId,
          spec,
          debug,
          wire,
          error: spec ? undefined : "No marketing spec found at generated:project:<id>:latest",
        },
      };
    }

    const m = (await kv.get("marketing:dominat8:pageSpec:v1")) as any;
    if (isMarketingSpec(m)) {
      return { props: { ok: true, source: "marketingKey", projectId: null, spec: m, debug, wire } };
    }

    const t = templatesCatalog.find((x) => x.id === DEFAULT_TEMPLATE_ID);
    const spec = t?.data?.pageSpec;
    if (isMarketingSpec(spec)) {
      return { props: { ok: true, source: "defaultTemplate", projectId: null, spec, debug, wire } };
    }

    return { props: { ok: false, source: "none", projectId: null, spec: null, debug, wire, error: "No spec found" } };
  } catch (e: any) {
    return {
      props: {
        ok: false,
        source: "none",
        projectId: projectId || null,
        spec: null,
        debug,
        wire,
        error: String(e?.message || e),
      },
    };
  }
};

export default function MarketingPreviewPage(props: PageProps) {
  const title = props.spec?.title || "Marketing Preview";

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <main className="mx-auto max-w-5xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Marketing Preview</h1>
          <div className="text-sm opacity-70">
            source: <span className="font-mono">{props.source}</span>
            {props.projectId ? (
              <>
                {" "}projectId: <span className="font-mono">{props.projectId}</span>
              </>
            ) : null}
          </div>
        </div>

        {!props.ok || !props.spec ? (
          <div className="mt-6 rounded-lg border p-5">
            <div className="font-semibold">No page spec yet</div>
            <div className="mt-2 opacity-80">{props.error || "Missing spec"}</div>
            <div className="mt-4 text-sm opacity-70">
              Tip: open with <span className="font-mono">?projectId=&lt;id&gt;&amp;debug=1&amp;wire=1</span>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <StrictRenderer spec={props.spec} debug={props.debug} wire={props.wire} />
            {props.debug ? (
              <div className="mt-8 rounded-lg border p-4">
                <div className="font-semibold">Debug: raw spec</div>
                <pre className="mt-3 overflow-auto text-xs opacity-90">{JSON.stringify(props.spec, null, 2)}</pre>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
