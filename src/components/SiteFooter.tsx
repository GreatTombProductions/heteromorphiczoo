"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/copy";
import styles from "./SiteFooter.module.css";

/**
 * SiteFooter — Global footer rendered in the root layout.
 * Generative AI Policy link + copyright on every page.
 * Landing page has its own accordion, so the link is hidden there.
 */
export default function SiteFooter() {
  const pathname = usePathname();
  const showPolicyLink = pathname !== "/";

  return (
    <footer className={styles.footer}>
      {showPolicyLink && (
        <Link href="/policy" className={styles.policyLink}>
          Generative AI Policy
        </Link>
      )}
      <p className={styles.copyright}>{SITE.copyright}</p>
    </footer>
  );
}
