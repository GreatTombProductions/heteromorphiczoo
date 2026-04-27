"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { LOADING, MENAGERIE_ROLL } from "@/lib/copy";
import styles from "./page.module.css";

interface RollEntry {
  name: string;
  rank: number;
  rank_title: string;
  lifetime_dp: number;
  founding_member: boolean;
  joined: string | null;
}

interface RollData {
  roll: RollEntry[];
  generated_at: string;
}

interface RankCount {
  rank: number;
  title: string;
  count: number;
}

interface CensusData {
  total_members: number;
  by_rank: RankCount[];
  total_offerings: number;
  total_reactions: number;
  founding_members: number;
  generated_at: string;
}

/** Map rank index to a CSS class for color differentiation */
function rankClass(rank: number): string {
  const classes: Record<number, string> = {
    0: styles.rankUninitiated,
    1: styles.rankAcolyte,
    2: styles.rankDeacon,
    3: styles.rankElder,
    4: styles.rankHighPriest,
    5: styles.rankArchbishop,
  };
  return classes[rank] ?? "";
}

export default function MenageriePage() {
  const [roll, setRoll] = useState<RollData | null>(null);
  const [census, setCensus] = useState<CensusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/menagerie-roll.json").then((r) => r.json()),
      fetch("/data/census.json").then((r) => r.json()),
    ])
      .then(([rollData, censusData]) => {
        setRoll(rollData);
        setCensus(censusData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{MENAGERIE_ROLL.title}</h1>
          <p className={styles.subtitle}>{MENAGERIE_ROLL.subtitle}</p>
        </header>

        {loading ? (
          <p className={styles.loading}>{LOADING.roll}</p>
        ) : (
          <>
            {/* Census — the aggregate numbers */}
            {census && (
              <section className={styles.census}>
                <h2 className={styles.censusTitle}>{MENAGERIE_ROLL.censusTitle}</h2>
                <div className={styles.censusGrid}>
                  <div className={styles.censusStat}>
                    <span className={styles.censusNumber}>{census.total_members}</span>
                    <span className={styles.censusLabel}>Souls Counted</span>
                  </div>
                  <div className={styles.censusStat}>
                    <span className={styles.censusNumber}>{census.founding_members}</span>
                    <span className={styles.censusLabel}>Founding Members</span>
                  </div>
                  <div className={styles.censusStat}>
                    <span className={styles.censusNumber}>{census.total_offerings}</span>
                    <span className={styles.censusLabel}>Offerings Consecrated</span>
                  </div>
                  <div className={styles.censusStat}>
                    <span className={styles.censusNumber}>{census.total_reactions}</span>
                    <span className={styles.censusLabel}>Witnesses</span>
                  </div>
                </div>

                {/* Rank distribution */}
                <div className={styles.rankDistribution}>
                  {census.by_rank
                    .filter((r) => r.count > 0)
                    .sort((a, b) => b.rank - a.rank)
                    .map((r) => (
                      <div key={r.rank} className={`${styles.rankBar} ${rankClass(r.rank)}`}>
                        <span className={styles.rankBarTitle}>{r.title}</span>
                        <span className={styles.rankBarCount}>{r.count}</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* The Roll — every named congregant */}
            {roll && roll.roll.length > 0 ? (
              <section className={styles.rollSection}>
                <div className={styles.rollTable}>
                  <div className={styles.rollHeader}>
                    <span className={styles.rollHeaderName}>Name</span>
                    <span className={styles.rollHeaderRank}>Rank</span>
                    <span className={styles.rollHeaderDp}>{MENAGERIE_ROLL.dpLabel}</span>
                  </div>
                  {roll.roll.map((entry, i) => (
                    <div key={`${entry.name}-${i}`} className={`${styles.rollRow} ${rankClass(entry.rank)}`}>
                      <span className={styles.rollName}>
                        {entry.name}
                        {entry.founding_member && (
                          <span className={styles.foundingBadge}>{MENAGERIE_ROLL.foundingBadge}</span>
                        )}
                      </span>
                      <span className={styles.rollRank}>{entry.rank_title}</span>
                      <span className={styles.rollDp}>{entry.lifetime_dp}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <div className={styles.emptyState}>
                <p>{MENAGERIE_ROLL.emptyState}</p>
                <p className={styles.joinPrompt}>{MENAGERIE_ROLL.joinPrompt}</p>
                <Link href="/" className={styles.joinButton}>
                  {MENAGERIE_ROLL.joinButton}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
