"use client";

import { useCallback, useState } from "react";
import styles from "./AppCreatorScreen.module.css";
import AnimatedModalWrapper from "@/app/components/modal/AnimatedModalWrapper";
import {
  Application,
  getApplicationForCreate,
} from "@/service/application/interface";
import {
  addApplicationVersion,
  checkAppNameDuplication,
  createApplication,
  updateApplicationActiveVersion,
} from "@/service/application/api";
import { errorToast } from "@/utils/toasts";
import CheckCircleIcon from "@/asset/Icons/CheckCircleIcon";
import TimesCircleIcon from "@/asset/Icons/TimesCircleIcon";
import CloseButton from "@/app/components/button/CloseButton";
import useModal from "@/lib/hook/useModal";
import SimpleDialog from "@/app/components/dialog/SimpleDialog";
import GridLoaderIcon from "@/asset/Icons/GridLoaderIcon";
import CameraIcon from "@/asset/Icons/CameraIcon";
import Image from "next/image";
import LoadingDialog from "@/app/components/dialog/LoadingDialog";
import { uploadFileAndGetUrl } from "@/utils/fileUploader";
import { validate } from "@/service/auth/auth-api";

export default function AppCreatorScreen({ close }: { close: () => void }) {
  const [appDisplayName, setAppDisplayName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [imageURLAlt, setImageURLAlt] = useState("");
  const [isAppNameAvailable, setIsAppNameAvailable] = useState(false);
  const [isAppNameAvailablePending, setIsAppNameAvailablePending] =
    useState(false);
  const {
    openModal: openCloseModal,
    closeModal: closeCloseModal,
    renderModal: renderCloseModal,
  } = useModal();

  const {
    openModal: openLoadingModal,
    closeModal: closeLoadingModal,
    renderModal: renderLoadingModal,
  } = useModal();

  const getUserId = useCallback(async () => {
    const res = await validate();
    return res.content;
  }, []);

  const generateRandom6String = useCallback(() => {
    const length = 6;
    const randomCode = crypto.getRandomValues(new Uint32Array(1))[0];
    return randomCode.toString(36).substring(0, length);
  }, []);

  const generateAppNameFromDisplayName = useCallback((displayName: string) => {
    return displayName
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 20)
      .toLowerCase();
  }, []);

  const generateAppIdFromDisplayName = useCallback(
    (displayName: string) => {
      return `${generateAppNameFromDisplayName(
        displayName
      )}-${generateRandom6String()}`;
    },
    [generateAppNameFromDisplayName, generateRandom6String]
  );

  const checkAppNameAvailability = useCallback(
    async (displayName: string) => {
      if (!displayName) {
        setIsAppNameAvailable(false);
        return;
      }
      setIsAppNameAvailablePending(true);
      const res = await checkAppNameDuplication(
        generateAppNameFromDisplayName(displayName)
      );
      setIsAppNameAvailablePending(false);
      setIsAppNameAvailable(!res.success);
    },
    [generateAppNameFromDisplayName]
  );

  const handleUploadImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const imageURLObj = URL.createObjectURL(file!);
      setImageURLAlt(imageURLObj);
      if (!file) {
        return;
      }
      const url = await uploadFileAndGetUrl(file);
      setImageURL(url);
    },
    []
  );

  const handleCreateApplication = useCallback(async () => {
    if (!appDisplayName || !appDescription || !imageURL) {
      errorToast("Please fill in all fields");
      return;
    }
    if (!isAppNameAvailable) {
      errorToast("App name is not available");
      return;
    }
    openLoadingModal();
    const appId = generateAppIdFromDisplayName(appDisplayName);
    const appName = generateAppNameFromDisplayName(appDisplayName);
    const payload: Application = getApplicationForCreate({
      app_displayname: appDisplayName,
      app_id: appId,
      app_name: appName,
      description: appDescription,
      image_url: imageURL,
    });
    const { isSuccess, applicationId } = await createApplication({
      applicationData: payload,
    });
    closeLoadingModal();
    close();
  }, [
    generateAppIdFromDisplayName,
    generateAppNameFromDisplayName,
    appDisplayName,
    appDescription,
    imageURL,
    isAppNameAvailable,
    close,
    openLoadingModal,
    closeLoadingModal,
  ]);

  return (
    <AnimatedModalWrapper className={styles.container}>
      <h1>Create a new application</h1>
      <input
        className={styles.input}
        type="text"
        placeholder="Application Name"
        value={appDisplayName}
        minLength={3}
        maxLength={30}
        onChange={(e) => {
          checkAppNameAvailability(e.target.value);
          setAppDisplayName(e.target.value);
        }}
      />
      <div className={styles.appNameSection}>
        <div className={styles.appInfoSection}>
          {/* <p>
            Application ID:{" "}
            <span>
              {appDisplayName
                ? generateAppIdFromDisplayName(appDisplayName)
                : ""}
            </span>
          </p> */}
          <p>
            Application Unique Name:{" "}
            <span>
              {appDisplayName
                ? generateAppNameFromDisplayName(appDisplayName)
                : ""}
            </span>
            <p className={styles.info}>
              {`This name is used for the URL of your application.
            It cannot be changed after creation, and must be unique.`}
            </p>
          </p>
        </div>
        <div className={styles.appNameStatus}>
          {isAppNameAvailablePending ? (
            // <GridLoaderIcon size={20} color="blue" />
            <></>
          ) : isAppNameAvailable ? (
            <CheckCircleIcon color="#00FF00" size={20} />
          ) : (
            <TimesCircleIcon color="#FF0000" size={20} />
          )}
        </div>
      </div>
      <textarea
        placeholder="Description"
        rows={5}
        value={appDescription}
        onChange={(e) => setAppDescription(e.target.value)}
      />
      <div className={styles.imageSection}>
        <div className={styles.appImageSection}>
          <label htmlFor="app-image">
            {imageURL ? (
              <img
                src={imageURLAlt}
                alt="App Image"
                style={{
                  borderRadius: "5px",
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div className={styles.imageUploadButton}>
                <CameraIcon size={36} color="white" />
              </div>
            )}
          </label>
          <input
            type="file"
            id="app-image"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleUploadImage}
            style={{
              display: "none",
            }}
          />
        </div>
        <p>
          Upload an image for your application.
          <br />
          Recommend size: 1:1 ratio, below 1MB
          <br />
          Supported formats: .jpg, .jpeg, .png, .webp
        </p>
      </div>
      <button
        className={styles.primaryButton}
        onClick={handleCreateApplication}
      >
        Create
      </button>
      <div className={styles.closeButton}>
        <CloseButton size={20} color="red" onClick={openCloseModal} />
      </div>
      {renderCloseModal(
        <SimpleDialog
          text="Are you sure you want to close?"
          subText="All unsaved changes will be lost. This action cannot be undone."
          rightText="Close"
          onClickLeft={closeCloseModal}
          onClickRight={() => {
            closeCloseModal();
            close();
          }}
        />
      )}
      {renderLoadingModal(<LoadingDialog text="Creating Application ..." />)}
    </AnimatedModalWrapper>
  );
}
