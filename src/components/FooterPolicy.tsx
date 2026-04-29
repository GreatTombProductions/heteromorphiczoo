"use client";

import { useState } from "react";
import Link from "next/link";
import { POLICY } from "@/lib/copy";
import PolicyContent from "./PolicyContent";
import styles from "./FooterPolicy.module.css";

/**
 * FooterPolicy — Expandable accordion in site footer.
 * Renders PolicyContent with footer-scale styling.
 */
export default function FooterPolicy() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.trigger}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="footer-policy-content"
      >
        <span>{POLICY.footerTrigger}</span>
        <span
          className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
        >
          &#x25BE;
        </span>
      </button>

      <div
        id="footer-policy-content"
        className={`${styles.content} ${expanded ? styles.contentExpanded : ""}`}
        role="region"
        aria-labelledby="footer-policy-trigger"
      >
        <div className={styles.inner}>
          <PolicyContent styles={styles} headingLevel="h3" />

          {/* Permalink to full page */}
          <div className={styles.permalink}>
            <Link href="/policy">View as standalone page &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
