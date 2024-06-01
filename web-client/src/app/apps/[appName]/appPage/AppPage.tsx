"use client";

import { usePathname } from "next/navigation";

import styles from "./AppPage.module.css";
import BuilderCanvas from "@/app/canvas/BuilderCanvas";
import { useCallback, useEffect, useState } from "react";
import {
  getApplication,
  getApplicationIdByAppName,
} from "@/service/application/api";
import { Application } from "@/service/application/interface";

export default function AppPage() {
  const appName = usePathname().split("/")[2];
  const [applicationInfo, setApplicationInfo] = useState<Application | null>(
    null
  );

  const getApplicationInfo = useCallback(async () => {
    const { content: applicationId } = await getApplicationIdByAppName(appName);
    const applicationInfo = await getApplication(applicationId);
    setApplicationInfo(applicationInfo);
  }, [appName]);

  useEffect(() => {
    getApplicationInfo();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.body}>
        <div className={styles.overview}>
          {applicationInfo && (
            <>
              <img
                className={styles.appImage}
                src={applicationInfo.image_url}
                alt="appImage"
                width={1000}
                height={1000}
              />
              <div className={styles.info}>
                <div className={styles.infoHeader}>
                  <p>{applicationInfo.app_displayname}</p>
                  <div className={styles.infoAppName}>
                    {applicationInfo.app_name}
                  </div>
                </div>
                <div className={styles.infoBody}>
                  <div className={styles.infoBodyTop}>
                    <p>{`Application ID: ${applicationInfo.app_id}`}</p>
                    <div
                      className={`${styles.status} ${
                        applicationInfo.is_active && styles.active
                      }`}
                    >
                      <span />
                      <p>
                        {applicationInfo.is_active
                          ? "Status: Active"
                          : "Status: Inactive"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.description}>
                    <h3>Description</h3>
                    <p>{applicationInfo.description}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
