import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.rotating}>
        <Image
          src="/logo.svg"
          alt="Under Construction"
          width={220}
          height={220}
        />
      </div>
      <h3>Under Construction 🔨</h3>
    </main>
  );
}
