"use client";

import { motion } from "framer-motion";

export const CreatorNodeTransition = {
  whileHover: {
    x: -50,
  },
  transition: {
    duration: 0.2,
  },
};

export default function CreatorNodeWrapper({
  className,
  nodeType,
  children,
}: {
  className: string;
  nodeType: string;
  children: React.ReactNode;
}) {
  const onDragStart = (event: any) => {
    if (!event.dataTransfer) {
      return;
    }
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div
      // drag
      // dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      // dragElastic={1}
      // dragMomentum={false}
      draggable
      onDragStart={onDragStart}
      whileHover={CreatorNodeTransition.whileHover}
      transition={CreatorNodeTransition.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
