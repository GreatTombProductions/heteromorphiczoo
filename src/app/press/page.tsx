import type { Metadata } from "next";
import { PRESS, SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${PRESS.title} — ${SITE.name}`,
  description: PRESS.subtitle,
};

export default function PressPage() {
  return (
    <>
      <Navigation />
      <div className={styles.press}>
        {/* Hero — the professional handshake */}
        <header className={styles.header}>
          <h1 className={styles.title}>{SITE.name}</h1>
          <p className={styles.oneLiner}>{PRESS.oneLiner}</p>
          <p className={styles.genre}>{PRESS.subtitle}</p>
        </header>

        {/* Bio */}
        <section className={styles.section}>
          <p className={styles.bio}>{PRESS.bio}</p>
        </section>

        {/* Stats */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{PRESS.stats.title}</h2>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{PRESS.stats.spotifyListeners}</span>
              <span className={styles.statLabel}>Spotify monthly listeners</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{PRESS.stats.releases}</span>
              <span className={styles.statLabel}>Discography</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{PRESS.stats.epRuntime}</span>
              <span className={styles.statLabel}>New World EP</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{PRESS.stats.label}</span>
              <span className={styles.statLabel}>Label</span>
            </div>
          </div>
        </section>

        {/* Press quotes */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Press</h2>
          <div className={styles.quotes}>
            {PRESS.pressQuotes.map((quote) => (
              <blockquote key={quote.text} className={styles.quote}>
                <p className={styles.quoteText}>&ldquo;{quote.text}&rdquo;</p>
                <footer className={styles.quoteSource}>
                  {quote.source} &mdash; {quote.context}
                </footer>
              </blockquote>
            ))}
          </div>
          <p className={styles.comparisons}>
            <span className={styles.comparisonsLabel}>For fans of:</span>{" "}
            {PRESS.comparisons}
          </p>
        </section>

        {/* Current lineup */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Lineup</h2>
          <ul className={styles.lineup}>
            {PRESS.lineup.map((member) => (
              <li key={member} className={styles.lineupMember}>{member}</li>
            ))}
          </ul>
        </section>

        {/* Links + Streaming */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Listen</h2>
          <div className={styles.links}>
            <a href={PRESS.links.bandcamp} className={styles.externalLink} target="_blank" rel="noopener noreferrer">
              Bandcamp
            </a>
            <a href={PRESS.links.spotify} className={styles.externalLink} target="_blank" rel="noopener noreferrer">
              Spotify
            </a>
            <a href={PRESS.links.youtube} className={styles.externalLink} target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
            <a href={PRESS.links.instagram} className={styles.externalLink} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </section>

        {/* Contact */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <div className={styles.contacts}>
            <div className={styles.contact}>
              <span className={styles.contactLabel}>Booking</span>
              <a href={`mailto:${PRESS.contact.booking}`} className={styles.contactValue}>
                {PRESS.contact.booking}
              </a>
            </div>
            <div className={styles.contact}>
              <span className={styles.contactLabel}>Press</span>
              <a href={`mailto:${PRESS.contact.press}`} className={styles.contactValue}>
                {PRESS.contact.press}
              </a>
            </div>
            <div className={styles.contact}>
              <span className={styles.contactLabel}>General</span>
              <a href={`mailto:${PRESS.contact.general}`} className={styles.contactValue}>
                {PRESS.contact.general}
              </a>
            </div>
          </div>
        </section>

        {/* Press kit CTA */}
        <section className={styles.epkSection}>
          <p className={styles.epkText}>
            High-resolution photos, logos, and additional materials available on request.
          </p>
        </section>
      </div>
    </>
  );
}
