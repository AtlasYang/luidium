"use client";

import Image from "next/image";
import styles from "./page.module.css";
import useModal from "../../lib/hook/useModal";
import LoadingDialog from "../components/dialog/LoadingDialog";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/service/auth/auth-api";
import logoText from "@/asset/images/logo_text.svg";

export default function SignIn() {
  const router = useRouter();
  const { openModal, closeModal, renderModal } = useModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = useCallback(async () => {
    openModal();
    const result = await login({ email, password });
    if (result) {
      router.push("/");
    } else {
      setErrorMessage("Please check your email and password.");
    }
    closeModal();
  }, [email, password, openModal, closeModal, router]);

  return (
    <div className={styles.main}>
      <div
        className={styles.form}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSignIn();
          }
        }}
      >
        <div className={styles.title}>
          <Image src={logoText} alt="logo" width={260} />
        </div>
        <p className={styles.errorMessage}>{errorMessage}</p>
        <p className={styles.inputGuide}>Email</p>
        <input
          className={styles.input}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          placeholder="Enter your Email"
        />
        <p className={styles.inputGuide}>Password</p>
        <input
          className={styles.input}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter your Password"
        />
        <button className={styles.primaryButton} onClick={handleSignIn}>
          Sign In
        </button>
        <div className={styles.footer}>
          <p>{"Don't have an account?"}</p>
          <button onClick={() => router.push("/signup")}>Sign Up</button>
        </div>
      </div>
      {renderModal(<LoadingDialog />)}
    </div>
  );
}
