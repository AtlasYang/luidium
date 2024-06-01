"use client";

import {
  deleteApplication,
  getApplicationsByUserId,
} from "@/service/application/api";
import styles from "./MyAppScreen.module.css";
import { useCallback, useEffect, useState } from "react";
import { Application } from "@/service/application/interface";
import AppBlock from "./applicationblock/AppBlock";
import LoadingDialog from "@/app/components/dialog/LoadingDialog";
import { dismissProgress } from "@/lib/navigation-events";
import AppCreatorScreen from "../applicationCreator/AppCreatorScreen";
import useModal from "@/lib/hook/useModal";
import PrimaryButton from "@/app/components/button/PrimaryButton";
import { readAllCollaborators } from "@/service/sentinel/api";
import { User } from "@/service/user/interface";
import UserPile from "@/app/components/user/UserPile";
import SimpleDialog from "@/app/components/dialog/SimpleDialog";
import { successToast } from "@/utils/toasts";
import { AnimatePresence, motion } from "framer-motion";

export default function MyAppScreen() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<User[] | null>(null);
  const {
    renderModal: renderCreateModal,
    openModal: openCreateModal,
    closeModal: closeCreateModal,
  } = useModal();
  const {
    renderModal: renderDeleteModal,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const getApplications = useCallback(async () => {
    const result = await getApplicationsByUserId();
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    setApplications(result);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    closeCreateModal();
    getApplications();
  }, [closeCreateModal, getApplications]);

  const handleDeleteApplication = useCallback(
    async (applicationId: string) => {
      const { isSuccess, message } = await deleteApplication(applicationId);
      if (!isSuccess) {
        alert(message);
      } else {
        setSelectedAppId(null);
        await getApplications();
      }
      successToast("Application deleted successfully");
      setSelectedApplication(null);
      setIsRightOpen(false);
      closeDeleteModal();
    },
    [getApplications, closeDeleteModal]
  );

  const handleGetCollaborators = useCallback(async (applicationId: string) => {
    const collaborators = await readAllCollaborators({ applicationId });
    setCollaborators(collaborators);
  }, []);

  const handleSelectApplication = useCallback(
    (appId: string | null) => {
      setSelectedAppId(appId);
      setIsRightOpen(!!appId);
      setSelectedApplication(
        applications?.find((app) => app.app_id === appId) ?? null
      );
    },
    [applications]
  );

  const handleInitialize = useCallback(async () => {
    setIsLoading(true);
    await getApplications();
    setIsLoading(false);
    dismissProgress();
  }, [getApplications]);

  useEffect(() => {
    handleInitialize();

    return () => {
      setSelectedAppId(null);
      setSelectedApplication(null);
      setApplications(null);
    };
  }, []);

  useEffect(() => {
    if (selectedApplication) {
      handleGetCollaborators(selectedApplication.id);
    } else {
      setCollaborators(null);
    }
  }, [selectedApplication, handleGetCollaborators]);

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.header}>
          <PrimaryButton onClick={openCreateModal} text="New Application" />
        </div>
        {isLoading && (
          <div className={styles.loadingWrapper}>
            <LoadingDialog />
          </div>
        )}
        {applications?.length === 0 && (
          <div className={styles.noApp}>
            <h1>No application found</h1>
            <p>Create a new application to start</p>
          </div>
        )}
        <div className={styles.appList}>
          {applications?.map((app) => (
            <AppBlock
              key={app.app_id}
              application={app}
              expanded={selectedApplication == null}
              isSelected={selectedAppId === app.app_id}
              selectApplication={(appId) => handleSelectApplication(appId)}
            />
          ))}
        </div>
      </div>
      <motion.div
        animate={{ width: `${isRightOpen ? "340px" : "0px"}` }}
        className={styles.right}
      >
        {isRightOpen && selectedApplication && (
          <div className={styles.detail}>
            <img
              className={styles.detailImage}
              src={selectedApplication.image_url}
              alt="app"
            />
            <div className={styles.detailTitle}>
              {selectedApplication.app_displayname}
            </div>
            <div className={styles.infoBlock}>
              <h3>Application Name</h3>
              <p>{selectedApplication.app_name}</p>
            </div>
            <div className={styles.infoBlock}>
              <h3>Application ID</h3>
              <p>{selectedApplication.app_id}</p>
            </div>
            <div className={styles.infoBlock}>
              <h3>Latest Version</h3>
              <p>{selectedApplication.active_version}</p>
            </div>
            <div className={styles.infoBlock}>
              <h3>Date created</h3>
              <p>
                {new Date(selectedApplication?.created_at).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
            <div>
              <div className={styles.detailSubtitle}>
                {collaborators?.length ?? 0} Collaborators
              </div>
              <div className={styles.collaborators}>
                <div className={styles.collaboratorList}>
                  {collaborators && (
                    <UserPile users={collaborators} onClick={() => {}} />
                  )}
                </div>
              </div>
            </div>
            <PrimaryButton
              onClick={() => {
                openDeleteModal();
              }}
              text="Delete"
            />
          </div>
        )}
      </motion.div>
      {renderDeleteModal(
        <SimpleDialog
          text="Delete this application?"
          subText="This action cannot be undone."
          rightText="Delete"
          onClickLeft={closeDeleteModal}
          onClickRight={() =>
            handleDeleteApplication(selectedApplication?.id ?? "")
          }
        />
      )}
      {renderCreateModal(<AppCreatorScreen close={handleCloseCreateModal} />)}
    </div>
  );
}
