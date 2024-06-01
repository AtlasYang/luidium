"use client";

import { Inter } from "next/font/google";
import { Children, ReactNode, useState } from "react";
import styles from "./layout.module.css";
import Sidebar from "./sidebar/Sidebar";
import TopBar from "./topbar/TopBar";
import { DashboardPages } from "./pageSet";
import "./globals.css";
import { Metadata } from "next";

export default function MainPage() {
  const [activeMenu, setActiveMenu] = useState(0);

  return (
    <div className={styles.main}>
      <TopBar currentMenu={activeMenu} setCurrentMenu={setActiveMenu} />
      <div className={styles.body}>
        {/* <div className={styles.sidebar}>
          <Sidebar currentMenu={activeMenu} setCurrentMenu={setActiveMenu} />
        </div> */}
        {DashboardPages[activeMenu].component}
      </div>
    </div>
  );
}
