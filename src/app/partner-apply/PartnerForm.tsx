"use client";

import { useState } from "react";
import { PARTNER_APPLY } from "@/lib/copy";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_GEX44_API_URL ||
  "https://hz-api.greattombproductions.com";

export default function PartnerForm() {
  const [name, setName] = useState("");
  const [craft, setCraft] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [pitch, setPitch] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !craft.trim() || !portfolio.trim() || !pitch.trim() || !email.trim()) {
      setError(PARTNER_APPLY.errors.missingFields);
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/hz/partner-apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          craft: craft.trim(),
          portfolio: portfolio.trim(),
          pitch: pitch.trim(),
          email: email.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || PARTNER_APPLY.errors.general);
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof TypeError
          ? PARTNER_APPLY.errors.network
          : err instanceof Error
            ? err.message
            : PARTNER_APPLY.errors.general
      );
    }
  };

  if (status === "success") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{PARTNER_APPLY.title}</h1>
        <div className={styles.successContainer}>
          <h2 className={styles.successHeadline}>
            {PARTNER_APPLY.success.headline}
          </h2>
          <p className={styles.successBody}>{PARTNER_APPLY.success.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{PARTNER_APPLY.title}</h1>
      <p className={styles.subtitle}>{PARTNER_APPLY.subtitle}</p>

      {/* How partnerships work */}
      <div className={styles.howItWorks}>
        <h2 className={styles.howItWorksHeading}>
          {PARTNER_APPLY.howItWorks.heading}
        </h2>
        <ul className={styles.howItWorksList}>
          {PARTNER_APPLY.howItWorks.points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
        <p className={styles.volumeNote}>
          {PARTNER_APPLY.howItWorks.volumeNote}
        </p>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>{PARTNER_APPLY.fields.nameLabel}</label>
          <input
            type="text"
            className={styles.input}
            placeholder={PARTNER_APPLY.fields.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{PARTNER_APPLY.fields.craftLabel}</label>
          <input
            type="text"
            className={styles.input}
            placeholder={PARTNER_APPLY.fields.craftPlaceholder}
            value={craft}
            onChange={(e) => setCraft(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{PARTNER_APPLY.fields.portfolioLabel}</label>
          <input
            type="text"
            className={styles.input}
            placeholder={PARTNER_APPLY.fields.portfolioPlaceholder}
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{PARTNER_APPLY.fields.pitchLabel}</label>
          <textarea
            className={styles.textarea}
            placeholder={PARTNER_APPLY.fields.pitchPlaceholder}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{PARTNER_APPLY.fields.emailLabel}</label>
          <input
            type="email"
            className={styles.input}
            placeholder={PARTNER_APPLY.fields.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "..." : PARTNER_APPLY.submitButton}
        </button>
      </form>
    </div>
  );
}
