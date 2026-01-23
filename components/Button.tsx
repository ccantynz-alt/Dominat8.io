import Link from "next/link";
import { ReactNode } from "react";

export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="btn">
      {children}
    </Link>
  );
}
