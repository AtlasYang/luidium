import styles from "@/styles/buttons/PrimaryButton.module.css";

export default function PrimaryButton({
  onClick,
  text,
}: {
  onClick: (e: any) => void;
  text: string;
}) {
  return (
    <div className={styles.button} onClick={onClick}>
      {text}
    </div>
  );
}
