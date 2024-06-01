"use client";

import { Application } from "@/service/application/interface";
import styles from "./AppBlock.module.css";
import Image from "next/image";
import {
  deleteApplication,
  removeApplicationVersion,
} from "@/service/application/api";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/app/components/button/PrimaryButton";
import { useCallback, useState } from "react";

export default function AppBlock({
  application,
  isSelected,
  expanded,
  selectApplication,
}: {
  application: Application;
  isSelected: boolean;
  expanded: boolean;
  selectApplication: (appId: string | null) => void;
}) {
  const router = useRouter();
  const handleGoToAppPage = () => {
    router.push(`/apps/${application.app_name}`);
  };

  return (
    <div
      className={`${styles.container} ${isSelected && styles.selected} ${
        expanded && styles.expanded
      }`}
      onClick={() => {
        if (!isSelected) {
          selectApplication(application.app_id);
        } else {
          selectApplication(null);
        }
      }}
    >
      <div className={styles.section}>
        <div className={styles.imageContainer}>
          <img className={styles.image} src={application.image_url} alt="app" />
        </div>
        <div className={styles.names}>
          <h3>{application.app_displayname}</h3>
          <p>{application.app_name}</p>
        </div>
      </div>
      <div className={styles.versionSection}>
        <p>
          version: <span>{application.active_version}</span>
        </p>
        <p>
          {new Date(application.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <PrimaryButton
        onClick={(e) => {
          e.stopPropagation();
          handleGoToAppPage();
        }}
        text="Open"
      />
    </div>
  );
}
