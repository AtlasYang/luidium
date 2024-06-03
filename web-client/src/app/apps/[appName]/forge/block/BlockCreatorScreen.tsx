import useModal from "@/lib/hook/useModal";
import styles from "./BlockCreatorScreen.module.css";
import SimpleDialog from "@/app/components/dialog/SimpleDialog";
import AnimatedModalWrapper from "@/app/components/modal/AnimatedModalWrapper";
import CloseButton from "@/app/components/button/CloseButton";
import { useCallback, useEffect, useState } from "react";
import blockImage from "@/asset/images/custom_icon/block.svg";
import {
  BLOCK_TYPE_DATABASE,
  BLOCK_TYPE_SERVER,
  BLOCK_TYPE_WEB,
  getBlockForCreate,
} from "@/service/block/interface";
import Image from "next/image";
import {
  getApplication,
  getApplicationIdByAppName,
} from "@/service/application/api";
import { buildAndRunBlock, createBlock, getBlock } from "@/service/block/api";
import { LuidiumConfig } from "@/service/file/interface";
import { copyTemplate, uploadLuidiumConfig } from "@/service/file/api";
import LoadingDialog from "@/app/components/dialog/LoadingDialog";
import { errorToast } from "@/utils/toasts";

import databaseImg from "@/asset/images/custom_icon/database.svg";
import serverImg from "@/asset/images/custom_icon/server.svg";
import webImg from "@/asset/images/custom_icon/web.svg";

import fastapiImage from "@/asset/logos/fastapi.svg";
import aiohttpImage from "@/asset/logos/aiohttp.svg";
import flaskImage from "@/asset/logos/flask.png";
import ginImage from "@/asset/logos/gin.png";
import nestImage from "@/asset/logos/nestjs.png";
import rustImage from "@/asset/logos/rust.png";

import nextImage from "@/asset/logos/nextjs.png";
import reactImage from "@/asset/logos/react.png";
import sveltekitImage from "@/asset/logos/svelte.png";
import leptosImage from "@/asset/logos/leptos.svg";

import postgresqlImage from "@/asset/logos/postgresql.png";
import neo4jImage from "@/asset/logos/neo4j.png";
import scylladbImage from "@/asset/logos/scylladb.png";
import cassandraImage from "@/asset/logos/cassandra.png";
import mongodbImage from "@/asset/logos/mongodb.png";
import milvusImage from "@/asset/logos/milvus.png";

const blockTypes = [
  {
    type: BLOCK_TYPE_SERVER,
    title: "Server",
    description: "Web server, API server, etc.",
    icon: <Image src={serverImg} alt="blockIcon" width={32} />,
  },
  {
    type: BLOCK_TYPE_DATABASE,
    title: "Database",
    description: "A single database instance.",
    icon: <Image src={databaseImg} alt="blockIcon" width={32} />,
  },
  {
    type: BLOCK_TYPE_WEB,
    title: "Web",
    description: "A frontend web application.",
    icon: <Image src={webImg} alt="blockIcon" width={32} />,
  },
];

