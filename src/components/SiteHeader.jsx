"use client";

import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog/" },
  { label: "Projects", href: "/projects/" },
  { label: "About", href: "/about/" }
];

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";

  function isCurrentPage(href) {
    const current = pathname.replace(/\/+$/, "") || "/";
    const target = href.replace(/\/+$/, "") || "/";
    return current === target;
  }

  return (
    <header className="site-header" role="banner">
      <div className="wrapper">
        <a className="site-title" rel="author" href="/">McFuzzySquirrel&apos;s Playground</a>
        <nav className="site-nav" aria-label="Primary">
          <input
            type="checkbox"
            id="nav-trigger"
            className="nav-trigger"
            aria-label="Toggle site navigation"
            aria-controls="primary-navigation"
          />
          <label htmlFor="nav-trigger">
            <span className="menu-icon">
              <svg viewBox="0 0 18 15" width="18" height="15" aria-hidden="true">
                <path d="M18 1.484c0 .82-.665 1.484-1.484 1.484H1.484C.665 2.969 0 2.304 0 1.484 0 .665.665 0 1.484 0h15.032C17.335 0 18 .665 18 1.484zM18 7.516C18 8.335 17.335 9 16.516 9H1.484C.665 9 0 8.335 0 7.516s.665-1.484 1.484-1.484h15.032C17.335 6.032 18 6.696 18 7.516zM18 13.516c0 .82-.665 1.484-1.484 1.484H1.484C.665 15 0 14.335 0 13.516s.665-1.484 1.484-1.484h15.032c.82 0 1.484.665 1.484 1.484z" />
              </svg>
            </span>
          </label>
          <div className="trigger" id="primary-navigation">
            {links.map(({ label, href }) => (
              <a
                className="page-link"
                href={href}
                aria-current={isCurrentPage(href) ? "page" : undefined}
                key={href}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
