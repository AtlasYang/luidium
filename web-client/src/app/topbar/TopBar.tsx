"use client";

import Image from "next/image";
import styles from "./TopBar.module.css";
import { useCallback, useEffect, useState } from "react";
import { User } from "@/service/user/interface";
import { useRouter } from "next/navigation";
import LocalStorage from "@/lib/localstroage";
import logoWithText from "@/asset/images/logo_text.svg";
import "react-loading-skeleton/dist/skeleton.css";
import { DashboardPages } from "../pageSet";
import { getUserInfo, validate } from "@/service/auth/auth-api";
import UserBlock from "../components/user/UserBlock";

export default function TopBar({
  currentMenu,
  setCurrentMenu,
}: {
  currentMenu: number;
  setCurrentMenu: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const handleGetProfile = useCallback(async () => {
    const { content: userId } = await validate();
    const userInfo = await getUserInfo(userId);
    setUser(userInfo);
  }, []);

  useEffect(() => {
    handleGetProfile();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <Image
          src={logoWithText}
          alt="logo"
          width={200}
          onClick={() => {
            router.push("/");
          }}
        />
      </div>
      <div className={styles.menuList}>
        {DashboardPages.map((menu, index) => (
          <div
            key={index}
            className={`${styles.menuItem} ${
              currentMenu === index ? styles.active : ""
            }`}
            onClick={() => setCurrentMenu(index)}
          >
            <p>{menu.name}</p>
          </div>
        ))}
      </div>
      <div className={styles.userCircle}>
        {user ? (
          <UserBlock user={user} onClick={() => {}} />
        ) : (
          // <img
          //   className={styles.avatar}
          //   src={user?.image_url}
          //   alt="logo"
          //   width={50}
          //   height={50}
          // />
          <></>
        )}
      </div>
    </div>
  );
}
