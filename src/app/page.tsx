"use client";

import { useState } from "react";
import { BENEDICTION, EMAIL_CAPTURE, LANDING, SITE } from "@/lib/copy";
import styles from "./page.module.css";

type CaptureState = "idle" | "submitting" | "success" | "error";

export default function Home() {
  const [email, setEmail] = useState("");
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [captureMessage, setCaptureMessage] = useState("");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@") || !email.includes(".")) {
      setCaptureState("error");
      setCaptureMessage(EMAIL_CAPTURE.errorInvalid);
      return;
    }

    setCaptureState("submitting");

    // TODO: Wire to GEX44 API POST /api/hz/join when data pipeline is live
    // For now, simulate success after brief delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCaptureState("success");
      setCaptureMessage(EMAIL_CAPTURE.success);
      setEmail("");
    } catch {
      setCaptureState("error");
      setCaptureMessage(EMAIL_CAPTURE.errorGeneral);
    }
  }

  return (
    <div className={styles.cathedral}>
      {/* Hero background — artwork dissolved into environment */}
      <div className={styles.heroBg} aria-hidden="true" />

      <main className={styles.altar}>
        {/* Band name */}
        <h1 className={styles.bandName}>Heteromorphic Zoo</h1>

        {/* Benediction feature */}
        <section className={styles.benediction}>
          <h2 className={styles.headline}>{BENEDICTION.headline}</h2>
          <p className={styles.subheadline}>{BENEDICTION.subheadline}</p>

          <div className={styles.body}>
            <p>{BENEDICTION.bodyLine1}</p>
            <p>{BENEDICTION.bodyLine2}</p>
          </div>

          {/* Action block */}
          <div className={styles.actions}>
            <a
              href="#"
              className={styles.ctaPrimary}
              aria-label="Pre-save or stream Benediction"
            >
              {BENEDICTION.ctaPrimary}
            </a>
          </div>

          <p className={styles.credits}>{BENEDICTION.credits}</p>
        </section>

        {/* Email capture — inscription into the ledger */}
        <section className={styles.capture}>
          <p className={styles.capturePrompt}>{EMAIL_CAPTURE.prompt}</p>

          {captureState === "success" ? (
            <p className={styles.captureSuccess}>{captureMessage}</p>
          ) : (
            <form onSubmit={handleEmailSubmit} className={styles.captureForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (captureState === "error") setCaptureState("idle");
                }}
                placeholder={EMAIL_CAPTURE.placeholder}
                className={styles.captureInput}
                aria-label="Email address"
                disabled={captureState === "submitting"}
              />
              <button
                type="submit"
                className={styles.captureButton}
                disabled={captureState === "submitting"}
              >
                {EMAIL_CAPTURE.button}
              </button>
            </form>
          )}

          {captureState === "error" && (
            <p className={styles.captureError}>{captureMessage}</p>
          )}
        </section>

        {/* Atmospheric line */}
        <p className={styles.atmospheric}>{LANDING.atmosphericLine}</p>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>{SITE.copyright}</p>
      </footer>
    </div>
  );
}
