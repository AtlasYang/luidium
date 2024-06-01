"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Handle, NodeProps, Position } from "reactflow";
import styles from "@/styles/nodes/ServerNode.module.css";
import DatabaseEditor from "../editors/DatabaseEditor";
import ConfigButton from "@/app/components/button/ConfigButton";
import NestjsIcon from "@/asset/Icons/NestjsIcon";
import RustAxumIcon from "@/asset/Icons/RustAxumIcon";
import { serverConfig } from "@/interface/server/server";
import useModal from "@/lib/hook/useModal";
import serverImage from "@/asset/images/server.png";
import Image from "next/image";

export default function ServerNode(props: NodeProps<serverConfig>) {
  const exampleModal = <p>Example Modal</p>;

  const { openModal, closeModal, renderModal, isModalOpen } = useModal();

  return (
    <motion.div className={styles.container}>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <div className={styles.info}>
        <h3>Server</h3>
        <p>{props.data.name}</p>
        <p>{`${props.data.type}:${props.data.version}`}</p>
        <div className={styles.icon}>
          <Image src={serverImage} alt="server" height={80} />
        </div>
      </div>
      <div className={styles.button}>
        <ConfigButton
          size={24}
          color="#FFFFFF"
          onClick={openModal}
          guideText="Server Configuration"
        />
      </div>
      {renderModal(<DatabaseEditor close={closeModal} />)}
    </motion.div>
  );
}
