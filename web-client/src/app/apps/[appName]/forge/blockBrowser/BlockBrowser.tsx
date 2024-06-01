"use client";

import AnimatedModalWrapper from "@/app/components/modal/AnimatedModalWrapper";
import styles from "./BlockBrowser.module.css";
import {
  Block,
  BLOCK_STATUS_RUNNING,
  BLOCK_TYPE_DATABASE,
  BLOCK_TYPE_SERVER,
  BLOCK_TYPE_WEB,
} from "@/service/block/interface";
import useModal from "@/lib/hook/useModal";
import CloseButton from "@/app/components/button/CloseButton";
import SimpleDialog from "@/app/components/dialog/SimpleDialog";
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  clearFolder,
  listFiles,
  readFile,
  readLuidiumConfig,
  uploadLuidiumConfig,
} from "@/service/file/api";
import { getApplication } from "@/service/application/api";
import {
  buildAndRunBlock,
  buildBlock,
  createVolume,
  deleteBlock,
  runBlock,
  stopBlock,
} from "@/service/block/api";
import { uploadFile } from "@/service/storage/api";
import toast from "react-hot-toast";
import PrimaryButton from "@/app/components/button/PrimaryButton";
import { LuidiumConfig } from "@/service/file/interface";
import { usePathname } from "next/navigation";
import { convertPathsToItems } from "@/utils/fileTree";
import "react-complex-tree/lib/style-modern.css";
import "highlight.js/styles/default.css";
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import LoadingDialog from "@/app/components/dialog/LoadingDialog";
import hljs from "highlight.js/lib/common";
import { successToast } from "@/utils/toasts";
import { statusIcons } from "../block/BlockCard";
import DocumentDownloadIcon from "@/asset/Icons/DocumentDownloadIcon";
import JSZip from "jszip";
import DeleteIcon from "@/asset/Icons/DeleteIcon";
import { instantDelay } from "@/utils/instantDelay";
import { Log } from "@/service/sentinel/interface";
import { getBlockLogs } from "@/service/sentinel/api";
import { timestampToNumber } from "@/utils/times";
import buildIcon from "@/asset/images/custom_icon/build.svg";
import runIcon from "@/asset/images/custom_icon/run.svg";
import buildAndRunIcon from "@/asset/images/custom_icon/build_and_run.svg";
import stopIcon from "@/asset/images/custom_icon/stop.svg";
import Image from "next/image";
import CopyIcon from "@/asset/Icons/CopyIcon";

const getRandomInt = () => Math.round(Math.random() * 10000).toString();

const BrowserTabs: { name: string; component: ReactNode }[] = [
  {
    name: "Overview",
    component: <h1>Overview</h1>,
  },
  {
    name: "Files",
    component: <h1>Files</h1>,
  },
  {
    name: "Settings",
    component: <h1>Settings</h1>,
  },
  {
    name: "Logs",
    component: <h1>Logs</h1>,
  },
];

