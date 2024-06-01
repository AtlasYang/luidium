import {
  Block,
  BLOCK_STATUS_BUILDING,
  BLOCK_STATUS_FAILED,
  BLOCK_STATUS_PENDING,
  BLOCK_STATUS_READY,
  BLOCK_STATUS_RUNNING,
  BLOCK_TYPE_DATABASE,
  BLOCK_TYPE_SERVER,
  BLOCK_TYPE_WEB,
} from "@/service/block/interface";
import styles from "./BlockCard.module.css";
import Image from "next/image";
import databaseImg from "@/asset/images/custom_icon/database.svg";
import serverImg from "@/asset/images/custom_icon/server.svg";
import webImg from "@/asset/images/custom_icon/web.svg";
import failedImg from "@/asset/images/custom_icon/statusFailed.png";
import readyImg from "@/asset/images/custom_icon/statusReady.png";
import runningImg from "@/asset/images/custom_icon/statusRunning.png";
import LuidiumLoader from "@/app/components/loader/LuidiumLoader";
import useModal from "@/lib/hook/useModal";
import BlockBrowser from "../blockBrowser/BlockBrowser";
import { useCallback } from "react";
import { getApplication } from "@/service/application/api";
import { listFiles } from "@/service/file/api";
import GradientLoader from "@/app/components/loader/GradientLoader";
import GradientBounceLoader from "@/app/components/loader/GradientBounceLoader";
import CopyIcon from "@/asset/Icons/CopyIcon";
import { successToast } from "@/utils/toasts";

export const blockIcons = [
  {
    label: BLOCK_TYPE_DATABASE,
    icon: (size: number) => (
      <Image src={databaseImg} alt="Database" height={size} />
    ),
  },
  {
    label: BLOCK_TYPE_SERVER,
    icon: (size: number) => (
      <Image src={serverImg} alt="Server" height={size} />
    ),
  },
  {
    label: BLOCK_TYPE_WEB,
    icon: (size: number) => <Image src={webImg} alt="Web" height={size} />,
  },
];

export const statusIcons = [
  {
    label: BLOCK_STATUS_FAILED,
    icon: (size: number) => (
      <Image src={failedImg} alt="Failed" height={size} />
    ),
  },
  {
    label: BLOCK_STATUS_PENDING,
    icon: (size: number) => <LuidiumLoader size={size} />,
  },
  {
    label: BLOCK_STATUS_BUILDING,
    icon: (size: number) => <GradientBounceLoader size={size} />,
  },
  {
    label: BLOCK_STATUS_READY,
    icon: (size: number) => <Image src={readyImg} alt="Ready" height={size} />,
  },
  {
    label: BLOCK_STATUS_RUNNING,
    icon: (size: number) => <GradientLoader size={size} />,
  },
];

export default function BlockCard({ data }: { data: Block }) {
  return (
    <div className={styles.container}>
      {blockIcons.find((icon) => icon.label === data.block_type)?.icon(20)}
      <div className={styles.info}>
        <h3>{data.name}</h3>
        <p>{data.description}</p>
      </div>
      <div className={styles.url}>
        <p
          className={`${
            data.external_subdomain.includes("-") ? "" : styles.prime
          }`}
        >{`https://${data.external_subdomain}.luidium.com`}</p>
        <button
          className={styles.copyButton}
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(
              `https://${data.external_subdomain}.luidium.com`
            );
            successToast("Copied to clipboard");
          }}
        >
          <CopyIcon size={16} color="#787878" />
        </button>
      </div>
      <p className={styles.status}>status: {data.status}</p>
      <div className={styles.statusIcon}>
        {statusIcons.find((icon) => icon.label === data.status)?.icon(16)}
      </div>
    </div>
  );
}
