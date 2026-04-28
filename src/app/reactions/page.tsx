"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { LOADING, REACTIONS, SONG_TAGS } from "@/lib/copy";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_GEX44_API_URL || "https://hz-api.greattombproductions.com";

interface Reaction {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  song_tag: string | null;
  approved_at: string;
  claimed_by_name?: string;
}

interface ReactionsData {
  reactions: Reaction[];
  by_song: Record<string, number>;
  total: number;
  generated_at: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ReactionsPage() {
  const [data, setData] = useState<ReactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [songFilter, setSongFilter] = useState<string>("all");
  const [shuffledReactions, setShuffledReactions] = useState<Reaction[]>([]);

  // Submission form state
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitSong, setSubmitSong] = useState("");
  const [submitEmail, setSubmitEmail] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error" | "duplicate">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // Claim form state (keyed by reaction ID)
  const [claimOpen, setClaimOpen] = useState<string | null>(null);
  const [claimEmail, setClaimEmail] = useState("");
  const [claimState, setClaimState] = useState<Record<string, "idle" | "submitting" | "success" | "error">>({});

  useEffect(() => {
    fetch("/data/reactions.json")
      .then((r) => r.json())
      .then((d: ReactionsData) => {
        setData(d);
        setShuffledReactions(shuffleArray(d.reactions));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const reshuffle = useCallback(() => {
    if (data) setShuffledReactions(shuffleArray(data.reactions));
  }, [data]);

  const filtered = useMemo(() => {
    let result = shuffledReactions;

    if (songFilter !== "all") {
      result = result.filter((r) => r.song_tag === songFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.channel_name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [shuffledReactions, songFilter, searchQuery]);

  // Songs that actually have reactions (for filter tabs)
  const availableSongs = useMemo(() => {
    if (!data) return [];
    return SONG_TAGS.filter((tag) => (data.by_song[tag] ?? 0) > 0);
  }, [data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submitUrl.trim()) return;

    setSubmitState("submitting");

    try {
      const resp = await fetch(`${API_BASE}/api/hz/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtube_url: submitUrl,
          song_tag: submitSong || null,
          submitted_by_email: submitEmail.trim() || null,
        }),
      });

      if (resp.status === 409) {
        setSubmitState("duplicate");
        setSubmitMessage(REACTIONS.submitDuplicate);
        return;
      }

      if (!resp.ok) {
        const err = await resp.json().catch(() => null);
        setSubmitState("error");
        setSubmitMessage(err?.detail ?? REACTIONS.submitError);
        return;
      }

      setSubmitState("success");
      setSubmitMessage(REACTIONS.submitSuccess);
      setSubmitUrl("");
      setSubmitSong("");
      setSubmitEmail("");
    } catch {
      setSubmitState("error");
      setSubmitMessage(REACTIONS.submitError);
    }
  }

  async function handleClaim(reactionId: string) {
    if (!claimEmail.trim()) return;

    setClaimState((s) => ({ ...s, [reactionId]: "submitting" }));

    try {
      const resp = await fetch(`${API_BASE}/api/hz/reactions/${reactionId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: claimEmail.trim() }),
      });

      if (!resp.ok) {
        setClaimState((s) => ({ ...s, [reactionId]: "error" }));
        return;
      }

      setClaimState((s) => ({ ...s, [reactionId]: "success" }));
      setClaimEmail("");
    } catch {
      setClaimState((s) => ({ ...s, [reactionId]: "error" }));
    }
  }

  return (
    <>
      <Navigation />
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{REACTIONS.title}</h1>
          <p className={styles.subtitle}>{REACTIONS.subtitle}</p>
        </header>

        {loading ? (
          <p className={styles.loading}>{LOADING.reactions}</p>
        ) : (
          <>
            {/* Controls: search + filter */}
            <div className={styles.controls}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={REACTIONS.searchPlaceholder}
                className={styles.searchInput}
                aria-label="Search reactions"
              />
              <div className={styles.filters}>
                <button
                  className={`${styles.filterTab} ${songFilter === "all" ? styles.filterActive : ""}`}
                  onClick={() => setSongFilter("all")}
                >
                  {REACTIONS.filterAll}
                  {data && <span className={styles.filterCount}>{data.total}</span>}
                </button>
                {availableSongs.map((tag) => (
                  <button
                    key={tag}
                    className={`${styles.filterTab} ${songFilter === tag ? styles.filterActive : ""}`}
                    onClick={() => setSongFilter(tag)}
                  >
                    {tag}
                    {data && <span className={styles.filterCount}>{data.by_song[tag] ?? 0}</span>}
                  </button>
                ))}
              </div>
              <button onClick={reshuffle} className={styles.shuffleButton} aria-label="Shuffle order">
                Shuffle
              </button>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className={styles.grid}>
                {filtered.map((reaction) => (
                  <div key={reaction.id} className={styles.card}>
                    <a
                      href={reaction.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cardLink}
                    >
                      <div className={styles.thumbnailWrap}>
                        <img
                          src={reaction.thumbnail_url}
                          alt={reaction.title}
                          className={styles.thumbnail}
                          loading="lazy"
                        />
                        <div className={styles.playOverlay} aria-hidden="true">
                          <svg viewBox="0 0 24 24" className={styles.playIcon}>
                            <path d="M8 5v14l11-7z" fill="currentColor" />
                          </svg>
                        </div>
                      </div>
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{reaction.title}</h3>
                        <p className={styles.cardChannel}>{reaction.channel_name}</p>
                        {reaction.song_tag && (
                          <span className={styles.songTag}>{reaction.song_tag}</span>
                        )}
                      </div>
                    </a>

                    {/* Claimer display + claim form */}
                    <div className={styles.claimSection}>
                      {reaction.claimed_by_name && (
                        <p className={styles.claimedBy}>
                          {REACTIONS.claimedByLabel} {reaction.claimed_by_name}
                        </p>
                      )}

                      {claimState[reaction.id] === "success" ? (
                        <p className={styles.claimSuccess}>{REACTIONS.claimSuccess}</p>
                      ) : claimOpen === reaction.id ? (
                        <form
                          className={styles.claimForm}
                          onSubmit={(e) => { e.preventDefault(); handleClaim(reaction.id); }}
                        >
                          <input
                            type="email"
                            value={claimEmail}
                            onChange={(e) => setClaimEmail(e.target.value)}
                            placeholder={REACTIONS.claimEmailPlaceholder}
                            className={styles.claimInput}
                            required
                            disabled={claimState[reaction.id] === "submitting"}
                          />
                          <button
                            type="submit"
                            className={styles.claimSubmitBtn}
                            disabled={claimState[reaction.id] === "submitting"}
                          >
                            {REACTIONS.claimSubmit}
                          </button>
                          {claimState[reaction.id] === "error" && (
                            <p className={styles.claimError}>{REACTIONS.claimError}</p>
                          )}
                        </form>
                      ) : (
                        <button
                          className={styles.claimToggle}
                          onClick={() => {
                            setClaimOpen(reaction.id);
                            setClaimEmail("");
                            setClaimState((s) => ({ ...s, [reaction.id]: "idle" }));
                          }}
                        >
                          {REACTIONS.claimButton}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>{REACTIONS.emptyState}</p>
            )}

            {/* Submission form */}
            <section className={styles.submitSection}>
              <h2 className={styles.submitTitle}>{REACTIONS.submitTitle}</h2>
              <p className={styles.submitPrompt}>{REACTIONS.submitPrompt}</p>

              {submitState === "success" ? (
                <p className={styles.submitSuccess}>{submitMessage}</p>
              ) : (
                <form onSubmit={handleSubmit} className={styles.submitForm}>
                  <input
                    type="url"
                    value={submitUrl}
                    onChange={(e) => {
                      setSubmitUrl(e.target.value);
                      if (submitState === "error" || submitState === "duplicate") setSubmitState("idle");
                    }}
                    placeholder={REACTIONS.submitUrlPlaceholder}
                    className={styles.submitInput}
                    required
                    disabled={submitState === "submitting"}
                  />
                  <select
                    value={submitSong}
                    onChange={(e) => setSubmitSong(e.target.value)}
                    className={styles.submitSelect}
                    disabled={submitState === "submitting"}
                  >
                    <option value="">{REACTIONS.submitSongPlaceholder}</option>
                    {SONG_TAGS.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  <input
                    type="email"
                    value={submitEmail}
                    onChange={(e) => setSubmitEmail(e.target.value)}
                    placeholder={REACTIONS.submitEmailPlaceholder}
                    className={styles.submitInput}
                    disabled={submitState === "submitting"}
                  />
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitState === "submitting"}
                  >
                    {REACTIONS.submitButton}
                  </button>
                </form>
              )}

              {(submitState === "error" || submitState === "duplicate") && (
                <p className={styles.submitError}>{submitMessage}</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
