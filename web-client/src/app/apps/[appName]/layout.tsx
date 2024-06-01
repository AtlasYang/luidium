"use client";

import { useState } from "react";
import styles from "./layout.module.css";
import Sidebar from "./sidebar/Sidebar";
import { ApplicationPages } from "./pageSet";

export default function RootLayout() {
  const [activeMenu, setActiveMenu] = useState(0);

  return (
    <div className={styles.main}>
      <div className={styles.sidebar}>
        <Sidebar currentMenu={activeMenu} setCurrentMenu={setActiveMenu} />
      </div>
      <div className={styles.body}>
        {ApplicationPages[activeMenu].component}
      </div>
    </div>
  );
}
