"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Handle, NodeProps, Position } from "reactflow";
import styles from "@/styles/nodes/StorageNode.module.css";
import useModal from "@/lib/hook/useModal";
import DatabaseEditor from "../editors/DatabaseEditor";
import ConfigButton from "@/app/components/button/ConfigButton";
import { webConfig } from "@/interface/web/web";
import storageImage from "@/asset/images/storage.png";
import Image from "next/image";

export default function StorageNode(props: NodeProps<webConfig>) {
  const exampleModal = <p>Example Modal</p>;

  const { openModal, closeModal, renderModal, isModalOpen } = useModal();

  return (
    <motion.div className={styles.container}>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      <div className={styles.info}>
        <h3>Storage</h3>
        <p>{props.data.name}</p>
        <p>{`${props.data.type}:${props.data.version}`}</p>
        <div className={styles.icon}>
          <Image src={storageImage} alt="storage" height={70} />
        </div>
      </div>
      <div className={styles.button}>
        <ConfigButton
          size={24}
          color="#FFFFFF"
          onClick={openModal}
          guideText="Web Configuration"
        />
      </div>
      {renderModal(<DatabaseEditor close={closeModal} />)}
    </motion.div>
  );
}
