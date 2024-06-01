"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Handle, NodeProps, Position } from "reactflow";
import styles from "@/styles/nodes/DesktopNode.module.css";
import useModal from "@/lib/hook/useModal";
import DatabaseEditor from "../editors/DatabaseEditor";
import { databaseConfig } from "@/interface/database/database";
import ConfigButton from "@/app/components/button/ConfigButton";
import desktopImage from "@/asset/images/desktop.png";
import Image from "next/image";

export default function DesktopNode(props: NodeProps<databaseConfig>) {
  const exampleModal = <p>Example Modal</p>;

  const { openModal, closeModal, renderModal, isModalOpen } = useModal();

  return (
    <motion.div className={styles.container}>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <div className={styles.info}>
        <h3>Desktop</h3>
        <p>{props.data.name}</p>
        <p>{`${props.data.type}:${props.data.version}`}</p>
        <div className={styles.icon}>
          <Image src={desktopImage} alt="desktop" width={70} />
        </div>
      </div>
      <div className={styles.button}>
        <ConfigButton
          size={24}
          color="#FFFFFF"
          onClick={openModal}
          guideText="Database Configuration"
        />
      </div>
      {renderModal(<DatabaseEditor close={closeModal} />)}
    </motion.div>
  );
}
