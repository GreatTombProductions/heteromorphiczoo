"use client";

import { FormEvent, useState } from "react";
import { SANCTUARY } from "@/lib/copy";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_GEX44_API_URL ||
  "https://hz-api.greattombproductions.com";

type FormState = "idle" | "submitting" | "success" | "error" | "rate-limited";

export default function SanctuaryForm() {
  const [state, setState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [story, setStory] = useState("");

  const formReady =
    category !== "" &&
    story.trim().length >= SANCTUARY.storyMinLength;

  const canSubmit = state === "idle" && formReady;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setState("submitting");

    try {
      const res = await fetch(`${API_BASE}/api/hz/sanctuary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim() || null,
          category,
          story: story.trim(),
        }),
      });

      if (res.status === 429) {
        setState("rate-limited");
        return;
      }

      if (!res.ok) {
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{SANCTUARY.title}</h1>
        <p className={styles.successMessage}>{SANCTUARY.submitSuccess}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{SANCTUARY.title}</h1>
      <p className={styles.intro}>{SANCTUARY.intro}</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Name — optional */}
        <div className={styles.field}>
          <label htmlFor="sanctuary-name" className={styles.label}>
            {SANCTUARY.nameLabel}
          </label>
          <input
            id="sanctuary-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={SANCTUARY.namePlaceholder}
            className={styles.input}
            maxLength={200}
          />
        </div>

        {/* Email — optional */}
        <div className={styles.field}>
          <label htmlFor="sanctuary-email" className={styles.label}>
            {SANCTUARY.emailLabel}
          </label>
          <input
            id="sanctuary-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={SANCTUARY.emailPlaceholder}
            className={styles.input}
          />
        </div>

        {/* Category — required */}
        <div className={styles.field}>
          <label htmlFor="sanctuary-category" className={styles.label}>
            {SANCTUARY.categoryLabel} <span className={styles.required}>*</span>
          </label>
          <select
            id="sanctuary-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.select}
            required
          >
            <option value="" disabled>
              Select one
            </option>
            {SANCTUARY.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Story — required */}
        <div className={styles.field}>
          <label htmlFor="sanctuary-story" className={styles.label}>
            {SANCTUARY.storyLabel} <span className={styles.required}>*</span>
          </label>
          <textarea
            id="sanctuary-story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder={SANCTUARY.storyPlaceholder}
            className={styles.textarea}
            rows={6}
            minLength={SANCTUARY.storyMinLength}
            required
          />
          {story.length > 0 && story.trim().length < SANCTUARY.storyMinLength && (
            <p className={styles.hint}>
              {SANCTUARY.storyMinLength - story.trim().length} more characters needed
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!formReady || state === "submitting"}
          className={styles.submitButton}
        >
          {state === "submitting" ? "Submitting\u2026" : SANCTUARY.submitButton}
        </button>

        {state === "error" && (
          <p className={styles.errorMessage}>{SANCTUARY.submitError}</p>
        )}
        {state === "rate-limited" && (
          <p className={styles.errorMessage}>{SANCTUARY.submitRateLimited}</p>
        )}
      </form>

      {/* What happens next */}
      <div className={styles.whatNext}>
        <h2 className={styles.whatNextHeading}>
          {SANCTUARY.whatHappensNext.heading}
        </h2>
        {SANCTUARY.whatHappensNext.lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        <div className={styles.resources}>
          {SANCTUARY.whatHappensNext.resources.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceLink}
            >
              {r.name}
            </a>
          ))}
        </div>
        <p className={styles.privacyNote}>
          {SANCTUARY.whatHappensNext.privacyNote}
        </p>
      </div>
    </div>
  );
}
