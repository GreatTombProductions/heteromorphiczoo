"use client";

import { useEffect, useState } from "react";
import { CHRONICLE, SITE } from "@/lib/copy";
import type { ChronicleImage } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_GEX44_API_URL || "";

interface ApiChronicleEvent {
  id: string;
  date_display: string;
  title: string;
  body: string;
  era: string | null;
  video_url: string | null;
  sort_order: number;
  images: { src: string; alt: string }[];
  tracks: string[];
}

/**
 * Fetch chronicle from the API, falling back to copy.ts if API is unavailable.
 */
function useChronicleEvents() {
  const [events, setEvents] = useState<
    Array<{
      date: string;
      title: string;
      body: string;
      era?: string;
      videoUrl?: string;
      images?: ChronicleImage[];
      tracks?: string[];
    }>
  >(CHRONICLE.events.map((e) => ({
    date: e.date,
    title: e.title,
    body: e.body,
    era: "era" in e ? e.era : undefined,
    videoUrl: "videoUrl" in e ? e.videoUrl : undefined,
    images: "images" in e ? [...(e.images as ChronicleImage[])] : undefined,
    tracks: "tracks" in e ? [...e.tracks] : undefined,
  }))); // Start with static data for instant render

  useEffect(() => {
    if (!API_BASE) return; // No API configured, keep static data

    fetch(`${API_BASE}/api/hz/chronicle`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data: { events: ApiChronicleEvent[] }) => {
        if (data.events && data.events.length > 0) {
          setEvents(
            data.events.map((e) => ({
              date: e.date_display,
              title: e.title,
              body: e.body,
              era: e.era ?? undefined,
              videoUrl: e.video_url ?? undefined,
              images: e.images.length > 0 ? e.images : undefined,
              tracks: e.tracks.length > 0 ? e.tracks : undefined,
            }))
          );
        }
      })
      .catch(() => {
        // Silently fall back to static data
      });
  }, []);

  return events;
}

export default function ChroniclePage() {
  const events = useChronicleEvents();
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

          {events.map((event, i) => {
            const images = event.images ?? [];
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
                        {isExpanded ? "\u2212" : "+"}
                      </span>
                    )}
                  </h2>
                  <p className={styles.eventBody}>{event.body}</p>

                  {event.tracks && (
                    <div className={styles.trackList}>
                      <span className={styles.trackListLabel}>Track listing:</span>
                      <ol className={styles.tracks}>
                        {event.tracks.map((track) => (
                          <li key={track} className={styles.track}>{track}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {event.videoUrl && (
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
