// SPEC_SOURCE: specs/partner-program-spec.md, specs/campaign-3-copy.md
// LAST_PROJECTED: 2026-04-29
import type { Metadata } from "next";
import { PARTNER_APPLY, SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import PartnerForm from "./PartnerForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${PARTNER_APPLY.title} — ${SITE.name}`,
  description: PARTNER_APPLY.subtitle,
};

export default function PartnerApplyPage() {
  return (
    <div className={styles.page}>
      <Navigation />
      <main className={styles.main}>
        <PartnerForm />
      </main>
    </div>
  );
}