export default function BlockBrowser({
  close,
  data,
}: {
  close: () => void;
  data: Block;
}) {
  const appName = usePathname().split("/")[2];
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
  const {
    openModal: openVolumeMountModal,
    closeModal: closeVolumeMountModal,
    renderModal: renderVolumeMountModal,
  } = useModal();
  const {
    openModal: openEnvVarModal,
    closeModal: closeEnvVarModal,
    renderModal: renderEnvVarModal,
  } = useModal();

  const [fileItems, setFileItems] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [volumeMountPath, setVolumeMountPath] = useState<string>("/data");
  const [envVarKey, setEnvVarKey] = useState<string>("");
  const [envVarValue, setEnvVarValue] = useState<string>("");
  const [loadingText, setLoadingText] = useState<string>("Loading ...");
  const [fileBrowserKey, setFileBrowserKey] = useState<string>(getRandomInt());
  const [luidiumConfig, setLuidiumConfig] = useState<LuidiumConfig | null>(
    null
  );
  const [logs, setLogs] = useState<Log[] | null>(null);

  const getApplicationInfo = useCallback(async () => {
    return await getApplication(data.application_id);
  }, [data]);

  const handleGetBlockLuidiumConfig = useCallback(async () => {
    const config = await readLuidiumConfig({
      bucketName: appName,
      version: data.version,
      blockName: data.name,
    });
    setLuidiumConfig(config);
    return config;
  }, []);

  const handleGetLogs = useCallback(async () => {
    const logs = await getBlockLogs({
      blockId: data.id,
    });
    logs.sort(
      (a, b) => timestampToNumber(b.timestamp) - timestampToNumber(a.timestamp)
    );
    setLogs(logs);
  }, [data]);

  const handleGetBlockFiles = useCallback(async () => {
    const applicationInfo = await getApplicationInfo();
    const fileList = await listFiles({
      bucketName: applicationInfo.app_name,
      path: `${data.version}/${data.name}`,
    });
    const config = await handleGetBlockLuidiumConfig();
    const ignoreFiles = config.ignore_files.concat(["luidium-config.json"]);
    const filteredFiles = fileList.filter(
      (file) => !ignoreFiles.includes(file.file_name)
    );
    const fileItems = convertPathsToItems(
      filteredFiles.map((file) => file.file_name)
    );
    setFileItems(fileItems);
    setFileBrowserKey(getRandomInt());
  }, [getApplicationInfo, data, handleGetBlockLuidiumConfig]);

  const handleClearFolder = useCallback(async () => {
    await clearFolder({
      bucketName: appName,
      version: data.version,
      blockName: data.name,
    });
    handleGetBlockFiles();
    setFileText("");
    successToast("Folder cleared successfully");
  }, [appName, data, handleGetBlockFiles]);

  const handleDeleteBlock = useCallback(async () => {
    setLoadingText("Deleting block ...");
    openLoadingModal();
    try {
      await deleteBlock(data.id);
    } finally {
      closeLoadingModal();
      close();
      successToast("Block deleted successfully");
    }
  }, [data, openLoadingModal, closeLoadingModal, close]);

  const handleUploadFiles = useCallback(
    async (e: any) => {
      setLoadingText("Uploading files ...");
      openLoadingModal();
      const files = e.target.files as FileList;
      const applicationInfo = await getApplicationInfo();
      const bucketName = applicationInfo.app_name;
      const path = `${data.version}/${data.name}`;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile({
          file,
          bucketName,
          path: `${path}/${file.webkitRelativePath
            .split("/")
            .slice(1)
            .join("/")}`,
        });
      }
      const timeout = setTimeout(() => {
        handleGetBlockFiles();
        closeLoadingModal();
        toast.success("Files uploaded successfully");
      }, 1400);
      return () => clearTimeout(timeout);
    },
    [
      getApplicationInfo,
      data,
      handleGetBlockFiles,
      openLoadingModal,
      closeLoadingModal,
    ]
  );

  const handleReadFile = useCallback(
    async (filePath: string) => {
      const applicationInfo = await getApplicationInfo();
      let { content } = await readFile({
        bucketName: applicationInfo.app_name,
        path: filePath,
      });
      if (content.length > 100000) {
        content = "File too large to display";
        setFileText(content);
        return toast.error("File too large to display");
      }
      setFileText(content);
    },
    [getApplicationInfo]
  );

  const downloadAllFileAsZip = useCallback(async () => {
    const path = `${data.version}/${data.name}`;
    const files = await listFiles({
      bucketName: appName,
      path,
    });
    const zip = new JSZip();
    files.forEach(async (file) => {
      const { content: fileContent } = await readFile({
        bucketName: appName,
        path: `${path}/${file.file_name}`,
      });
      console.log(fileContent);
      zip.file(file.file_name, fileContent);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(content);
    element.download = `${data.name}.zip`;
    document.body.appendChild(element);
    element.click();
  }, [appName, data]);

  const handleCreateVolume = useCallback(
    async (mountedPath: string) => {
      setLoadingText("Changing volume mount ...");
      openLoadingModal();
      const { content: volumeName } = await createVolume({
        bucket: appName,
        version: data.version,
        block_name: data.name,
      });
      const volumeBinding = `${volumeName}:${mountedPath}`;
      const config = await handleGetBlockLuidiumConfig();
      await uploadLuidiumConfig({
        bucketName: appName,
        version: data.version,
        blockName: data.name,
        conf: {
          ...config,
          volume_binding: volumeBinding,
        },
      });
      await instantDelay(1.4);
      closeLoadingModal();
      handleGetBlockLuidiumConfig();
      toast.success("Volume created successfully");
    },
    [
      appName,
      data,
      handleGetBlockLuidiumConfig,
      openLoadingModal,
      closeLoadingModal,
    ]
  );

  const handleCreateEnvVar = useCallback(async () => {
    setLoadingText("Adding environment variable ...");
    openLoadingModal();
    const config = await handleGetBlockLuidiumConfig();
    const envVarBinding = `${envVarKey}=${envVarValue}`;
    await uploadLuidiumConfig({
      bucketName: appName,
      version: data.version,
      blockName: data.name,
      conf: {
        ...config,
        environment_variables: [...config.environment_variables, envVarBinding],
      },
    });
    await instantDelay(1.4);
    await handleGetBlockLuidiumConfig();
    closeLoadingModal();
    toast.success("Environment variable added successfully");
  }, [
    appName,
    data,
    envVarKey,
    envVarValue,
    handleGetBlockLuidiumConfig,
    openLoadingModal,
    closeLoadingModal,
  ]);

  const handleRemoveEnvVar = useCallback(
    async (envVarKey: string) => {
      setLoadingText("Removing environment variable ...");
      openLoadingModal();
      const config = await handleGetBlockLuidiumConfig();
      const envVarBinding = config.environment_variables.filter(
        (binding: string) => binding.split("=")[0] !== envVarKey
      );
      await uploadLuidiumConfig({
        bucketName: appName,
        version: data.version,
        blockName: data.name,
        conf: {
          ...config,
          environment_variables: envVarBinding,
        },
      });
      await instantDelay(1.4);
      await handleGetBlockLuidiumConfig();
      closeLoadingModal();
      toast.success("Environment variable removed successfully");
    },
    [
      appName,
      data,
      handleGetBlockLuidiumConfig,
      openLoadingModal,
      closeLoadingModal,
    ]
  );

  const getDeployedUrl = useCallback((subdomain: string) => {
    return `https://${subdomain}.luidium.com`;
  }, []);

  useEffect(() => {
    handleGetBlockFiles();
    handleGetBlockLuidiumConfig();
    handleGetLogs();
  }, []);

  return (
    <AnimatedModalWrapper className={styles.container}>
      <div className={styles.body}>
        <div className={styles.tabWrapper}>
          <div className={styles.tabs}>
            {BrowserTabs.map((tab, index) => (
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
            {activeTab === 0 && (
              <>
                <div className={styles.bodyHeader}>
                  <h1>
                    {data.name}
                    <span>{data.description}</span>
                  </h1>
                  <div className={styles.buttons}>
                    <button
                      onClick={async () => {
                        setLoadingText("Sending deployment request...");
                        openLoadingModal();
                        await buildAndRunBlock({
                          blockId: data.id,
                        });
                        closeLoadingModal();
                        close();
                      }}
                      className={styles.iconButton}
                    >
                      <p>Deploy</p>
                      <Image
                        src={buildAndRunIcon}
                        alt="build and run"
                        width={20}
                        height={20}
                      />
                    </button>
                    <button
                      onClick={async () => {
                        setLoadingText("Sending run request...");
                        openLoadingModal();
                        await runBlock({
                          blockId: data.id,
                        });
                        closeLoadingModal();
                        close();
                      }}
                      className={styles.iconButton}
                    >
                      <p>Run</p>
                      <Image src={runIcon} alt="run" width={20} height={20} />
                    </button>
                    <button
                      onClick={async () => {
                        setLoadingText("Sending build request...");
                        openLoadingModal();
                        await buildBlock({
                          blockId: data.id,
                        });
                        closeLoadingModal();
                        close();
                      }}
                      className={styles.iconButton}
                    >
                      <p>Build</p>
                      <Image
                        src={buildIcon}
                        alt="build"
                        width={20}
                        height={20}
                      />
                    </button>
                    <button
                      disabled={data.status === "stopped"}
                      onClick={async () => {
                        setLoadingText("Sending stop request...");
                        openLoadingModal();
                        await stopBlock({
                          blockId: data.id,
                        });
                        closeLoadingModal();
                        close();
                      }}
                      className={styles.iconButton}
                    >
                      <p>Stop</p>
                      <Image src={stopIcon} alt="stop" width={20} height={20} />
                    </button>
                  </div>
                </div>
                <div className={styles.info}>
                  <p>
                    URL:{" "}
                    <a
                      href={getDeployedUrl(data.external_subdomain)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {getDeployedUrl(data.external_subdomain)}
                    </a>
                  </p>
                  <p>
                    Status: {data.status}
                    <span className={styles.statusIcon}>
                      {statusIcons
                        .find((icon) => icon.label === data.status)
                        ?.icon(16)}
                    </span>
                  </p>
                  {data.status === BLOCK_STATUS_RUNNING && (
                    <iframe
                      src={getDeployedUrl(data.external_subdomain)}
                      title="Deployed Block"
                      className={styles.iframe}
                    />
                  )}
                </div>
              </>
            )}
            {activeTab === 1 && (
              <>
                <div className={styles.bodyHeader}>
                  <h1>Files</h1>
                  <input
                    type="file"
                    id="FolderPath"
                    style={{ display: "none" }}
                    {...{ webkitdirectory: "" }}
                    onChange={handleUploadFiles}
                  />
                  <div className={styles.buttons}>
                    <label htmlFor="FolderPath">
                      <div className={styles.textButton}>
                        <p>Upload Files</p>
                      </div>
                    </label>
                    <button
                      className={styles.warnButton}
                      onClick={handleClearFolder}
                    >
                      <p>Clear Folder</p>
                    </button>
                  </div>
                </div>
                <div className={styles.fileBrowser}>
                  {fileItems && fileItems.root.children.length === 0 && (
                    <div className={styles.noFile}>
                      <p>No files found</p>
                    </div>
                  )}
                  <div
                    key={`file-browser-${fileBrowserKey}`}
                    className={styles.fileTree}
                  >
                    {fileItems && (
                      <UncontrolledTreeEnvironment
                        dataProvider={
                          new StaticTreeDataProvider(
                            fileItems,
                            (item, data) => ({
                              ...item,
                              data,
                            })
                          )
                        }
                        getItemTitle={(item) => item.data}
                        viewState={{}}
                        onSelectItems={(items) => {
                          const item = items[0].toString();
                          setSelectedFile(item);
                          const path = `${data.version}/${data.name}/${item}`;
                          handleReadFile(path);
                        }}
                      >
                        <Tree
                          treeId="tree-1"
                          rootItem="root"
                          treeLabel="Tree Example"
                        />
                      </UncontrolledTreeEnvironment>
                    )}
                  </div>
                  <div className={styles.fileText}>
                    <pre
                      dangerouslySetInnerHTML={{
                        __html: hljs.highlightAuto(fileText).value,
                      }}
                    />
                    <button
                      disabled={!fileText}
                      className={styles.downloadButton}
                      onClick={() => {
                        if (!fileText) {
                          return;
                        }
                        const element = document.createElement("a");
                        const file = new Blob([fileText], {
                          type: "text/plain",
                        });
                        element.href = URL.createObjectURL(file);
                        element.download = selectedFile?.split("/").pop() ?? "";
                        document.body.appendChild(element);
                        element.click();
                      }}
                    >
                      <DocumentDownloadIcon size={20} color="gray" />
                    </button>
                  </div>
                </div>
              </>
            )}
            {activeTab === 2 && (
              <>
                <div className={styles.section}>
                  <h1>Volume</h1>
                  {luidiumConfig?.volume_binding === "" ? (
                    <p>No volume mounted</p>
                  ) : (
                    <>
                      <p>
                        Mounted path:{" "}
                        <span>
                          {luidiumConfig?.volume_binding.split(":")[1]}
                        </span>
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => {
                      openVolumeMountModal();
                    }}
                    className={styles.textButton}
                  >
                    <p>
                      {luidiumConfig?.volume_binding === ""
                        ? "Mount Volume"
                        : "Change Volume Mount"}
                    </p>
                  </button>
                </div>
                <div className={styles.section}>
                  <h1>Environment Variables</h1>
                  <div className={styles.envVars}>
                    {luidiumConfig?.environment_variables
                      .map((envVarBinding: string) => {
                        return {
                          key: envVarBinding.split("=")[0],
                          value: envVarBinding.split("=")[1],
                        };
                      })
                      .map((envVar) => (
                        <div key={envVar.key} className={styles.envVar}>
                          <p>{envVar.key}</p>
                          <p>{envVar.value}</p>
                          <button
                            onClick={() => {
                              handleRemoveEnvVar(envVar.key);
                            }}
                            className={styles.deleteButton}
                          >
                            <DeleteIcon size={24} color="red" />
                          </button>
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => {
                      openEnvVarModal();
                    }}
                    className={styles.textButton}
                  >
                    <p>Add Environment Variable</p>
                  </button>
                </div>
                <div className={styles.section}>
                  <h1>CLI</h1>
                  <div className={styles.codeBlock}>
                    <code>
                      {`luidium init ${appName}/${data.version}/${data.name}`}
                    </code>
                    <button
                      className={styles.copyButton}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `luidium init ${appName}/${data.version}/${data.name}`
                        );
                        successToast("Copied to clipboard");
                      }}
                    >
                      <CopyIcon size={16} color="#343434" />
                    </button>
                  </div>
                </div>
                <div className={styles.section}>
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this block?")
                      ) {
                        handleDeleteBlock();
                      }
                    }}
                    className={styles.warnButton}
                  >
                    <p>Delete Block</p>
                  </button>
                </div>
              </>
            )}
            {activeTab === 3 && (
              <div className={styles.section}>
                <h1>Logs</h1>
                <div className={styles.logContainer}>
                  {!logs && (
                    <pre style={{ color: "#FFF" }}>Fetching Logs...</pre>
                  )}
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
            )}
          </div>
        </div>
      </div>
      <div className={styles.closeButton}>
        <CloseButton size={20} color="red" onClick={openCloseModal} />
      </div>
      {renderVolumeMountModal(
        <AnimatedModalWrapper className={styles.inputModal}>
          <h1>Mount Volume</h1>
          <input
            type="text"
            value={volumeMountPath}
            onChange={(e) => setVolumeMountPath(e.target.value)}
          />
          <div className={styles.buttons}>
            <button
              onClick={async () => {
                await handleCreateVolume(volumeMountPath);
                await handleGetBlockLuidiumConfig();
                closeVolumeMountModal();
              }}
              className={styles.textButton}
            >
              <p>Mount Volume</p>
            </button>
            <button
              onClick={closeVolumeMountModal}
              className={styles.warnButton}
            >
              <p>Cancel</p>
            </button>
          </div>
        </AnimatedModalWrapper>
      )}
      {renderEnvVarModal(
        <AnimatedModalWrapper className={styles.inputModal}>
          <h1>Add Environment Variable</h1>
          <input
            type="text"
            placeholder="Key"
            value={envVarKey}
            onChange={(e) => setEnvVarKey(e.target.value)}
          />
          <input
            type="text"
            placeholder="Value"
            value={envVarValue}
            onChange={(e) => setEnvVarValue(e.target.value)}
          />
          <div className={styles.buttons}>
            <button
              onClick={async () => {
                openLoadingModal();
                await handleCreateEnvVar();
                await handleGetBlockLuidiumConfig();
                setEnvVarKey("");
                setEnvVarValue("");
                closeLoadingModal();
                closeEnvVarModal();
              }}
              className={styles.textButton}
            >
              <p>Add Environment Variable</p>
            </button>
            <button onClick={closeEnvVarModal} className={styles.warnButton}>
              <p>Cancel</p>
            </button>
          </div>
        </AnimatedModalWrapper>
      )}
      {renderCloseModal(
        <SimpleDialog
          text="Are you sure you want to close?"
          subText="Any unsaved changes will be lost."
          rightText="Close"
          onClickLeft={closeCloseModal}
          onClickRight={() => {
            closeCloseModal();
            close();
          }}
        />
      )}
      {renderLoadingModal(<LoadingDialog text={loadingText} />)}
    </AnimatedModalWrapper>
  );
}