const BLOCK_FRAMEWORKS: { [key: string]: any[] } = {
  [BLOCK_TYPE_SERVER]: [
    {
      id: "gin-server",
      title: "Gin",
      content:
        "HTTP web framework written in Go (Golang). Fast, Extendable and Crash-Free",
      image: ginImage,
      defaultPort: 8080,
    },
    {
      id: "nest-server",
      title: "NestJS",
      content:
        "A progressive Node.js framework for building efficient, reliable and scalable server-side applications.",
      image: nestImage,
      defaultPort: 8080,
    },
    {
      id: "axum-server",
      title: "Axum",
      content:
        "Ergonomic and modular web framework built with Tokio, Tower, and Hyper.",
      image: rustImage,
      defaultPort: 8080,
    },
    {
      id: "fastapi-server",
      title: "FastAPI",
      content:
        "Modern, fast (high-performance), web framework for building APIs with Python 3.6+ based on standard Python type hints.",
      image: fastapiImage,
      defaultPort: 8080,
    },
    {
      id: "aiohttp-server",
      title: "AIOHTTP",
      content:
        "Asynchronous HTTP client/server framework for asyncio and Python. Supports both server and client side of HTTP protocol.",
      image: aiohttpImage,
      defaultPort: 8080,
    },
    {
      id: "flask-server",
      title: "Flask",
      content:
        "A lightweight WSGI web application framework written in Python.",
      image: flaskImage,
      defaultPort: 8080,
    },
  ],
  [BLOCK_TYPE_DATABASE]: [
    {
      id: "postgresql-db",
      title: "PostgreSQL",
      content: "The World's Most Advanced Open Source Relational Database.",
      image: postgresqlImage,
      defaultPort: 5432,
    },
    {
      id: "scylladb-db",
      title: "ScyllaDB",
      content:
        "The real-time big data database. Monstrously fast, scalable. Compatible with Apache Cassandra.",
      image: scylladbImage,
      defaultPort: 9042,
    },
    {
      id: "cassandra-db",
      title: "Apache Cassandra",
      content:
        "A distributed NoSQL database that delivers continuous availability, high performance, and linear scalability",
      image: cassandraImage,
      defaultPort: 9042,
    },
    {
      id: "neo4j-db",
      title: "Neo4j",
      content:
        "A high performance graph store, with a friendly query language and ACID transactions",
      image: neo4jImage,
      defaultPort: 7687,
    },
    {
      id: "mongodb-db",
      title: "MongoDB",
      content: "Open source, non-relational DBMS that uses flexible documents",
      image: mongodbImage,
      defaultPort: 27017,
    },
    {
      id: "milvus-db",
      title: "Milvus",
      content:
        "Open-source vector database built to power embedding similarity search and AI applications.",
      image: milvusImage,
      defaultPort: 19530,
    },
  ],
  [BLOCK_TYPE_WEB]: [
    {
      id: "next-web",
      title: "Next.js",
      content:
        "The React Framework for Production. Build fullstack React apps with speed and confidence",
      image: nextImage,
      defaultPort: 3000,
    },
    {
      id: "react-web",
      title: "React",
      content:
        "A JavaScript library for building user interfaces. Declarative, efficient, and flexible",
      image: reactImage,
      defaultPort: 80,
    },
    {
      id: "svelte-web",
      title: "SvelteKit",
      content:
        "Streamlined web development framework for rapidly developing robust, performant web applications using Svelte",
      image: sveltekitImage,
      defaultPort: 3000,
    },
    {
      id: "leptos-web",
      title: "Leptos",
      content:
        "A full-stack, isomorphic Rust web framework leveraging fine-grained reactivity to build declarative user interfaces.",
      image: leptosImage,
      defaultPort: 8080,
    },
  ],
};

