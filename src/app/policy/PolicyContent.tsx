"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CARD, POLICY } from "@/lib/copy";
import type { CardData } from "@/lib/card-types";
import CardRenderer from "@/app/card/CardRenderer";
import styles from "./page.module.css";

/**
 * PolicyContent — the three-section AI policy, reusable for both
 * the /policy page (static render) and the footer expandable.
 */
export default function PolicyContent() {
  const [s1, s2, s3] = POLICY.sections;

  const hzCardData: CardData = useMemo(() => ({
    name: CARD.hzCard.name,
    type: CARD.hzCard.type,
    tagline: CARD.hzCard.tagline,
    rows: [...CARD.defaultRows]
      .map((r) => ({ domain: r.domain, score: r.hzScore, qualifier: r.hzQualifier }))
      .sort((a, b) => a.score - b.score),
  }), []);

  return (
    <article className={styles.policy}>
      {/* Section 1: Every Note Is Human — screenshot-survivable */}
      <section id={s1.id} className={styles.section}>
        <h2 className={styles.sectionHeader}>{s1.title}</h2>
        <div className={styles.sectionBody}>
          {/* Lead line — pull-quote scale */}
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
        </div>
      </section>

      {/* Section 2: AI Handles What Artists Shouldn't Have To */}
      <section id={s2.id} className={styles.section}>
        <h2 className={styles.sectionHeader}>{s2.title}</h2>
        <div className={styles.sectionBody}>
          {s2.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {/* The pull-quote — designed for extraction */}
          <blockquote className={styles.pullQuote}>
            <p>{s2.pullQuote}</p>
          </blockquote>

          {s2.paragraphsAfterPullQuote.map((p, i) => (
            <p key={`after-${i}`}>{p}</p>
          ))}
        </div>
      </section>

      {/* Section 3: The Problem Isn't AI. The Problem Is Silence. */}
      <section id={s3.id} className={styles.section}>
        <h2 className={styles.sectionHeader}>{s3.title}</h2>
        <div className={styles.sectionBody}>
          {s3.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {/* Declaration — bold stance */}
          <p className={styles.declaration}>
            Heteromorphic Zoo&rsquo;s position:{" "}
            <strong>{s3.declaration}</strong>
          </p>

          {/* Inline card — proof of the declaration */}
          <div className={styles.cardEmbed}>
            <p className={styles.cardIntro}>{s3.cardEmbed.intro}</p>
            <div className={styles.cardWrap}>
              <CardRenderer data={hzCardData} />
            </div>
            <Link href="/card" className={styles.cardCta}>
              {s3.cardEmbed.cta}
            </Link>
          </div>

          {s3.paragraphsAfterDeclaration.map((p, i) => (
            <p key={`after-${i}`}>{p}</p>
          ))}

          {/* Sanctuary link — gold accent */}
          <p className={styles.sanctuaryBlock}>
            {s3.sanctuaryPrompt}{" "}
            <Link href="/sanctuary" className={styles.sanctuaryLink}>
              {s3.sanctuaryLinkText}
            </Link>
          </p>

          <p>{s3.sanctuaryCoda}</p>
        </div>
      </section>
    </article>
  );
}
