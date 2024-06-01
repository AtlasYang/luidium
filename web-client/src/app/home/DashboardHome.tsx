"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import styles from "./DashboardHome.module.css";
import AppIcon from "@/asset/Icons/AppIcon";
import MyAppScreen from "./myapplication/MyAppScreen";
import useModal from "@/lib/hook/useModal";
import AppCreatorScreen from "./applicationCreator/AppCreatorScreen";
import { useRouter } from "next/navigation";
import logoOutline from "@/asset/images/logo_outline.png";
import logoAlt from "@/asset/images/logo_alt.png";
import Image from "next/image";
import PlusIcon from "@/asset/Icons/PlusIcon";
import applicationLogo from "@/asset/images/application_logo.png";
import { getUserInfo, logout, validate } from "@/service/auth/auth-api";
import { User } from "@/service/user/interface";
import PrimaryButton from "../components/button/PrimaryButton";

export default function DashboardHome() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const {
    renderModal: renderCreateModal,
    openModal: openCreateModal,
    closeModal: closeCreateModal,
  } = useModal();

  const handleCloseCreateModal = useCallback(() => {
    closeCreateModal();
    window.location.reload();
  }, [closeCreateModal]);

  useEffect(() => {}, []);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <p>My Applications</p>
        </div>
        <div className={styles.content}>
          <MyAppScreen />
        </div>
      </div>
    </div>
  );
}
