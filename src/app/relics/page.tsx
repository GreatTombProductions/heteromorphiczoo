import type { Metadata } from "next";
import Link from "next/link";
import { BRIDGE, RELICS, SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${RELICS.title} — ${SITE.name}`,
  description: RELICS.subtitle,
};

export default function RelicsPage() {
  return (
    <div className={styles.page}>
      <Navigation />
      <main className={styles.main}>
        {/* Page header */}
        <header className={styles.header}>
          <h1 className={styles.title}>{RELICS.title}</h1>
          <p className={styles.subtitle}>{RELICS.subtitle}</p>
        </header>

        {/* Program description */}
        <div className={styles.description}>
          {RELICS.description.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.divider} />

        {/* Empty state — before partners are confirmed */}
        <div className={styles.emptyState}>
          <p className={styles.emptyHeadline}>
            {RELICS.emptyState.line1}
            <br />
            {RELICS.emptyState.line2}
          </p>
          <p className={styles.emptyBody}>{RELICS.emptyState.line3}</p>
          <p className={styles.emptyCoda}>{RELICS.emptyState.coda}</p>
        </div>

        {/*
          Partner grid — architecture ready for when partners are confirmed.
          Each partner becomes a card in the grid, with their pieces grouped
          underneath. The partner is the organizing unit, not the product.

          Future structure:
          <section className={styles.partnerGrid}>
            {partners.map(partner => (
              <article key={partner.id} className={styles.partnerCard}>
                <h2 className={styles.partnerName}>{partner.name}</h2>
                <span className={styles.partnerMedium}>{partner.medium}</span>
                <p className={styles.partnerBio}>{partner.bio}</p>
                {partner.shopUrl && (
                  <a href={partner.shopUrl} className={styles.partnerLink}
                     target="_blank" rel="noopener noreferrer">
                    {RELICS.partnerCard.shopLinkLabel}
                  </a>
                )}
              </article>
            ))}
          </section>
        */}

        {/* Bridge link to Rites */}
        <div className={styles.bridge}>
          <p className={styles.bridgeText}>
            {BRIDGE.relicsToRites.text}{" "}
            <Link href="/rites" className={styles.bridgeLink}>
              {BRIDGE.relicsToRites.linkText}
            </Link>
          </p>
        </div>

        {/* Partner intake CTA */}
        <div className={styles.bridge}>
          <p className={styles.bridgeText}>
            Interested in partnering?{" "}
            <Link href="/partner-apply" className={styles.bridgeLink}>
              Tell us about your craft &rarr;
            </Link>
          </p>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>{SITE.copyright}</p>
      </footer>
    </div>
  );
}
