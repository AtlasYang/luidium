"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Handle, NodeProps, Position } from "reactflow";
import styles from "@/styles/nodes/WebNode.module.css";
import useModal from "@/lib/hook/useModal";
import DatabaseEditor from "../editors/DatabaseEditor";
import ConfigButton from "@/app/components/button/ConfigButton";
import ReactIcon from "@/asset/Icons/ReactIcon";
import NextjsIcon from "@/asset/Icons/NextjsIcon";
import { webConfig } from "@/interface/web/web";
import webImage from "@/asset/images/web.png";
import Image from "next/image";

export default function WebNode(props: NodeProps<webConfig>) {
  const exampleModal = <p>Example Modal</p>;

  const { openModal, closeModal, renderModal, isModalOpen } = useModal();

  return (
    <motion.div className={styles.container}>
      <div className={styles.info}>
        <h3>Web</h3>
        <p>{props.data.name}</p>
        <p>{`${props.data.type}:${props.data.version}`}</p>
        <div className={styles.icon}>
          <Image src={webImage} alt="web" height={80} />
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
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
      {renderModal(<DatabaseEditor close={closeModal} />)}
    </motion.div>
  );
}
