import { useCallback, useEffect, useState } from "react";
import styles from "./LogPage.module.css";
import { Log } from "@/service/sentinel/interface";
import { usePathname } from "next/navigation";
import {
  getApplication,
  getApplicationIdByAppName,
} from "@/service/application/api";
import { getApplicationLogs } from "@/service/sentinel/api";
import PrimaryButton from "@/app/components/button/PrimaryButton";
import { timestampToNumber } from "@/utils/times";

export default function LogPage() {
  const appName = usePathname().split("/")[2];
  const [logs, setLogs] = useState<Log[] | null>(null);

  const getApplicationInfo = useCallback(async () => {
    const { content: applicationId } = await getApplicationIdByAppName(appName);
    const applicationInfo = await getApplication(applicationId);
    return applicationInfo;
  }, [appName]);

  const handleGetLogs = useCallback(async () => {
    const applicationInfo = await getApplicationInfo();
    const logs = await getApplicationLogs({
      applicationId: applicationInfo.id,
    });
    // sort logs by timestamp
    logs.sort(
      (a, b) => timestampToNumber(b.timestamp) - timestampToNumber(a.timestamp)
    );
    setLogs(logs);
  }, [getApplicationInfo]);

  useEffect(() => {
    handleGetLogs();
  }, []);

  return (
    <div className={styles.container}>
      <h1>Log</h1>
      <PrimaryButton onClick={handleGetLogs} text="Refresh" />
      <div className={styles.logContainer}>
        {!logs && <pre style={{ color: "#FFF" }}>Fetching Logs...</pre>}
        {logs && logs.length === 0 && (
          <pre style={{ color: "#FFF" }}>No logs found.</pre>
        )}
        {logs &&
          logs.map((log, index) => (
            <div
              style={{
                color:
                  log.level === "ERROR"
                    ? "red"
                    : log.level === "SUCCESS"
                    ? "yellow"
                    : "white",
              }}
              key={index}
              className={styles.log}
            >
              <pre className={styles.level}>{log.level}</pre>
              <pre className={styles.message}>{log.message}</pre>
              <pre className={styles.timestamp}>
                {new Date(log.timestamp)
                  .toISOString()
                  .replace("T", " ")
                  .slice(0, 19)}
              </pre>
            </div>
          ))}
      </div>
    </div>
  );
}
