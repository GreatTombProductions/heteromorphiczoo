import type { Metadata } from "next";
import { SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import PolicyContent from "@/components/PolicyContent";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `Generative AI Policy — ${SITE.name}`,
  description:
    "Every note is human. Heteromorphic Zoo's generative AI transparency policy.",
};

export default function PolicyPage() {
  return (
    <div className={styles.page}>
      <Navigation />
      <main className={styles.main}>
        <PolicyContent styles={styles} headingLevel="h2" />
      </main>
    </div>
  );
}
