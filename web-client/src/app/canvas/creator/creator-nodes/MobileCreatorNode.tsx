"use client";

import { motion } from "framer-motion";
import styles from "@/styles/creator-nodes/MobileNode.module.css";
import mobileImage from "@/asset/images/mobile.png";
import Image from "next/image";
import CreatorNodeWrapper from "./CreatorNodeWrapper";
import { BlockType } from "@/lib/constants";

export default function MobileCreatorNode({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <CreatorNodeWrapper
      className={styles.container}
      nodeType={BlockType.MOBILE}
    >
      <div className={styles.info}>
        <h3>Mobile</h3>
        <div className={styles.icon}>
          <Image src={mobileImage} alt="mobile" width={60} />
        </div>
      </div>
    </CreatorNodeWrapper>
  );
}
