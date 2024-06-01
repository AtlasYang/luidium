"use client";

import { usePathname } from "next/navigation";
import styles from "./VersionManager.module.css";
import { useCallback, useEffect, useState } from "react";
import { Application } from "@/service/application/interface";
import {
  addApplicationVersion,
  getApplication,
  getApplicationIdByAppName,
  removeApplicationVersion,
  updateApplicationActiveVersion,
} from "@/service/application/api";
import useModal from "@/lib/hook/useModal";
import LoadingDialog from "@/app/components/dialog/LoadingDialog";
import { errorToast, successToast } from "@/utils/toasts";
import DeleteIcon from "@/asset/Icons/DeleteIcon";
import { getUsageCapVersion } from "@/service/sentinel/api";

export default function VersionManager() {
  const appName = usePathname().split("/")[2];

  const [applicationData, setApplicationData] = useState<Application | null>(
    null
  );
  const [usageCapVersion, setUsageCapVersion] = useState<number>(0);
  const [newVersion, setNewVersion] = useState<string>("");
  const [isVersionValid, setIsVersionValid] = useState<boolean>(false);

  const {
    openModal: openCreateModal,
    closeModal: closeCreateModal,
    renderModal: renderCreateModal,
  } = useModal();

  const {
    openModal: openLoadingModal,
    closeModal: closeLoadingModal,
    renderModal: renderLoadingModal,
  } = useModal();

  const getApplicationInfo = useCallback(async () => {
    const { content: applicationId } = await getApplicationIdByAppName(appName);
    const applicationInfo = await getApplication(applicationId);
    setApplicationData(applicationInfo);
    return applicationInfo;
  }, [appName]);

  const handleReadUsageCapVersion = useCallback(async () => {
    const applicationInfo = await getApplicationInfo();
    const { content: usageCap } = await getUsageCapVersion({
      applicationId: applicationInfo.id,
    });
    setUsageCapVersion(usageCap);
  }, []);

  const handleCreateVersion = useCallback(async () => {
    openLoadingModal();
    const applicationInfo = await getApplicationInfo();
    const { success, message } = await addApplicationVersion({
      applicationId: applicationInfo.id,
      version: newVersion,
    });
    if (success) {
      setNewVersion("");
      await getApplicationInfo();
      await handleReadUsageCapVersion();
      closeCreateModal();
      successToast("Version created successfully");
    } else {
      errorToast(message);
    }
    closeLoadingModal();
  }, [
    newVersion,
    openLoadingModal,
    getApplicationInfo,
    closeCreateModal,
    closeLoadingModal,
    handleReadUsageCapVersion,
  ]);

  const handleCheckVersionValid = useCallback(
    (value: string) => {
      const versionRegex = new RegExp("^[0-9]+\\.[0-9]+\\.[0-9]+$");
      const versionList = applicationData?.version_list || [];
      const isVersionValid =
        versionRegex.test(value) && !versionList.includes(value);
      setIsVersionValid(isVersionValid);
    },
    [applicationData]
  );

  const handleRemoveVersion = useCallback(
    async (version: string) => {
      openLoadingModal();
      const applicationInfo = await getApplicationInfo();
      const { success, message } = await removeApplicationVersion({
        applicationId: applicationInfo.id,
        version,
      });
      if (success) {
        await getApplicationInfo();
        await handleReadUsageCapVersion();
        successToast("Version removed successfully");
      } else {
        errorToast(message);
      }
      closeLoadingModal();
    },
    [
      openLoadingModal,
      getApplicationInfo,
      closeLoadingModal,
      handleReadUsageCapVersion,
    ]
  );

  const handleAcitvateVersion = useCallback(
    async (version: string) => {
      openLoadingModal();
      const applicationInfo = await getApplicationInfo();
      const { success, message } = await updateApplicationActiveVersion({
        applicationId: applicationInfo.id,
        activeVersion: version,
      });
      if (success) {
        await getApplicationInfo();
        await handleReadUsageCapVersion();
        successToast("Version activated successfully");
      } else {
        errorToast(message);
      }
      closeLoadingModal();
    },
    [
      openLoadingModal,
      getApplicationInfo,
      closeLoadingModal,
      handleReadUsageCapVersion,
    ]
  );

  useEffect(() => {
    getApplicationInfo();
    handleReadUsageCapVersion();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1>Version Manager</h1>
        <p>
          Current Version: <span>{applicationData?.active_version}</span>
        </p>
        <p>
          Remaining Version: <span>{usageCapVersion}</span>
        </p>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyHeader}>
          <h2>Available Versions</h2>
          <button className={styles.textButton} onClick={openCreateModal}>
            <p>Create New Version</p>
          </button>
        </div>
        <div className={styles.versionList}>
          {applicationData?.version_list
            .toSorted((a, b) => a.localeCompare(b))
            .map((version) => (
              <div key={version} className={styles.version}>
                <p>{version}</p>
                {version === applicationData.active_version ? (
                  <span>Active</span>
                ) : (
                  <>
                    <button
                      className={styles.textButton}
                      onClick={() => handleAcitvateVersion(version)}
                    >
                      <p>Activate</p>
                    </button>
                    <div
                      className={styles.deleteButton}
                      onClick={() => handleRemoveVersion(version)}
                    >
                      <DeleteIcon size={24} color="#FFF" />
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
      {renderCreateModal(
        <div className={styles.createModal}>
          <h1>Create New Version</h1>
          <input
            type="text"
            placeholder="Enter new version"
            value={newVersion}
            onChange={(e) => {
              setNewVersion(e.target.value);
              handleCheckVersionValid(e.target.value);
            }}
          />
          <div className={styles.buttons}>
            {isVersionValid && (
              <button
                className={styles.textButton}
                onClick={handleCreateVersion}
              >
                <p>Create</p>
              </button>
            )}
            <button className={styles.deleteButton} onClick={closeCreateModal}>
              <p>Cancel</p>
            </button>
          </div>
        </div>
      )}
      {renderLoadingModal(
        <LoadingDialog text="Changing version configuration ..." />
      )}
    </div>
  );
}
