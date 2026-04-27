"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SITE } from "@/lib/copy";
import styles from "./Navigation.module.css";

const routes = [
  { href: "/chronicle", label: NAV.chronicle },
  { href: "/bestiary", label: NAV.bestiary },
  { href: "/reactions", label: NAV.reactions },
  { href: "/offerings", label: NAV.offerings },
  { href: "/menagerie", label: NAV.menagerieRoll },
  { href: "/rites", label: NAV.rites },
  { href: "/press", label: NAV.press },
] as const;

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand}>
          {SITE.name}
        </Link>

        <div className={styles.desktopLinks}>
          {routes.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={`${styles.link} ${pathname === r.href ? styles.active : ""}`}
            >
              {r.label}
            </Link>
          ))}
        </div>

        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
        >
          <span className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)}>
          <div className={styles.overlayContent} onClick={(e) => e.stopPropagation()}>
            {routes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className={`${styles.overlayLink} ${pathname === r.href ? styles.active : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
