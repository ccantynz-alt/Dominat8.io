import Link from "next/link";
import { ReactNode } from "react";
import { Container } from "./Container";
import { ButtonLink } from "./Button";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="header">
        <Container>
          <div className="header__row">
            <Link href="/" className="brand">
              <span className="brand__dot" aria-hidden />
              <span className="brand__name">Placeholder</span>
            </Link>

            <nav className="nav" aria-label="Primary">
              <Link className="nav__link" href="/pricing">Pricing</Link>
              <Link className="nav__link" href="/dashboard">Dashboard</Link>
              <Link className="nav__link" href="/settings">Settings</Link>
            </nav>

            <div className="header__actions">
              <ButtonLink href="/signup">Start free trial</ButtonLink>
            </div>
          </div>
        </Container>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <Container>
          <div className="footer__row">
            <div className="footer__left">
              © {new Date().getFullYear()} Placeholder. All rights reserved.
            </div>
            <div className="footer__right">
              <a className="link" href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
              <span className="footer__sep">•</span>
              <a className="link" href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
