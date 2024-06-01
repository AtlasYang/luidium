"use client";

import { motion } from "framer-motion";
import styles from "./Sidebar.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ApplicationPages, FooterItems } from "../pageSet";
import logoWithText from "@/asset/images/logo_text.svg";

export default function Sidebar({
  currentMenu,
  setCurrentMenu,
}: {
  currentMenu: number;
  setCurrentMenu: React.Dispatch<React.SetStateAction<number>>;
}) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => router.push("/")}>
        <Image src={logoWithText} alt="logo" width={160} />
      </div>
      <div className={styles.menuList}>
        {ApplicationPages.map((menu, index) => (
          <motion.div
            key={index}
            className={`${styles.menuItem} ${
              currentMenu === index ? styles.active : ""
            }`}
            onClick={() => setCurrentMenu(index)}
          >
            <p>{menu.name}</p>
          </motion.div>
        ))}
      </div>
      <div className={styles.footer}>
        <div className={styles.footerMenuList}>
          {FooterItems.map((menu, index) => (
            <motion.div
              key={index}
              className={styles.footerMenuItem}
              onClick={() => router.push(menu.route)}
            >
              {menu.icon}
              <p>{menu.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
