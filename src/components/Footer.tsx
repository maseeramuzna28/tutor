"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/app")) return null;

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Link href="/" className="wordmark" aria-label="TUTO home">
            TUTO<span className="wordmark__mark" aria-hidden="true" />
          </Link>
          <p className="site-footer__note">
            A learning platform for college students and faculty.
          </p>
        </div>

        <nav aria-label="Legal">
          <h2 className="eyebrow">Legal</h2>
          <ul>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms and Conditions</Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">App</h2>
          <ul>
            <li>
              <Link href="/app">App preview</Link>
            </li>
            <li>
              <Link href="/login">Sign in</Link>
            </li>
            <li>
              <Link href="/signup">Create account</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container site-footer__base">
        <p>© 2026 {site.legalName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
