"use client";

import { useState } from "react";
import Link from "next/link";
import { PRESAVE } from "@/lib/copy";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_GEX44_API_URL ||
  "https://hz-api.greattombproductions.com";

type Platform = keyof typeof PRESAVE.platforms;

interface PresaveFormProps {
  release: string;
}

export default function PresaveForm({ release }: PresaveFormProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "duplicate"
  >("idle");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError(PRESAVE.errors.invalidEmail);
      return;
    }
    if (!platform) {
      setError("Choose where you listen.");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/hz/presave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          platform,
          release_slug: release,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setStatus("duplicate");
        return;
      }

      if (!res.ok) {
        throw new Error(data.detail || PRESAVE.errors.general);
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof TypeError
          ? PRESAVE.errors.network
          : err instanceof Error
            ? err.message
            : PRESAVE.errors.general
      );
    }
  };

  // Success state renders in-place (no redirect)
  if (status === "success") {
    return (
      <div className={styles.container}>
        <div className={styles.artwork}>
          <div className={styles.artworkPlaceholder} />
        </div>
        <div className={styles.successContainer}>
          <h2 className={styles.successHeadline}>
            {PRESAVE.success.headline}
          </h2>
          <p className={styles.successBody}>{PRESAVE.success.body}</p>
          <p className={styles.dpNotice}>{PRESAVE.success.dpNotice}</p>
          <div className={styles.menageriePrompt}>
            <span>{PRESAVE.success.menageriePrompt} </span>
            <Link href="/menagerie" className={styles.menagerieLink}>
              {PRESAVE.success.menagerieLink}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className={styles.container}>
        <div className={styles.artwork}>
          <div className={styles.artworkPlaceholder} />
        </div>
        <div className={styles.successContainer}>
          <h2 className={styles.successHeadline}>
            {PRESAVE.errors.alreadyPresaved}
          </h2>
          <p className={styles.successBody}>{PRESAVE.success.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Album Art */}
      <div className={styles.artwork}>
        <div className={styles.artworkPlaceholder} />
      </div>

      {/* Title */}
      <h1 className={styles.headline}>{PRESAVE.headline}</h1>
      <p className={styles.subheadline}>{PRESAVE.subheadline}</p>

      {/* Atmospheric text */}
      <p className={styles.atmospheric}>{PRESAVE.atmosphericLine}</p>

      {/* Platform Selection */}
      <div className={styles.platformSection}>
        <p className={styles.platformPrompt}>{PRESAVE.platformPrompt}</p>
        <div className={styles.platformList}>
          {(Object.entries(PRESAVE.platforms) as [Platform, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                className={`${styles.platformButton} ${platform === key ? styles.selected : ""}`}
                onClick={() => setPlatform(key)}
                type="button"
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Email Capture (parallel, not gated) */}
      <div className={styles.emailSection}>
        <p className={styles.emailPrompt}>{PRESAVE.emailPrompt}</p>
        <input
          type="email"
          className={styles.emailInput}
          placeholder={PRESAVE.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>

      {/* Error */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Submit */}
      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={status === "submitting"}
        type="button"
      >
        {status === "submitting" ? "..." : PRESAVE.submitButton}
      </button>
    </div>
  );
}
