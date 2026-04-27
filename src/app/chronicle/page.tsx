import type { Metadata } from "next";
import { CHRONICLE, SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${CHRONICLE.title} — ${SITE.name}`,
  description: CHRONICLE.subtitle,
};

export default function ChroniclePage() {
  return (
    <>
      <Navigation />
      <div className={styles.chronicle}>
        <header className={styles.header}>
          <h1 className={styles.title}>{CHRONICLE.title}</h1>
          <p className={styles.subtitle}>{CHRONICLE.subtitle}</p>
        </header>

        <div className={styles.timeline}>
          {/* The glowing axis line */}
          <div className={styles.axis} aria-hidden="true" />

          {CHRONICLE.events.map((event, i) => (
            <article
              key={event.title}
              className={`${styles.event} ${i % 2 === 0 ? styles.eventLeft : styles.eventRight}`}
            >
              {/* Node on the axis */}
              <div className={styles.node} aria-hidden="true">
                <div className={styles.nodeDot} />
              </div>

              <div className={styles.eventContent}>
                <time className={styles.date}>{event.date}</time>
                <h2 className={styles.eventTitle}>{event.title}</h2>
                <p className={styles.eventBody}>{event.body}</p>

                {"tracks" in event && event.tracks && (
                  <div className={styles.trackList}>
                    <span className={styles.trackListLabel}>Track listing:</span>
                    <ol className={styles.tracks}>
                      {event.tracks.map((track) => (
                        <li key={track} className={styles.track}>{track}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {"videoUrl" in event && event.videoUrl && (
                  <a
                    href={event.videoUrl}
                    className={styles.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Witness &rarr;
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
