"use client";

import { GoChevronRight } from "react-icons/go";
import { AnimatePresence, motion } from "framer-motion";
import styles from "@/styles/buttons/ConfigButton.module.css";
import { useEffect, useState } from "react";

export default function ConfigButton({
  size,
  color,
  onClick,
  guideText,
}: Readonly<{
  size: number;
  color: string;
  onClick: () => void;
  guideText: string;
}>) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className={styles.container}>
      <GoChevronRight
        size={size}
        color={color}
        onClick={() => {
          setIsGuideOpen(false);
          onClick();
        }}
        // onMouseOver={() => {
        //   setIsGuideOpen(true);
        // }}
        // onMouseLeave={() => {
        //   setIsGuideOpen(false);
        // }}
      />
      <AnimatePresence>
        {isGuideOpen && (
          <motion.div
            key="guide"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className={styles.guide}
          >
            {guideText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
