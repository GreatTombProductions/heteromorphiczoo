"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CARD, POLICY } from "@/lib/copy";
import type { CardData } from "@/lib/card-types";
import CardRenderer from "@/app/card/CardRenderer";

interface PolicyContentProps {
  /** CSS module — lets parent control all visual sizing. */
  styles: Record<string, string>;
  /** h2 for standalone page, h3 for footer accordion. */
  headingLevel?: "h2" | "h3";
}

/**
 * PolicyContent — the three-section AI policy.
 * Shared between /policy page and footer expandable.
 * Section 3 renders from an ordered `flow` array so the card
 * embed (and everything else) can be rearranged in copy.ts.
 */
export default function PolicyContent({
  styles,
  headingLevel = "h2",
}: PolicyContentProps) {
  const Heading = headingLevel;
  const [s1, s2, s3] = POLICY.sections;

  const hzCardData: CardData = useMemo(
    () => ({
      name: CARD.hzCard.name,
      type: CARD.hzCard.type,
      tagline: CARD.hzCard.tagline,
      rows: [...CARD.defaultRows]
        .map((r) => ({
          domain: r.domain,
          score: r.hzScore,
          qualifier: r.hzQualifier,
        }))
        .sort((a, b) => a.score - b.score),
    }),
    []
  );

  return (
    <article className={styles.policy}>
      {/* Section 1: Every Note Is Human */}
      <section id={s1.id} className={styles.section}>
        <Heading className={styles.sectionHeader}>{s1.title}</Heading>
        <div className={styles.sectionBody}>
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
        <Heading className={styles.sectionHeader}>{s2.title}</Heading>
        <div className={styles.sectionBody}>
          {s2.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <blockquote className={styles.pullQuote}>
            <p>{s2.pullQuote}</p>
          </blockquote>
          {s2.paragraphsAfterPullQuote.map((p, i) => (
            <p key={`after-${i}`}>{p}</p>
          ))}
        </div>
      </section>

      {/* Section 3: The Problem Is Silence — rendered from flow array */}
      <section id={s3.id} className={styles.section}>
        <Heading className={styles.sectionHeader}>{s3.title}</Heading>
        <div className={styles.sectionBody}>
          {s3.flow.map((block, i) => {
            switch (block.type) {
              case "p":
                return <p key={i}>{block.text}</p>;

              case "declaration":
                return (
                  <p key={i} className={styles.declaration}>
                    {block.prefix}
                    <strong>{block.text}</strong>
                  </p>
                );

              case "card-embed":
                return (
                  <div key={i} className={styles.cardEmbed}>
                    <p className={styles.cardIntro}>{block.intro}</p>
                    <div className={styles.cardWrap}>
                      <CardRenderer data={hzCardData} />
                    </div>
                    <Link href="/card" className={styles.cardCta}>
                      {block.cta}
                    </Link>
                  </div>
                );

              case "sanctuary":
                return (
                  <div key={i}>
                    <p className={styles.sanctuaryBlock}>
                      {block.prompt}{" "}
                      <Link
                        href="/sanctuary"
                        className={styles.sanctuaryLink}
                      >
                        {block.linkText}
                      </Link>
                    </p>
                    <p>{block.coda}</p>
                  </div>
                );
            }
          })}
        </div>
      </section>
    </article>
  );
}
