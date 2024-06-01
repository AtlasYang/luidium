"use client";

import styles from "@/styles/creator-nodes/DesktopNode.module.css";
import desktopImage from "@/asset/images/desktop.png";
import Image from "next/image";
import CreatorNodeWrapper from "./CreatorNodeWrapper";
import { BlockType } from "@/lib/constants";

export default function DesktopCreatorNode({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <CreatorNodeWrapper
      className={styles.container}
      nodeType={BlockType.DESKTOP}
    >
      <div className={styles.info}>
        <h3>Desktop</h3>
        <div className={styles.icon}>
          <Image src={desktopImage} alt="desktop" width={70} />
        </div>
      </div>
    </CreatorNodeWrapper>
  );
}
