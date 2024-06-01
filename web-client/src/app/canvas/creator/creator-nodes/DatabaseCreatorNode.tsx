"use client";

import styles from "@/styles/creator-nodes/DatabaseNode.module.css";
import databaseImage from "@/asset/images/database.png";
import Image from "next/image";
import CreatorNodeWrapper from "./CreatorNodeWrapper";
import { BlockType } from "@/lib/constants";

export default function DatabaseCreatorNode({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <CreatorNodeWrapper
      className={styles.container}
      nodeType={BlockType.DATABASE}
    >
      <div className={styles.info}>
        <h3>Database</h3>
        <div className={styles.icon}>
          <Image src={databaseImage} alt="database" width={100} />
        </div>
      </div>
    </CreatorNodeWrapper>
  );
}
