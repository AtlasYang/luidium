"use client";

import { motion } from "framer-motion";
import styles from "@/styles/creator-nodes/StorageNode.module.css";
import storageImage from "@/asset/images/storage.png";
import Image from "next/image";
import CreatorNodeWrapper from "./CreatorNodeWrapper";
import { BlockType } from "@/lib/constants";

export default function StorageCreatorNode({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <CreatorNodeWrapper
      className={styles.container}
      nodeType={BlockType.STORAGE}
    >
      <div className={styles.info}>
        <h3>Storage</h3>
        <div className={styles.icon}>
          <Image src={storageImage} alt="storage" height={70} />
        </div>
      </div>
    </CreatorNodeWrapper>
  );
}
