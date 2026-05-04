// SPEC_SOURCE: specs/presave-schema.md, specs/campaign-3-copy.md
// LAST_PROJECTED: 2026-04-29
import type { Metadata } from "next";
import { PRESAVE, SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import PresaveForm from "./PresaveForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${PRESAVE.og.title}`,
  description: PRESAVE.og.description,
  openGraph: {
    title: PRESAVE.og.title,
    description: PRESAVE.og.description,
    type: "website",
    siteName: SITE.name,
    images: [{ url: PRESAVE.og.image, width: 800, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: PRESAVE.og.title,
    description: PRESAVE.og.description,
    images: [PRESAVE.og.image],
  },
};

export default async function PresavePage({
  params,
}: {
  params: Promise<{ release: string }>;
}) {
  const { release } = await params;
  return (
    <div className={styles.page}>
      <Navigation />
      <main className={styles.main}>
        <PresaveForm release={release} />
      </main>
    </div>
  );
}
