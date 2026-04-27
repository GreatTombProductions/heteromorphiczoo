"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { LOADING, RITES } from "@/lib/copy";
import styles from "./page.module.css";

interface RiteOffering {
  id: string;
  title: string | null;
  category: string;
  creator_name: string | null;
  creator_rank_title: string;
  thumbnail_url: string | null;
  content_url: string | null;
}

interface Rite {
  id: string;
  name: string;
  theme: string;
  description: string;
  dp_note: string;
  starts_at: string;
  ends_at: string;
  status: "active" | "closed" | "upcoming";
  total_offerings: number;
  featured_offerings: RiteOffering[];
}

interface RitesData {
  rites: Rite[];
  generated_at: string;
}

function computeTimeRemaining(endsAt: string): string {
  const now = Date.now();
  const end = new Date(endsAt).getTime();
  const diff = end - now;

  if (diff <= 0) return RITES.ended;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} ${days === 1 ? RITES.dayRemaining : RITES.daysRemaining}`;
  }
  return `${hours} ${RITES.hoursRemaining}`;
}

function formatDateRange(starts: string, ends: string): string {
  const s = new Date(starts);
  const e = new Date(ends);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${s.toLocaleDateString("en-US", opts)} \u2014 ${e.toLocaleDateString("en-US", opts)}`;
}

function statusLabel(status: Rite["status"]): string {
  switch (status) {
    case "active": return RITES.activeLabel;
    case "closed": return RITES.closedLabel;
    case "upcoming": return RITES.upcomingLabel;
  }
}

export default function RitesPage() {
  const [data, setData] = useState<RitesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/rites.json")
      .then((r) => {
        if (!r.ok) throw new Error("no data");
        return r.json();
      })
      .then((ritesData) => {
        setData(ritesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const { active, closed, upcoming } = useMemo(() => {
    if (!data) return { active: [], closed: [], upcoming: [] };
    return {
      active: data.rites.filter((r) => r.status === "active"),
      closed: data.rites.filter((r) => r.status === "closed"),
      upcoming: data.rites.filter((r) => r.status === "upcoming"),
    };
  }, [data]);

  const hasRites = data && data.rites.length > 0;

  return (
    <>
      <Navigation />
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{RITES.title}</h1>
          <p className={styles.subtitle}>{RITES.subtitle}</p>
        </header>

        {loading ? (
          <p className={styles.loading}>{RITES.loading}</p>
        ) : (
          <>
            {/* Active Rites — hero treatment */}
            {active.map((rite) => (
              <section key={rite.id} className={styles.activeRite}>
                <span className={styles.statusBadge} data-status="active">
                  {statusLabel("active")}
                </span>
                <h2 className={styles.riteName}>{rite.name}</h2>
                <p className={styles.riteTheme}>
                  <span className={styles.themeLabel}>{RITES.themeLabel}:</span>{" "}
                  {rite.theme}
                </p>
                <p className={styles.riteDescription}>{rite.description}</p>

                <div className={styles.riteMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{RITES.durationLabel}</span>
                    <span className={styles.metaValue}>{formatDateRange(rite.starts_at, rite.ends_at)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{RITES.dpLabel}</span>
                    <span className={styles.metaValue}>{rite.dp_note}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{RITES.offeringsLabel}</span>
                    <span className={styles.metaValue}>{rite.total_offerings}</span>
                  </div>
                </div>

                <p className={styles.timeRemaining}>{computeTimeRemaining(rite.ends_at)}</p>

                <div className={styles.riteActions}>
                  <Link href="/offerings" className={styles.participateButton}>
                    {RITES.participateButton}
                  </Link>
                  <p className={styles.participateNote}>{RITES.participateNote}</p>
                </div>
              </section>
            ))}

            {/* Upcoming Rites — muted preview */}
            {upcoming.map((rite) => (
              <section key={rite.id} className={styles.upcomingRite}>
                <span className={styles.statusBadge} data-status="upcoming">
                  {statusLabel("upcoming")}
                </span>
                <h2 className={styles.riteName}>{rite.name}</h2>
                <p className={styles.riteTheme}>
                  <span className={styles.themeLabel}>{RITES.themeLabel}:</span>{" "}
                  {rite.theme}
                </p>
                <div className={styles.riteMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{RITES.durationLabel}</span>
                    <span className={styles.metaValue}>{formatDateRange(rite.starts_at, rite.ends_at)}</span>
                  </div>
                </div>
              </section>
            ))}

            {/* Closed Rites — with featured offerings */}
            {closed.map((rite) => (
              <section key={rite.id} className={styles.closedRite}>
                <span className={styles.statusBadge} data-status="closed">
                  {statusLabel("closed")}
                </span>
                <h2 className={styles.riteName}>{rite.name}</h2>
                <p className={styles.riteTheme}>
                  <span className={styles.themeLabel}>{RITES.themeLabel}:</span>{" "}
                  {rite.theme}
                </p>
                <p className={styles.riteDescription}>{rite.description}</p>

                <div className={styles.riteMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{RITES.durationLabel}</span>
                    <span className={styles.metaValue}>{formatDateRange(rite.starts_at, rite.ends_at)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{RITES.offeringsLabel}</span>
                    <span className={styles.metaValue}>{rite.total_offerings}</span>
                  </div>
                </div>

                {/* Featured offerings from this rite */}
                {rite.featured_offerings.length > 0 && (
                  <div className={styles.featuredSection}>
                    <h3 className={styles.featuredTitle}>{RITES.featuredLabel}</h3>
                    <p className={styles.featuredSubtitle}>{RITES.featuredDescription}</p>
                    <div className={styles.featuredGrid}>
                      {rite.featured_offerings.map((offering) => (
                        <article key={offering.id} className={styles.featuredCard}>
                          {offering.thumbnail_url && (
                            <div className={styles.featuredImageWrap}>
                              <img
                                src={offering.thumbnail_url}
                                alt={offering.title ?? "Featured offering"}
                                className={styles.featuredImage}
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className={styles.featuredCardBody}>
                            <span className={styles.categoryBadge}>{offering.category}</span>
                            {offering.title && (
                              <h4 className={styles.featuredCardTitle}>{offering.title}</h4>
                            )}
                            {offering.creator_name && (
                              <p className={styles.featuredCardCreator}>
                                by {offering.creator_name}
                                <span className={styles.creatorRank}>{offering.creator_rank_title}</span>
                              </p>
                            )}
                            {offering.content_url && (
                              <a
                                href={offering.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.featuredCardLink}
                              >
                                Witness &rarr;
                              </a>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}

            {/* Empty state when no rites exist */}
            {!hasRites && (
              <p className={styles.emptyState}>{RITES.emptyState}</p>
            )}

            {/* How It Works — always visible, structural explanation */}
            <section className={styles.howItWorks}>
              <h2 className={styles.howTitle}>{RITES.howItWorks.title}</h2>
              <div className={styles.stepsGrid}>
                {RITES.howItWorks.steps.map((step, i) => (
                  <div key={i} className={styles.step}>
                    <span className={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className={styles.stepHeading}>{step.heading}</h3>
                    <p className={styles.stepBody}>{step.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
