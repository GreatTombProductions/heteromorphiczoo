import type { Metadata } from "next";
import { SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import SanctuaryForm from "./SanctuaryForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `The Sanctuary — ${SITE.name}`,
  description:
    "If your life or livelihood has been affected by generative AI, the Zoo is listening.",
};

export default function SanctuaryPage() {
  return (
    <div className={styles.page}>
      <Navigation />
      <main className={styles.main}>
        <SanctuaryForm />
      </main>
    </div>
  );
}
