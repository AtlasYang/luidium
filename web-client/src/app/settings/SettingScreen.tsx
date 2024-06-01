"use client";

import { ReactNode, useCallback, useState } from "react";
import styles from "./SettingScreen.module.css";
import APIPage from "./api/APIPage";

const SettingTabs: { name: string; component: ReactNode }[] = [
  {
    name: "General",
    component: <h1>Overview</h1>,
  },
  {
    name: "Deployments",
    component: <h1>Users</h1>,
  },
  {
    name: "APIs",
    component: <APIPage />,
  },
];

export default function SettingScreen() {
  const [activeTab, setActiveTab] = useState(0);

  const toggleDarkMode = useCallback(() => {
    if (
      document.documentElement.getAttribute("data-theme") === "dark" ||
      !document.documentElement.getAttribute("data-theme")
    )
      document.documentElement.setAttribute("data-theme", "light");
    else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.tabWrapper}>
        <div className={styles.tabs}>
          {SettingTabs.map((tab, index) => (
            <div
              key={index}
              className={`${styles.tab} ${
                index === activeTab ? styles.active : ""
              }`}
              onClick={() => setActiveTab(index)}
            >
              <p>{tab.name}</p>
            </div>
          ))}
        </div>
        <div className={styles.tabContent}>
          {SettingTabs[activeTab].component}
        </div>
      </div>
    </div>
  );
}
