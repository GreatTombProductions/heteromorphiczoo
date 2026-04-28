"use client";

import { CARD } from "@/lib/copy";
import type { CardData, CardRow } from "./page";
import styles from "./CardBuilder.module.css";

interface CardBuilderProps {
  data: CardData;
  onChange: (data: CardData) => void;
}

export default function CardBuilder({ data, onChange }: CardBuilderProps) {
  const isBand = data.type === "band";

  const updateField = <K extends keyof CardData>(key: K, value: CardData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const updateRow = (index: number, field: keyof CardRow, value: string | number) => {
    const newRows = [...data.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    onChange({ ...data, rows: newRows });
  };

  const addRow = () => {
    onChange({
      ...data,
      rows: [...data.rows, { domain: "", score: 0, qualifier: "" }],
    });
  };

  const removeRow = (index: number) => {
    onChange({
      ...data,
      rows: data.rows.filter((_, i) => i !== index),
    });
  };

  const resetToDefaults = () => {
    onChange({
      name: data.name,
      type: data.type,
      tagline: "",
      rows: CARD.defaultRows.map((r) => ({
        domain: r.domain,
        score: r.hzScore,
        qualifier: r.hzQualifier,
      })),
    });
  };

  return (
    <div className={styles.builder}>
      {/* Mode toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.toggleButton} ${isBand ? styles.active : ""}`}
          onClick={() => updateField("type", "band")}
          type="button"
        >
          {CARD.builder.toggleBand}
        </button>
        <button
          className={`${styles.toggleButton} ${!isBand ? styles.active : ""}`}
          onClick={() => updateField("type", "listener")}
          type="button"
        >
          {CARD.builder.toggleListener}
        </button>
      </div>

      <h2 className={styles.builderHeadline}>
        {isBand ? CARD.builder.headlineBand : CARD.builder.headlineListener}
      </h2>

      {/* Name */}
      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input
          type="text"
          className={styles.input}
          value={data.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Your band or name"
        />
      </div>

      {/* Tagline */}
      <div className={styles.field}>
        <label className={styles.label}>Tagline (optional)</label>
        <input
          type="text"
          className={styles.input}
          value={data.tagline}
          onChange={(e) => updateField("tagline", e.target.value)}
          placeholder="One line that captures your stance"
        />
      </div>

      {/* Domain rows */}
      <div className={styles.rowsSection}>
        {data.rows.map((row, i) => (
          <div key={i} className={styles.rowEditor}>
            <div className={styles.rowHeader}>
              <input
                type="text"
                className={styles.domainInput}
                value={row.domain}
                onChange={(e) => updateRow(i, "domain", e.target.value)}
                placeholder={CARD.controls.domainPlaceholder}
              />
              <button
                className={styles.removeButton}
                onClick={() => removeRow(i)}
                type="button"
                title={CARD.controls.removeRow}
              >
                &times;
              </button>
            </div>

            <div className={styles.scoreRow}>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={row.score}
                onChange={(e) => updateRow(i, "score", parseInt(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.scoreLabel}>
                {row.score}/5
                <span className={styles.scaleMeaning}>
                  {CARD.scaleLabels[row.score as keyof typeof CARD.scaleLabels]}
                </span>
              </span>
            </div>

            <input
              type="text"
              className={styles.qualifierInput}
              value={row.qualifier}
              onChange={(e) => updateRow(i, "qualifier", e.target.value)}
              placeholder={CARD.controls.qualifierPlaceholder}
            />
          </div>
        ))}
      </div>

      <div className={styles.rowActions}>
        <button className={styles.addButton} onClick={addRow} type="button">
          {CARD.controls.addRow}
        </button>
        <button
          className={styles.resetButton}
          onClick={resetToDefaults}
          type="button"
        >
          {CARD.controls.resetToDefaults}
        </button>
      </div>
    </div>
  );
}
