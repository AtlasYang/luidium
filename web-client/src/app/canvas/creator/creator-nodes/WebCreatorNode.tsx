"use client";

import { motion } from "framer-motion";
import styles from "@/styles/creator-nodes/WebNode.module.css";
import webImage from "@/asset/images/web.png";
import Image from "next/image";
import CreatorNodeWrapper from "./CreatorNodeWrapper";
import { BlockType } from "@/lib/constants";

export default function WebCreatorNode({ onClick }: { onClick: () => void }) {
  return (
    <CreatorNodeWrapper className={styles.container} nodeType={BlockType.WEB}>
      <div className={styles.info}>
        <h3>Web</h3>
        <div className={styles.icon}>
          <Image src={webImage} alt="web" height={80} />
        </div>
      </div>
    </CreatorNodeWrapper>
  );
}
