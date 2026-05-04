"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRESAVE } from "@/lib/copy";
import { generateAlias } from "@/lib/usernameGenerator";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_GEX44_API_URL ||
  "https://hz-api.greattombproductions.com";

type Platform = keyof typeof PRESAVE.platforms;

interface MetadataField {
  key: string;
  value: string;
}

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

  // Menagerie accordion state
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [name, setName] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);

  useEffect(() => {
    setName(generateAlias());
  }, []);

  function addField() {
    setMetadataFields([...metadataFields, { key: "", value: "" }]);
  }

  function updateField(index: number, field: "key" | "value", val: string) {
    const updated = [...metadataFields];
    updated[index][field] = val;
    setMetadataFields(updated);
  }

  function removeField(index: number) {
    setMetadataFields(metadataFields.filter((_, i) => i !== index));
  }

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

    // Build metadata dict from fields (skip empty keys)
    const metadata: Record<string, string> = {};
    for (const field of metadataFields) {
      const key = field.key.trim();
      const value = field.value.trim();
      if (key && value) {
        metadata[key] = value;
      }
    }

    try {
      // Only send menagerie fields if the user opened the accordion —
      // existing fans who skip it shouldn't have their name/alias overwritten
      // by the auto-generated placeholder.
      const body: Record<string, unknown> = {
        email: email.trim(),
        platform,
        release_slug: release,
      };
      if (accordionOpen) {
        body.name = name.trim() || null;
        body.opt_in_newsletter = newsletter;
        body.metadata = Object.keys(metadata).length > 0 ? metadata : null;
      }

      const res = await fetch(`${API_BASE}/api/hz/presave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
            <img src="/benediction-artwork.jpg" alt="Benediction — Heteromorphic Zoo feat. Coty Garcia" />
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
            <img src="/benediction-artwork.jpg" alt="Benediction — Heteromorphic Zoo feat. Coty Garcia" />
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

  const acc = PRESAVE.menagerieAccordion;

  return (
    <div className={styles.container}>
      {/* Album Art */}
      <div className={styles.artwork}>
          <img src="/benediction-artwork.jpg" alt="Benediction — Heteromorphic Zoo feat. Coty Garcia" />
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

      {/* Menagerie Accordion */}
      <div className={styles.accordion}>
        <button
          type="button"
          className={styles.accordionToggle}
          onClick={() => setAccordionOpen(!accordionOpen)}
          aria-expanded={accordionOpen}
        >
          <span>{acc.toggle}</span>
          <span className={`${styles.accordionChevron} ${accordionOpen ? styles.accordionChevronOpen : ""}`}>
            &#x25BE;
          </span>
        </button>

        {accordionOpen && (
          <div className={styles.accordionContent}>
            {/* Name / alias */}
            <input
              type="text"
              className={styles.emailInput}
              placeholder={acc.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "submitting"}
            />

            {/* Newsletter checkbox */}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className={styles.checkbox}
                disabled={status === "submitting"}
              />
              <span className={styles.checkboxText}>
                {acc.newsletterLabel}
                <span className={styles.checkboxFrequency}>
                  {acc.newsletterFrequency}
                </span>
              </span>
            </label>

            {/* Dynamic metadata fields */}
            {metadataFields.map((field, i) => (
              <div key={i} className={styles.metadataRow}>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateField(i, "key", e.target.value)}
                  placeholder={acc.fieldKeyPlaceholder}
                  className={styles.metadataKey}
                  disabled={status === "submitting"}
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => updateField(i, "value", e.target.value)}
                  placeholder={acc.fieldValuePlaceholder}
                  className={styles.metadataValue}
                  disabled={status === "submitting"}
                />
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className={styles.removeButton}
                  aria-label="Remove field"
                  disabled={status === "submitting"}
                >
                  &times;
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addField}
              className={styles.addButton}
              disabled={status === "submitting"}
            >
              {acc.addFieldButton}
            </button>
          </div>
        )}
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
