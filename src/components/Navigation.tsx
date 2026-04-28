"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SITE } from "@/lib/copy";
import styles from "./Navigation.module.css";

const routes = [
  { href: "/chronicle", label: NAV.chronicle, shortLabel: "Chronicle" },
  { href: "/bestiary", label: NAV.bestiary, shortLabel: "Bestiary" },
  { href: "/reactions", label: NAV.reactions, shortLabel: "Reactions" },
  { href: "/offerings", label: NAV.offerings, shortLabel: "Offerings" },
  { href: "/menagerie", label: NAV.menagerieRoll, shortLabel: "Menagerie" },
  { href: "/rites", label: NAV.rites, shortLabel: "Rites" },
  { href: "/press", label: NAV.press, shortLabel: "Press" },
] as const;

interface NavigationProps {
  /** When true, nav fades in after a delay or on scroll (whichever first), then persists */
  hideUntilScroll?: boolean;
  /** ID of the sentinel element to observe (default: "nav-sentinel") */
  sentinelId?: string;
}

export default function Navigation({ hideUntilScroll = false, sentinelId = "nav-sentinel" }: NavigationProps) {
  const [visible, setVisible] = useState(!hideUntilScroll);
  const revealedRef = useRef(!hideUntilScroll);
  const pathname = usePathname();

  useEffect(() => {
    if (!hideUntilScroll || revealedRef.current) return;

    const reveal = () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      setVisible(true);
    };

    // Timer: reveal after 2.5s regardless of scroll
    const timer = setTimeout(reveal, 2500);

    // IntersectionObserver: reveal immediately if user scrolls past sentinel
    const sentinel = document.getElementById(sentinelId);
    let observer: IntersectionObserver | undefined;
    if (sentinel) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) reveal();
        },
        { threshold: 0 }
      );
      observer.observe(sentinel);
    } else {
      // No sentinel found — reveal immediately
      reveal();
    }

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [hideUntilScroll, sentinelId]);

  return (
    <>
      {/* Desktop top nav */}
      <nav
        className={`${styles.nav} ${hideUntilScroll ? styles.scrollTriggered : ""} ${visible ? styles.navVisible : styles.navHidden}`}
      >
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
        </div>
      </nav>

      {/* Mobile bottom tab bar — always present, no overlay */}
      <nav className={styles.mobileNav} aria-label="Mobile navigation">
        <Link
          href="/"
          className={`${styles.mobileTab} ${pathname === "/" ? styles.mobileTabActive : ""}`}
        >
          <svg className={styles.mobileTabIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12l9-8 9 8M5 11v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8" />
          </svg>
          <span className={styles.mobileTabLabel}>Home</span>
        </Link>
        {routes.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className={`${styles.mobileTab} ${pathname === r.href ? styles.mobileTabActive : ""}`}
          >
            <span className={styles.mobileTabLabel}>{r.shortLabel}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
