"use client";

import { CARD } from "@/lib/copy";
import type { CardData } from "./page";
import styles from "./CardRenderer.module.css";

/**
 * Score-to-color gradient.
 * 0 = deep teal/blue (no AI), 5 = warm amber/red (full AI).
 * The fault line between creative (0-1) and infrastructure (3-5)
 * should be visually dramatic.
 */
function scoreColor(score: number): string {
  const colors: Record<number, string> = {
    0: "rgba(47, 128, 130, 0.35)",   // deep teal
    1: "rgba(60, 140, 120, 0.30)",   // teal-green
    2: "rgba(140, 140, 80, 0.28)",   // transitional amber-green
    3: "rgba(180, 140, 60, 0.30)",   // warm amber
    4: "rgba(196, 100, 60, 0.32)",   // orange
    5: "rgba(196, 60, 60, 0.35)",    // warm red
  };
  return colors[score] ?? colors[3];
}

function scoreBorderColor(score: number): string {
  const colors: Record<number, string> = {
    0: "rgba(47, 160, 160, 0.4)",
    1: "rgba(60, 160, 130, 0.35)",
    2: "rgba(160, 160, 80, 0.3)",
    3: "rgba(196, 154, 60, 0.35)",
    4: "rgba(196, 120, 60, 0.35)",
    5: "rgba(196, 60, 60, 0.4)",
  };
  return colors[score] ?? colors[3];
}

interface CardRendererProps {
  data: CardData;
  id?: string;
}

export default function CardRenderer({ data, id }: CardRendererProps) {
  const isBand = data.type === "band";
  const typeLabel = isBand ? CARD.visual.bandLabel : CARD.visual.listenerLabel;
  const verb = isBand ? CARD.visual.bandVerb : CARD.visual.listenerVerb;

  return (
    <div className={styles.card} id={id}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <span className={styles.typeLabel}>{typeLabel}</span>
        <h2 className={styles.cardName}>{data.name}</h2>
        {data.tagline && (
          <p className={styles.tagline}>{data.tagline}</p>
        )}
      </div>

      {/* Rows */}
      <div className={styles.rows}>
        {data.rows.map((row, i) => (
          <div
            key={i}
            className={styles.row}
            style={{
              backgroundColor: scoreColor(row.score),
              borderLeftColor: scoreBorderColor(row.score),
            }}
          >
            <div className={styles.rowMain}>
              <span className={styles.domain}>{row.domain}</span>
              <span className={styles.score}>
                <span className={styles.scoreVerb}>{verb} </span>
                {row.score}/5
              </span>
            </div>
            {row.qualifier && (
              <p className={styles.qualifier}>{row.qualifier}</p>
            )}
          </div>
        ))}
      </div>

      {/* Watermark */}
      <div className={styles.watermark}>
        <span className={styles.watermarkUrl}>{CARD.watermark}</span>
        <span className={styles.watermarkHook}>{CARD.watermarkHook}</span>
      </div>
    </div>
  );
}
