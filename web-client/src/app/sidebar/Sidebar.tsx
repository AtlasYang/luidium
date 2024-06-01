"use client";

import { motion } from "framer-motion";
import styles from "./Sidebar.module.css";
import { DashboardPages } from "../pageSet";

export default function Sidebar({
  currentMenu,
  setCurrentMenu,
}: {
  currentMenu: number;
  setCurrentMenu: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.menuList}>
        {DashboardPages.map((menu, index) => (
          <motion.div
            key={index}
            className={`${styles.menuItem} ${
              currentMenu === index ? styles.active : ""
            }`}
            onClick={() => setCurrentMenu(index)}
          >
            <p>{menu.name}</p>
            <div className={styles.icon}>{menu.icon}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
