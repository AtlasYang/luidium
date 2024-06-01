"use client";

import Image from "next/image";
import styles from "./Forge.module.css";
import blockIcon from "@/asset/images/custom_icon/block.svg";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getApplication,
  getApplicationIdByAppName,
} from "@/service/application/api";
import useModal from "@/lib/hook/useModal";
import BlockCreatorScreen from "./block/BlockCreatorScreen";
import {
  Block,
  BLOCK_STATUS_BUILDING,
  BLOCK_STATUS_PENDING,
} from "@/service/block/interface";
import {
  buildAndRunBlock,
  deleteBlock,
  getBlocksByApplicationIdAndVersion,
} from "@/service/block/api";
import toast from "react-hot-toast";
import { listFiles } from "@/service/file/api";
import BlockCard from "./block/BlockCard";
import { Application } from "@/service/application/interface";
import PrimaryButton from "@/app/components/button/PrimaryButton";
import LoadingDialog from "@/app/components/dialog/LoadingDialog";
import { useRouter } from "next/router";
import BlockBrowser from "./blockBrowser/BlockBrowser";
import LuidiumLoader from "@/app/components/loader/LuidiumLoader";

export default function Forge() {
  const appName = usePathname().split("/")[2];

  const [applicationData, setApplicationData] = useState<Application | null>(
    null
  );
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    renderModal: renderCreateModal,
    openModal: openCreateModal,
    closeModal: closeCreateModal,
  } = useModal();
  const {
    openModal: openLoadingModal,
    closeModal: closeLoadingModal,
    renderModal: renderLoadingModal,
  } = useModal();

  const {
    openModal: openBrowserModal,
    closeModal: closeBrowserModal,
    renderModal: renderBrowserModal,
  } = useModal();

  const handleSelectBlock = useCallback(
    (block: Block) => {
      setSelectedBlock(block);
      if (
        block.status === BLOCK_STATUS_PENDING ||
        block.status === BLOCK_STATUS_BUILDING
      ) {
        toast.error("Block is currently building. Please wait for a moment.");
        return;
      }
      openLoadingModal();
      const timeout = setTimeout(() => {
        openBrowserModal();
        closeLoadingModal();
      }, 1400);
      return () => clearTimeout(timeout);
    },
    [openBrowserModal, openLoadingModal, closeLoadingModal]
  );

  const getApplicationInfo = useCallback(async () => {
    const { content: applicationId } = await getApplicationIdByAppName(appName);
    const applicationInfo = await getApplication(applicationId);
    setApplicationData(applicationInfo);
    return applicationInfo;
  }, [appName]);

  const handleGetBlocks = useCallback(async () => {
    const applicationInfo = await getApplicationInfo();
    const blocks = await getBlocksByApplicationIdAndVersion({
      applicationId: applicationInfo.id,
      version: applicationInfo.active_version,
    });
    setBlocks(blocks);
  }, [getApplicationInfo]);

  const handleRefreshBlocks = useCallback(async () => {
    setIsRefreshing(true);
    await handleGetBlocks();
    setIsRefreshing(false);
  }, [handleGetBlocks]);

  const handleCloseBrowserModal = useCallback(() => {
    closeBrowserModal();
    handleGetBlocks();
  }, [handleGetBlocks, closeBrowserModal]);

  useEffect(() => {
    getApplicationInfo();
    handleGetBlocks();

    const timer = setInterval(handleGetBlocks, 2000);
    return () => clearInterval(timer);
  }, []);

  // test code
  const buildAllBlocks = async () => {
    const applicationInfo = await getApplicationInfo();
    const blocks = await getBlocksByApplicationIdAndVersion({
      applicationId: applicationInfo.id,
      version: applicationInfo.active_version,
    });
    for (const block of blocks) {
      await buildAndRunBlock({
        blockId: block.id,
      });
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.blockCreator} onClick={openCreateModal}>
          <Image src={blockIcon} alt="blockIcon" width={32} />
          <h3>Create new block</h3>
          <p>Deploy Database, Server, Web application</p>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>
          <p>
            Version: <span>{applicationData?.active_version ?? "0.0.0"}</span>
          </p>
          {/* <PrimaryButton onClick={buildAllBlocks} text="Build All Blocks" /> */}
          {/* {isRefreshing ? (
            <LuidiumLoader size={20} />
          ) : (
            <PrimaryButton onClick={handleRefreshBlocks} text="Refresh" />
          )} */}
        </div>
        <div className={styles.blockList}>
          {!blocks && (
            <div className={styles.loadingWrapper}>
              <LoadingDialog />
            </div>
          )}
          {blocks?.map((block) => (
            <div
              className={styles.block}
              key={block.id}
              onClick={() => handleSelectBlock(block)}
            >
              <BlockCard data={block} />
            </div>
          ))}
        </div>
      </div>
      {selectedBlock &&
        renderBrowserModal(
          <BlockBrowser close={handleCloseBrowserModal} data={selectedBlock} />
        )}
      {renderCreateModal(
        <BlockCreatorScreen
          close={closeCreateModal}
          updateBlockList={handleGetBlocks}
          appName={appName}
        />
      )}
      {renderLoadingModal(<LoadingDialog text="Opening Browser ..." />)}
    </div>
  );
}
