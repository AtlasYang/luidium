import styles from "@/styles/dialogs/LoadingDialog.module.css";
import AnimatedModalWrapper from "../modal/AnimatedModalWrapper";
import LuidiumLoader from "../loader/LuidiumLoader";

export default function LoadingDialog({ text }: { text?: string }) {
  return (
    <AnimatedModalWrapper className={styles.container}>
      <LuidiumLoader size={96} />
      {text && <p className={styles.text}>{text}</p>}
    </AnimatedModalWrapper>
  );
}
