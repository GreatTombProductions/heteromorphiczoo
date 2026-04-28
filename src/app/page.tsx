"use client";

import { BENEDICTION, LANDING, SITE } from "@/lib/copy";
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
              href="#capture"
              className={styles.ctaPrimary}
              aria-label="Join the menagerie"
            >
              {BENEDICTION.ctaPrimary}
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
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <FooterPolicy />
        <p>{SITE.copyright}</p>
      </footer>
    </div>
  );
}