export default function BlockCreatorScreen({
  close,
  updateBlockList,
  appName,
}: {
  close: () => void;
  updateBlockList: () => void;
  appName: string;
}) {
  const [name, setName] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);
  const [type, setType] = useState(BLOCK_TYPE_SERVER);
  const [framework, setFramework] = useState("");
  const [description, setDescription] = useState("");
  const [isPrimeDomainAvailable, setIsPrimeDomainAvailable] = useState(false);
  const [isPrimeDomain, setIsPrimeDomain] = useState(false);
  const [port, setPort] = useState(8080);
  const [loadingText, setLoadingText] = useState("");

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

  const getApplicationInfo = useCallback(async (appName: string) => {
    const { content: applicationId } = await getApplicationIdByAppName(appName);
    const applicationInfo = await getApplication(applicationId);
    return applicationInfo;
  }, []);

  const handleCopyFromTemplate = useCallback(async () => {
    const application = await getApplicationInfo(appName);
    const payload = {
      bucketName: application.app_name,
      version: application.active_version,
      blockName: name,
      templateId: framework,
    };
    console.log(payload);
    await copyTemplate(payload);
  }, [framework, name, appName, getApplicationInfo]);

  const handleCreateBlock = useCallback(async () => {
    setLoadingText("Creating Block configuration...");
    openLoadingModal();
    const application = await getApplicationInfo(appName);
    const payload = getBlockForCreate({
      application_id: application.id,
      block_type: type,
      description,
      name,
      version: application.active_version,
      fixedSubdomain: isPrimeDomain ? application.app_name : "",
    });
    const { content: blockId, success } = await createBlock({
      blockData: payload,
    });
    if (!success) {
      closeLoadingModal();
      errorToast(blockId);
      return;
    }
    setLoadingText("Pulling code from official template...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const newBlock = await getBlock(blockId);
    const newConf: LuidiumConfig = {
      block_name: newBlock.name,
      framework: framework,
      port_binding: `${newBlock.external_port}:${+port}`,
      volume_binding: "",
      environment_variables: [],
      ignore_files: [`${newBlock.name}-image.tar`],
    };
    if (framework) await handleCopyFromTemplate();
    setLoadingText("Uploading Block configuration...");
    await uploadLuidiumConfig({
      bucketName: application.app_name,
      version: application.active_version,
      blockName: newBlock.name,
      conf: newConf,
    });
    buildAndRunBlock({ blockId: newBlock.id });
    closeLoadingModal();
    updateBlockList();
    close();
  }, [
    name,
    type,
    framework,
    description,
    port,
    appName,
    isPrimeDomain,
    close,
    getApplicationInfo,
    handleCopyFromTemplate,
    updateBlockList,
    openLoadingModal,
    closeLoadingModal,
  ]);

  useEffect(() => {
    setIsNameValid(/^[a-z0-9-]+$/.test(name));
  }, [name]);

  useEffect(() => {
    getApplicationInfo(appName).then((application) => {
      setIsPrimeDomainAvailable(!application.is_active);
    });
  }, []);

  return (
    <AnimatedModalWrapper className={styles.container}>
      <h2>Create new block</h2>
      <div className={styles.header}>
        {blockTypes.map((blockType) => (
          <div
            key={blockType.type}
            className={`${styles.blockType} ${
              blockType.type == type && styles.selected
            }`}
            onClick={() => {
              setType(blockType.type);
              setFramework("");
            }}
          >
            {blockType.icon}
            <div className={styles.info}>
              <h3>{blockType.title}</h3>
              <p>{blockType.description}</p>
            </div>
          </div>
        ))}
      </div>
      <h3>Choose Framework(Optional)</h3>
      <div className={styles.header}>
        {BLOCK_FRAMEWORKS[type].map((f) => (
          <div
            key={f.id}
            className={`${styles.blockType} ${
              f.id == framework && styles.selected
            }`}
            onClick={() => {
              if (f.id == framework) {
                setFramework("");
              } else {
                setFramework(f.id);
                setPort(f.defaultPort);
              }
            }}
          >
            <Image src={f.image} alt="frameworkIcon" width={32} />
            <div className={styles.info}>
              <h3>{f.title}</h3>
              <p>{f.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.subSection}>
            <h3>Name</h3>
            <p>
              {/* Name will appear in blueprint, domain. <br /> */}
              <small>Use only lowercase letters, numbers, and hyphens.</small>
            </p>
            {isPrimeDomainAvailable && (
              <div className={styles.checkboxWrapper}>
                <p>Assign prime subdomain</p>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={isPrimeDomain}
                  onChange={(e) => setIsPrimeDomain(e.target.checked)}
                />
                <span>
                  Application name will be directly used as subdomain. <br />
                  {/* Only one block can be prime domain in one application. */}
                </span>
              </div>
            )}
          </div>
          <input
            className={styles.input}
            type="text"
            maxLength={30}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.section}>
          <div className={styles.subSection}>
            <h3>Description</h3>
            <p>Describe stack, purpose, etc</p>
          </div>
          <textarea
            placeholder="Description"
            rows={1}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={100}
          />
        </div>
        <div className={styles.section}>
          <div className={styles.subSection}>
            <h3>Port</h3>
            <p>Port number exposed by main process</p>
          </div>
          <input
            className={styles.input}
            type="number"
            placeholder="Port"
            value={port}
            disabled={framework !== ""}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setPort(+e.target.value)}
          />
        </div>
      </div>
      <button
        className={styles.primaryButton}
        onClick={handleCreateBlock}
        disabled={!isNameValid || !name || !description || !port}
      >
        Create
      </button>
      <div className={styles.closeButton}>
        <CloseButton size={20} color="red" onClick={close} />
      </div>
      {renderCloseModal(
        <SimpleDialog
          text="Are you sure you want to close?"
          subText="All changes will be lost."
          rightText="Close"
          onClickLeft={closeCloseModal}
          onClickRight={close}
        />
      )}
      {renderLoadingModal(<LoadingDialog text={loadingText} />)}
    </AnimatedModalWrapper>
  );
}
