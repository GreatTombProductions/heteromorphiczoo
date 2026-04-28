"use client";

import { useEffect, useState } from "react";
import { EMAIL_CAPTURE } from "@/lib/copy";
import { generateAlias } from "@/lib/usernameGenerator";
import styles from "./SignupForm.module.css";

const API_BASE = process.env.NEXT_PUBLIC_GEX44_API_URL || "https://saturna.greattombproductions.com:8081";

type CaptureState = "idle" | "submitting" | "success" | "error";

interface MetadataField {
  key: string;
  value: string;
}

interface SignupFormProps {
  onSuccess?: () => void;
  variant?: "landing" | "inline";
}

export default function SignupForm({ onSuccess, variant = "landing" }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [captureMessage, setCaptureMessage] = useState("");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@") || !email.includes(".")) {
      setCaptureState("error");
      setCaptureMessage(EMAIL_CAPTURE.errorInvalid);
      return;
    }

    setCaptureState("submitting");

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
      const res = await fetch(`${API_BASE}/api/hz/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name.trim() || null,
          source: "website",
          opt_in_newsletter: newsletter,
          metadata: Object.keys(metadata).length > 0 ? metadata : null,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setCaptureState("success");
        setCaptureMessage(
          data.founding_member
            ? `${EMAIL_CAPTURE.success} Founding member.`
            : EMAIL_CAPTURE.success
        );
        onSuccess?.();
      } else if (res.status === 409) {
        setCaptureState("success");
        setCaptureMessage(EMAIL_CAPTURE.alreadyRegistered);
      } else {
        setCaptureState("error");
        setCaptureMessage(EMAIL_CAPTURE.errorGeneral);
      }
    } catch {
      setCaptureState("error");
      setCaptureMessage(EMAIL_CAPTURE.errorNetwork);
    }
  }

  const containerClass = variant === "inline" ? styles.containerInline : styles.container;

  if (captureState === "success") {
    return (
      <div className={containerClass}>
        <p className={styles.success}>{captureMessage}</p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <p className={styles.prompt}>{EMAIL_CAPTURE.prompt}</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Name / alias */}
        <div className={styles.fieldGroup}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (captureState === "error") setCaptureState("idle");
            }}
            placeholder={EMAIL_CAPTURE.namePlaceholder}
            className={styles.input}
            aria-label="Name or alias"
            disabled={captureState === "submitting"}
          />
        </div>

        {/* Email */}
        <div className={styles.fieldGroup}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (captureState === "error") setCaptureState("idle");
            }}
            placeholder={EMAIL_CAPTURE.emailPlaceholder}
            className={styles.input}
            aria-label="Email address"
            required
            disabled={captureState === "submitting"}
          />
        </div>

        {/* Newsletter checkbox */}
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className={styles.checkbox}
            disabled={captureState === "submitting"}
          />
          <span className={styles.checkboxText}>
            {EMAIL_CAPTURE.newsletterLabel}
            <span className={styles.checkboxFrequency}>
              {EMAIL_CAPTURE.newsletterFrequency}
            </span>
          </span>
        </label>

        {/* Dynamic key/value fields */}
        {metadataFields.map((field, i) => (
          <div key={i} className={styles.metadataRow}>
            <input
              type="text"
              value={field.key}
              onChange={(e) => updateField(i, "key", e.target.value)}
              placeholder={EMAIL_CAPTURE.fieldKeyPlaceholder}
              className={styles.metadataKey}
              disabled={captureState === "submitting"}
            />
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateField(i, "value", e.target.value)}
              placeholder={EMAIL_CAPTURE.fieldValuePlaceholder}
              className={styles.metadataValue}
              disabled={captureState === "submitting"}
            />
            <button
              type="button"
              onClick={() => removeField(i)}
              className={styles.removeButton}
              aria-label="Remove field"
              disabled={captureState === "submitting"}
            >
              &times;
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addField}
          className={styles.addButton}
          disabled={captureState === "submitting"}
        >
          {EMAIL_CAPTURE.addFieldButton}
        </button>

        {/* Submit */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={captureState === "submitting"}
        >
          {EMAIL_CAPTURE.button}
        </button>
      </form>

      {captureState === "error" && (
        <p className={styles.error}>{captureMessage}</p>
      )}
    </div>
  );
}
