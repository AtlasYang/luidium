"use client";

import styles from "@/styles/dialogs/CloseDialog.module.css";
import AnimatedModalWrapper from "../modal/AnimatedModalWrapper";

export default function SimpleDialog({
  text,
  subText,
  leftText,
  rightText,
  onClickLeft,
  onClickRight,
}: {
  text: string;
  subText?: string;
  leftText?: string;
  rightText?: string;
  onClickLeft: () => void;
  onClickRight: () => void;
}) {
  return (
    <AnimatedModalWrapper className={styles.container}>
      <h3>{text}</h3>
      {subText && <p>{subText}</p>}
      <div className={styles.buttonWrapper}>
        <button className={styles.buttonLeft} onClick={onClickLeft}>
          {leftText ?? "Cancel"}
        </button>
        <button className={styles.buttonRight} onClick={onClickRight}>
          {rightText ?? "Confirm"}
        </button>
      </div>
    </AnimatedModalWrapper>
  );
}
