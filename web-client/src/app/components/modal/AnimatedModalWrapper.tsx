"use client";

import useModal from "@/lib/hook/useModal";
import { AnimatePresence, motion } from "framer-motion";
import SimpleDialog from "../dialog/SimpleDialog";
import CloseButton from "../button/CloseButton";

export default function AnimatedModalWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div style={{}}>
      <motion.div
        key={className}
        className={className}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{
          duration: 0.15,
          ease: [0.42, 0, 0.58, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
