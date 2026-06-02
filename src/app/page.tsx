"use client";

import { BENEDICTION, LANDING } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import SignupForm from "@/components/SignupForm";
import FooterPolicy from "@/components/FooterPolicy";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.cathedral}>
      <Navigation hideUntilScroll sentinelId="hero-sentinel" />

      {/* Hero background — artwork dissolved into environment */}
      <div className={styles.heroBg} aria-hidden="true" />

      <main className={styles.altar}>
        {/* Sentinel for scroll-triggered nav — when this scrolls out, nav appears */}
        <div id="hero-sentinel" aria-hidden="true" />

        {/* Band name */}
        <h1 className={styles.bandName}>Heteromorphic Zoo</h1>

        {/* Benediction feature */}
        <section className={styles.benediction}>
          <h2 className={styles.headline}>{BENEDICTION.headline}</h2>
          <p className={styles.subheadline}>{BENEDICTION.subheadline}</p>

          <div className={styles.body}>
            <p>{BENEDICTION.bodyLine1}</p>
            <p>{BENEDICTION.bodyLine2}</p>
          </div>

          {/* Action block */}
          <div className={styles.actions}>
            <a
              href="https://www.youtube.com/watch?v=7B6B5Mi3s-s"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
              aria-label="Watch Benediction on YouTube"
            >
              {BENEDICTION.ctaPrimary}
              {" "}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ display: "inline", verticalAlign: "middle", marginLeft: "0.3em" }}
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          <p className={styles.credits}>{BENEDICTION.credits}</p>
        </section>

        {/* Email capture — inscription into the ledger */}
        <section id="capture">
          <SignupForm variant="landing" />
        </section>

        {/* Atmospheric line */}
        <p className={styles.atmospheric}>{LANDING.atmosphericLine}</p>

        {/* Policy accordion */}
        <FooterPolicy />
      </main>

    </div>
  );
}
