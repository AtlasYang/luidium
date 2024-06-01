import styles from "@/styles/loaders/GradientLoader.module.css";

export default function GradientLoader({ size }: { size: number }) {
  return (
    <div className={styles.loader} style={{ width: size, height: size }} />
  );
}
