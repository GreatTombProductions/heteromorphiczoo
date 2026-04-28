"use client";

import { useState } from "react";
import Link from "next/link";
import { POLICY } from "@/lib/copy";
import styles from "./FooterPolicy.module.css";

/**
 * FooterPolicy — Expandable accordion in site footer.
 * Shows policy inline, or links to /policy for permalink.
 * Renders from same POLICY constant as /policy page.
 */
export default function FooterPolicy() {
  const [expanded, setExpanded] = useState(false);
  const [s1, s2, s3] = POLICY.sections;

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.trigger}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="footer-policy-content"
      >
        <span>{POLICY.footerTrigger}</span>
        <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}>
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
          {/* Section 1 */}
          <section id={s1.id} className={styles.section}>
            <h3 className={styles.sectionHeader}>{s1.title}</h3>
            <p className={styles.heroLine}>{s1.paragraphs[0]}</p>
            {s1.paragraphs.slice(1).map((p, i) =>
              p.includes("[The Chronicle]") ? (
                <p key={i}>
                  We can prove all of this.{" "}
                  <Link href="/chronicle" className={styles.inlineLink}>
                    The Chronicle
                  </Link>{" "}
                  documents every collaboration, every production decision, every
                  person who touched every release. That documentation is not a
                  courtesy. It is the receipt.
                </p>
              ) : (
                <p key={i}>{p}</p>
              )
            )}
          </section>

          {/* Section 2 */}
          <section id={s2.id} className={styles.section}>
            <h3 className={styles.sectionHeader}>{s2.title}</h3>
            {s2.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <blockquote className={styles.pullQuote}>
              <p>{s2.pullQuote}</p>
            </blockquote>
            {s2.paragraphsAfterPullQuote.map((p, i) => (
              <p key={`after-${i}`}>{p}</p>
            ))}
          </section>

          {/* Section 3 */}
          <section id={s3.id} className={styles.section}>
            <h3 className={styles.sectionHeader}>{s3.title}</h3>
            {s3.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p>
              Heteromorphic Zoo&rsquo;s position:{" "}
              <strong>{s3.declaration}</strong>
            </p>
            {s3.paragraphsAfterDeclaration.map((p, i) => (
              <p key={`after-${i}`}>{p}</p>
            ))}
            <p>
              {s3.sanctuaryPrompt}{" "}
              <Link href="/sanctuary" className={styles.sanctuaryLink}>
                {s3.sanctuaryLinkText}
              </Link>
            </p>
            <p>{s3.sanctuaryCoda}</p>
          </section>

          {/* Permalink to full page */}
          <div className={styles.permalink}>
            <Link href="/policy">View as standalone page &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
