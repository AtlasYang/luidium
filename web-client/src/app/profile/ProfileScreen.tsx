"use client";

import { ReactNode, useState } from "react";
import styles from "./ProfileScreen.module.css";

const ProfileTabs: { name: string; component: ReactNode }[] = [
  {
    name: "Overview",
    component: <h1>Overview</h1>,
  },
  {
    name: "Privacy",
    component: <h1>Users</h1>,
  },
];
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className={styles.container}>
      <div className={styles.tabWrapper}>
        <div className={styles.tabs}>
          {ProfileTabs.map((tab, index) => (
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
          {ProfileTabs[activeTab].component}
        </div>
      </div>
    </div>
  );
}
