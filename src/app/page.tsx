"use client";

import { useState } from "react";
import { BENEDICTION, EMAIL_CAPTURE, LANDING, SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

type CaptureState = "idle" | "submitting" | "success" | "error";

const API_BASE = process.env.NEXT_PUBLIC_GEX44_API_URL || "https://saturna.greattombproductions.com:8081";

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

    try {
      const res = await fetch(`${API_BASE}/api/hz/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "website" }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setCaptureState("success");
        setCaptureMessage(data.founding_member
          ? `${EMAIL_CAPTURE.success} Founding member.`
          : EMAIL_CAPTURE.success
        );
        setEmail("");
      } else if (res.status === 409) {
        setCaptureState("success");
        setCaptureMessage(EMAIL_CAPTURE.alreadyRegistered);
        setEmail("");
      } else {
        setCaptureState("error");
        setCaptureMessage(EMAIL_CAPTURE.errorGeneral);
      }
    } catch {
      setCaptureState("error");
      setCaptureMessage(EMAIL_CAPTURE.errorNetwork);
    }
  }

  return (
    <div className={styles.cathedral}>
      <Navigation hideUntilScroll sentinelId="hero-sentinel" />

      {/* Hero background — artwork dissolved into environment */}
      <div className={styles.heroBg} aria-hidden="true" />

      <main className={styles.altar}>
        {/* Sentinel for scroll-triggered nav — when this scrolls out, nav appears */}
        <div id="hero-sentinel" aria-hidden="true" />

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
              href="#capture"
              className={styles.ctaPrimary}
              aria-label="Join the menagerie"
            >
              {BENEDICTION.ctaPrimary}
            </a>
          </div>

          <p className={styles.credits}>{BENEDICTION.credits}</p>
        </section>

        {/* Email capture — inscription into the ledger */}
        <section id="capture" className={styles.capture}>
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
