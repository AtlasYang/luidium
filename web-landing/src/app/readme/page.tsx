import { readFileSync } from "fs";
import { marked } from "marked";
import styles from "./page.module.css";

export default function ReadmePage() {
  const mdFileText = readFileSync("./src/asset/markdown/README.md");
  const html = marked(mdFileText.toString());
  return (
    <div className={styles.main} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
