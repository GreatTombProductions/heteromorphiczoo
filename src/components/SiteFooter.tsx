import Link from "next/link";
import { SITE } from "@/lib/copy";
import styles from "./SiteFooter.module.css";

/**
 * SiteFooter — Global footer rendered in the root layout.
 * Generative AI Policy link + copyright on every page.
 */
export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/policy" className={styles.policyLink}>
        Generative AI Policy
      </Link>
      <p className={styles.copyright}>{SITE.copyright}</p>
    </footer>
  );
}
