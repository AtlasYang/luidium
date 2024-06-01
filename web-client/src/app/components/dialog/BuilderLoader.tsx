"use client";

import { motion } from "framer-motion";
import styles from "@/styles/dialogs/BuilderLoader.module.css";
import { SyncLoader } from "react-spinners";
import Image from "next/image";
import BuilderLoaderGIF from "@/asset/video/builder_loader.gif";
import AnimatedModalWrapper from "../modal/AnimatedModalWrapper";

export default function BuilderLoader() {
  return (
    <AnimatedModalWrapper className={styles.container}>
      <Image src={BuilderLoaderGIF} alt="BuilderLoaderGIF" width={200} />
    </AnimatedModalWrapper>
  );
}
