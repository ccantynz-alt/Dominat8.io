export const runtime = "nodejs";

export const metadata = {
  title: "Published Site",
  description: "Public published site",
};

export default function PublicPublishedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

