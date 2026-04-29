// SPEC_SOURCE: specs/card-propagation-architecture.md, specs/campaign-3-copy.md
// LAST_PROJECTED: 2026-04-29
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { CARD } from "@/lib/copy";
import { CardData } from "@/lib/card-types";
import CardRenderer from "./CardRenderer";
import CardBuilder from "./CardBuilder";
import styles from "./page.module.css";

function compressCardData(data: CardData): string {
  try {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return "";
  }
}

function decompressCardData(encoded: string): CardData | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getHzCardData(): CardData {
  return {
    name: CARD.hzCard.name,
    type: CARD.hzCard.type,
    tagline: CARD.hzCard.tagline,
    rows: CARD.defaultRows.map((r) => ({
      domain: r.domain,
      score: r.hzScore,
      qualifier: r.hzQualifier,
    })),
  };
}

export default function CardPage() {
  return (
    <Suspense fallback={<div className={styles.page}><Navigation /></div>}>
      <CardPageInner />
    </Suspense>
  );
}

function CardPageInner() {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("d");

  // States: "hero" (first visit / HZ card), "view" (shared card), "builder"
  const [mode, setMode] = useState<"hero" | "view" | "builder">(
    encodedData ? "view" : "hero"
  );

  const [cardData, setCardData] = useState<CardData>(() => {
    if (encodedData) {
      const decoded = decompressCardData(encodedData);
      if (decoded) return decoded;
    }
    return getHzCardData();
  });

  // Sort rows by score ascending for rendering
  const sortedRows = useMemo(() => {
    return [...cardData.rows].sort((a, b) => a.score - b.score);
  }, [cardData.rows]);

  const cardDataWithSortedRows = useMemo(
    () => ({ ...cardData, rows: sortedRows }),
    [cardData, sortedRows]
  );

  const shareUrl = useMemo(() => {
    const compressed = compressCardData(cardData);
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/card?d=${compressed}`;
  }, [cardData]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback: create temp input
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  };

  const handleDownloadPng = async () => {
    try {
      const { toPng } = await import("html-to-image");
      const node = document.getElementById("card-render-target");
      if (!node) return;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#1a0e1e",
      });
      const link = document.createElement("a");
      link.download = `${cardData.name.replace(/\s+/g, "-").toLowerCase()}-ai-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  };

  // Hero mode: show HZ card + CTA
  if (mode === "hero") {
    return (
      <>
        <Navigation />
        <div className={styles.page}>
          <header className={styles.heroHeader}>
            <h1 className={styles.heroHeadline}>
              {CARD.firstVisit.heroHeadline}
            </h1>
            <p className={styles.heroBody}>{CARD.firstVisit.heroBody}</p>
          </header>

          <div className={styles.heroCardWrap}>
            <CardRenderer data={cardDataWithSortedRows} />
          </div>

          <div className={styles.heroCta}>
            <button
              className={styles.ctaPrimary}
              onClick={() => setMode("builder")}
            >
              {CARD.firstVisit.ctaCreate}
            </button>
            <Link href="/policy" className={styles.ctaSecondary}>
              {CARD.firstVisit.ctaLearnMore}
            </Link>
          </div>
        </div>
      </>
    );
  }

  // View mode: shared card with "Edit a copy" button
  if (mode === "view") {
    return (
      <>
        <Navigation />
        <div className={styles.page}>
          <div className={styles.viewWrap}>
            <CardRenderer data={cardDataWithSortedRows} />
          </div>

          <div className={styles.exportBar}>
            <p className={styles.exportPrompt}>{CARD.export.sharePrompt}</p>
            <div className={styles.exportActions}>
              <button className={styles.exportButton} onClick={handleDownloadPng}>
                {CARD.export.downloadPng}
              </button>
              <button className={styles.exportButton} onClick={handleCopyLink}>
                {CARD.export.copyLink}
              </button>
            </div>
          </div>

          <button
            className={styles.ctaPrimary}
            onClick={() => setMode("builder")}
          >
            Edit a copy
          </button>
        </div>
      </>
    );
  }

  // Builder mode
  return (
    <>
      <Navigation />
      <div className={styles.page}>
        <div className={styles.builderLayout}>
          <div className={styles.builderPane}>
            <CardBuilder
              data={cardData}
              onChange={setCardData}
            />
          </div>
          <div className={styles.previewPane}>
            <CardRenderer data={cardDataWithSortedRows} id="card-render-target" />

            <div className={styles.exportBar}>
              <p className={styles.exportPrompt}>{CARD.export.sharePrompt}</p>
              <div className={styles.exportActions}>
                <button className={styles.exportButton} onClick={handleDownloadPng}>
                  {CARD.export.downloadPng}
                </button>
                <button className={styles.exportButton} onClick={handleCopyLink}>
                  {CARD.export.copyLink}
                </button>
              </div>
              <p className={styles.privacyNote}>{CARD.export.privacyNote}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
