"use client";

import { useState } from "react";
import { CHRONICLE, SITE } from "@/lib/copy";
import type { ChronicleImage } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

export default function ChroniclePage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function toggleGallery(index: number) {
    setExpandedIndex(expandedIndex === index ? null : index);
  }

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

          {CHRONICLE.events.map((event, i) => {
            const images = "images" in event ? (event.images as ChronicleImage[]) : [];
            const hasImages = images.length > 0;
            const isExpanded = expandedIndex === i;

            return (
              <article
                key={event.title}
                className={`${styles.event} ${i % 2 === 0 ? styles.eventLeft : styles.eventRight}`}
              >
                {/* Node on the axis */}
                <div className={styles.node} aria-hidden="true">
                  <div className={styles.nodeDot} />
                </div>

                <div
                  className={`${styles.eventContent} ${hasImages ? styles.expandable : ""}`}
                  onClick={hasImages ? () => toggleGallery(i) : undefined}
                  style={hasImages ? { cursor: "pointer" } : undefined}
                >
                  <time className={styles.date}>{event.date}</time>
                  <h2 className={styles.eventTitle}>
                    {event.title}
                    {hasImages && (
                      <span className={styles.galleryIndicator} aria-hidden="true">
                        {isExpanded ? "−" : "+"}
                      </span>
                    )}
                  </h2>
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      Witness &rarr;
                    </a>
                  )}

                  {/* Gallery section — expand/collapse */}
                  {hasImages && (
                    <div
                      className={`${styles.gallery} ${isExpanded ? styles.galleryOpen : ""}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles.galleryGrid}>
                        {images.map((img, imgIdx) => (
                          <div key={imgIdx} className={styles.galleryImageWrap}>
                            <img
                              src={img.src}
                              alt={img.alt}
                              className={styles.galleryImage}
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
