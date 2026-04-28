"use client";

import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { LOADING, OFFERINGS } from "@/lib/copy";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_GEX44_API_URL || "https://hz-api.greattombproductions.com";

type Category = "visual" | "sonic" | "textual" | "ritual" | "profane";

interface Offering {
  id: string;
  category: Category;
  title: string | null;
  description: string | null;
  content_url: string | null;
  content_type: string;
  thumbnail_url: string | null;
  creator_name: string | null;
  creator_rank: number;
  creator_rank_title: string;
  inspired_by: string | null;
  featured: boolean;
  approved_at: string;
}

interface OfferingsData {
  offerings: Offering[];
  by_category: Record<string, number>;
  generated_at: string;
}

interface AltarData {
  current: {
    id: string;
    category: string;
    title: string | null;
    description: string | null;
    content_url: string | null;
    content_type: string;
    thumbnail_url: string | null;
    creator_name: string | null;
    creator_rank_title: string;
    featured_at: string;
  } | null;
  recent: Array<{
    id: string;
    category: string;
    title: string | null;
    content_type: string;
    thumbnail_url: string | null;
    creator_name: string | null;
    featured_at: string;
  }>;
  generated_at: string;
}

const CATEGORIES: Category[] = ["visual", "sonic", "textual", "ritual", "profane"];

