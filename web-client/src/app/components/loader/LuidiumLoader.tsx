import Image from "next/image";
import styles from "@/styles/loaders/LuidiumLoader.module.css";
import loaderImg from "@/asset/images/loader.svg";
import loaderSmallImg from "@/asset/images/loaderSmall.svg";
import { motion } from "framer-motion";

export default function LuidiumLoader({ size }: { size: number }) {
  return (
    <div
      className={styles.rotating}
      style={{
        width: size,
        height: size,
      }}
    >
      <Image
        src={size > 30 ? loaderImg : loaderSmallImg}
        alt="loader"
        width={size}
        height={size}
      />
    </div>
  );
}
