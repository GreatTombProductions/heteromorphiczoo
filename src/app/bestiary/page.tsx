import type { Metadata } from "next";
import { BESTIARY, SITE } from "@/lib/copy";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${BESTIARY.title} — ${SITE.name}`,
  description: BESTIARY.subtitle,
};

export default function BestiaryPage() {
  return (
    <>
      <Navigation />
      <div className={styles.bestiary}>
        <header className={styles.header}>
          <h1 className={styles.title}>{BESTIARY.title}</h1>
          <p className={styles.subtitle}>{BESTIARY.subtitle}</p>
        </header>

        {/* Core members */}
        <section className={styles.members}>
          {BESTIARY.members.map((member) => (
            <article key={member.name} className={styles.member}>
              <div className={styles.memberHeader}>
                <h2 className={styles.memberName}>{member.name}</h2>
                <span className={styles.designation}>{member.designation}</span>
              </div>
              <p className={styles.roles}>{member.roles}</p>
              <p className={styles.description}>{member.description}</p>
              {!member.current && (
                <span className={styles.foundingBadge}>Founding Member</span>
              )}
            </article>
          ))}
        </section>

        {/* Guest musicians */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Guest Voices</h2>
          <div className={styles.guests}>
            {BESTIARY.guests.map((guest) => (
              <article key={guest.name} className={styles.guest}>
                <h3 className={styles.guestName}>{guest.name}</h3>
                <p className={styles.guestRole}>
                  {guest.role} on &ldquo;{guest.track}&rdquo;
                </p>
                <p className={styles.guestNote}>{guest.note}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Production circle */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{BESTIARY.collaborators.title}</h2>
          <div className={styles.collaborators}>
            {BESTIARY.collaborators.entries.map((collab) => (
              <div key={collab.name} className={styles.collaborator}>
                <span className={styles.collabName}>{collab.name}</span>
                <span className={styles.collabRole}>{collab.role}</span>
                {collab.note && (
                  <span className={styles.collabNote}>{collab.note}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
