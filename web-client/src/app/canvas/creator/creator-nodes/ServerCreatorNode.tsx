"use client";

import { motion } from "framer-motion";
import styles from "@/styles/creator-nodes/ServerNode.module.css";
import serverImage from "@/asset/images/server.png";
import Image from "next/image";
import CreatorNodeWrapper from "./CreatorNodeWrapper";
import { BlockType } from "@/lib/constants";

export default function ServerCreatorNode({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <CreatorNodeWrapper
      className={styles.container}
      nodeType={BlockType.SERVER}
    >
      <div className={styles.info}>
        <h3>Server</h3>
        <div className={styles.icon}>
          <Image src={serverImage} alt="server" height={80} />
        </div>
      </div>
    </CreatorNodeWrapper>
  );
}
