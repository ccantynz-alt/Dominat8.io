import Link from "next/link";

type SeoLink = {
  href: string;
  label: string;
};

export default function SeoLinks({
  title,
  links,
}: {
  title: string;
  links: SeoLink[];
}) {
  if (!links || links.length === 0) return null;

  return (
    <section className="mt-12 rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-blue-600 hover:underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