export default function OfferingsPage() {
  const [data, setData] = useState<OfferingsData | null>(null);
  const [altar, setAltar] = useState<AltarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Submission state
  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("visual");
  const [formInspiredBy, setFormInspiredBy] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/data/offerings.json").then((r) => r.json()),
      fetch("/data/altar.json").then((r) => r.json()),
    ])
      .then(([offerings, altarData]) => {
        setData(offerings);
        setAltar(altarData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (categoryFilter === "all") return data.offerings;
    return data.offerings.filter((o) => o.category === categoryFilter);
  }, [data, categoryFilter]);

  const totalOfferings = useMemo(() => {
    if (!data) return 0;
    return Object.values(data.by_category).reduce((a, b) => a + b, 0);
  }, [data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side file size check (10 MB)
    if (formFile && formFile.size > 10 * 1024 * 1024) {
      setSubmitState("error");
      setSubmitMessage(OFFERINGS.submitFileTooLarge);
      return;
    }

    setSubmitState("submitting");

    const formData = new FormData();
    formData.append("email", formEmail);
    formData.append("category", formCategory);
    if (formTitle) formData.append("title", formTitle);
    if (formDescription) formData.append("description", formDescription);
    if (formUrl) formData.append("content_url", formUrl);
    if (formInspiredBy) formData.append("inspired_by", formInspiredBy);
    if (formFile) formData.append("file", formFile);

    try {
      const resp = await fetch(`${API_BASE}/api/hz/offerings`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        setSubmitState("error");
        setSubmitMessage(OFFERINGS.submitError);
        return;
      }

      setSubmitState("success");
      setSubmitMessage(OFFERINGS.submitSuccess);
      setFormEmail("");
      setFormTitle("");
      setFormDescription("");
      setFormUrl("");
      setFormInspiredBy("");
      setFormFile(null);
    } catch {
      setSubmitState("error");
      setSubmitMessage(OFFERINGS.submitError);
    }
  }

  return (
    <>
      <Navigation />
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{OFFERINGS.title}</h1>
          <p className={styles.subtitle}>{OFFERINGS.subtitle}</p>
        </header>

        {loading ? (
          <p className={styles.loading}>{LOADING.gallery}</p>
        ) : (
          <>
            {/* Featured Offering — atmospheric scale, not a thumbnail */}
            {altar?.current && (
              <section className={styles.featured}>
                <span className={styles.featuredLabel}>{OFFERINGS.featuredLabel}</span>
                <div className={styles.featuredContent}>
                  {(altar.current.thumbnail_url || (altar.current.content_type === "image" && altar.current.content_url)) && (
                    <div className={styles.featuredImageWrap}>
                      <img
                        src={altar.current.thumbnail_url || altar.current.content_url!}
                        alt={altar.current.title ?? "Featured offering"}
                        className={styles.featuredImage}
                      />
                    </div>
                  )}
                  <div className={styles.featuredMeta}>
                    {altar.current.title && (
                      <h2 className={styles.featuredTitle}>{altar.current.title}</h2>
                    )}
                    {altar.current.description && (
                      <p className={styles.featuredDescription}>{altar.current.description}</p>
                    )}
                    {altar.current.creator_name && (
                      <p className={styles.featuredCreator}>
                        {OFFERINGS.byLabel} {altar.current.creator_name}
                        <span className={styles.creatorRank}>{altar.current.creator_rank_title}</span>
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Category filters */}
            <div className={styles.controls}>
              <div className={styles.filters}>
                <button
                  className={`${styles.filterTab} ${categoryFilter === "all" ? styles.filterActive : ""}`}
                  onClick={() => setCategoryFilter("all")}
                >
                  {OFFERINGS.filterAll}
                  <span className={styles.filterCount}>{totalOfferings}</span>
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filterTab} ${categoryFilter === cat ? styles.filterActive : ""}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {OFFERINGS.categories[cat].label}
                    <span className={styles.filterCount}>{data?.by_category[cat] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery grid */}
            {filtered.length > 0 ? (
              <div className={styles.gallery}>
                {filtered.map((offering) => {
                  const isImage = offering.content_type === "image";
                  const imageUrl = offering.thumbnail_url || (isImage ? offering.content_url : null);

                  return (
                  <article key={offering.id} className={styles.card}>
                    {imageUrl && (
                      <div className={styles.cardImageWrap}>
                        <img
                          src={imageUrl}
                          alt={offering.title ?? "Offering"}
                          className={styles.cardImage}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className={styles.cardBody}>
                      {offering.featured && (
                        <span className={styles.featuredBadge}>{OFFERINGS.featuredLabel}</span>
                      )}
                      <span className={styles.categoryBadge}>{OFFERINGS.categories[offering.category]?.label ?? offering.category}</span>
                      {offering.title && (
                        <h3 className={styles.cardTitle}>{offering.title}</h3>
                      )}
                      {offering.description && (
                        <p className={styles.cardDescription}>{offering.description}</p>
                      )}
                      {offering.creator_name && (
                        <p className={styles.cardCreator}>
                          {OFFERINGS.byLabel} {offering.creator_name}
                          <span className={styles.creatorRank}>{offering.creator_rank_title}</span>
                        </p>
                      )}
                      {offering.content_url && !isImage && !offering.content_url.startsWith("pending-upload") && (
                        <a
                          href={offering.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.cardLink}
                        >
                          Witness &rarr;
                        </a>
                      )}
                    </div>
                  </article>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyState}>{OFFERINGS.emptyState}</p>
            )}

            {/* Submission section */}
            <section className={styles.submitSection}>
              <h2 className={styles.submitTitle}>{OFFERINGS.submitTitle}</h2>
              <p className={styles.submitPrompt}>{OFFERINGS.submitPrompt}</p>

              {!showForm && submitState !== "success" && (
                <button
                  onClick={() => setShowForm(true)}
                  className={styles.submitToggle}
                >
                  {OFFERINGS.submitButton}
                </button>
              )}

              {submitState === "success" ? (
                <p className={styles.submitSuccess}>{submitMessage}</p>
              ) : showForm ? (
                <form onSubmit={handleSubmit} className={styles.submitForm}>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={OFFERINGS.submitEmailPlaceholder}
                    className={styles.submitInput}
                    required
                    disabled={submitState === "submitting"}
                  />
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className={styles.submitSelect}
                    disabled={submitState === "submitting"}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{OFFERINGS.categories[cat].label} — {OFFERINGS.categories[cat].description}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={OFFERINGS.submitTitlePlaceholder}
                    className={styles.submitInput}
                    disabled={submitState === "submitting"}
                  />
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={OFFERINGS.submitDescriptionPlaceholder}
                    className={styles.submitTextarea}
                    rows={3}
                    disabled={submitState === "submitting"}
                  />
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder={OFFERINGS.submitUrlPlaceholder}
                    className={styles.submitInput}
                    disabled={submitState === "submitting"}
                  />
                  <div className={styles.fileUploadGroup}>
                    <label className={styles.fileUploadLabel}>
                      {OFFERINGS.submitFileLabel}
                      <input
                        type="file"
                        accept="image/*,audio/*,video/*,.pdf"
                        onChange={(e) => setFormFile(e.target.files?.[0] ?? null)}
                        className={styles.fileInput}
                        disabled={submitState === "submitting"}
                      />
                    </label>
                    {formFile && (
                      <span className={styles.fileName}>{formFile.name}</span>
                    )}
                    <span className={styles.fileHint}>{OFFERINGS.submitFileHint}</span>
                  </div>
                  <input
                    type="text"
                    value={formInspiredBy}
                    onChange={(e) => setFormInspiredBy(e.target.value)}
                    placeholder={OFFERINGS.submitInspiredByPlaceholder}
                    className={styles.submitInput}
                    disabled={submitState === "submitting"}
                  />
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitState === "submitting"}
                  >
                    {OFFERINGS.submitButton}
                  </button>
                </form>
              ) : null}

              {submitState === "error" && (
                <p className={styles.submitError}>{submitMessage}</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
