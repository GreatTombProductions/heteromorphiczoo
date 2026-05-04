import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Unsubscribed — Heteromorphic Zoo",
  robots: { index: false },
};

export default function UnsubscribePage() {
  return (
    <div className={styles.page}>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.headline}>You have been released.</h1>
          <p className={styles.body}>
            Your email has been removed from the newsletter.
            You remain in the menagerie — only the summons have ceased.
          </p>
          <div className={styles.resubscribe}>
            <p className={styles.resubscribeLabel}>To rejoin the newsletter:</p>
            <p className={styles.instructions}>
              Visit{" "}
              <Link href="/" className={styles.link}>
                heteromorphiczoo.com
              </Link>{" "}
              and join the menagerie again with the same email.
              Check the newsletter box. The congregation remembers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
