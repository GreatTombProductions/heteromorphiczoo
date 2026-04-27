import Link from "next/link";
import { NOT_FOUND } from "@/lib/copy";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.void}>
      <div className={styles.boundary}>
        <p className={styles.line}>{NOT_FOUND.line1}</p>
        <p className={styles.line}>{NOT_FOUND.line2}</p>
        <Link href="/" className={styles.returnLink}>
          {NOT_FOUND.returnLink} &rarr;
        </Link>
      </div>
    </div>
  );
}
