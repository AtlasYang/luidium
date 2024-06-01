"use client";

import { dismissProgress } from "@/lib/navigation-events";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoText from "@/asset/images/logo_text.svg";
import { searchUserWithEmail } from "@/service/sentinel/api";
import { checkEmailDuplicate, login, register } from "@/service/auth/auth-api";
import { uploadFileAndGetUrl } from "@/utils/fileUploader";
import CameraIcon from "@/asset/Icons/CameraIcon";
import useModal from "@/lib/hook/useModal";
import LoadingDialog from "../components/dialog/LoadingDialog";

const sampleAvatarUrl = (name: string) => {
  if (name.length === 0 || !name.slice(0, 1).match(/[a-zA-Z]/)) {
    return `https://storage.luidium.lighterlinks.io/luidium-assets/A.png`;
  }
  return `https://storage.luidium.lighterlinks.io/luidium-assets/${name
    .slice(0, 1)
    .toUpperCase()}.png`;
};

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUrlLocal, setAvatarUrlLocal] = useState<string>(
    sampleAvatarUrl("A")
  );
  const [signUpAvailable, setSignUpAvailable] = useState(false);
  const [warnText, setWarnText] = useState<string | null>(null);
  const { openModal, closeModal, renderModal } = useModal();

  const handleScrollToStage = (stage: number) => {
    const container = document.getElementById(`signup-stage-${stage}`);
    if (container) {
      container.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSignUp = useCallback(async () => {
    openModal();
    console.log(
      `sign up with email: ${email}, password: ${password}, name: ${name}, avatar: ${avatarUrl}`
    );

    const res = await register({
      name,
      email,
      password,
      imageUrl: avatarUrl.length > 0 ? avatarUrl : avatarUrlLocal,
    });

    if (res) {
      await login({ email, password });
      router.push("/");
    } else {
      setWarnText("Failed to sign up");
    }
    closeModal();
  }, [
    email,
    password,
    name,
    avatarUrl,
    avatarUrlLocal,
    router,
    openModal,
    closeModal,
  ]);

  const handleCheckSignUpAvailable = useCallback(() => {
    if (email.length === 0 || password.length === 0 || name.length === 0) {
      setSignUpAvailable(false);
      return;
    }
    setSignUpAvailable(true);
  }, [email, password, name]);

  const handleCheckEmail = useCallback(async (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
      setWarnText("Invalid email format");
      return;
    }
    const res = await checkEmailDuplicate(email);
    if (res) {
      setWarnText("Email already exists");
      return;
    }
    setWarnText(null);
    handleScrollToStage(2);
  }, []);

  const handleCheckPassword = useCallback(() => {
    if (password.length < 8) {
      setWarnText("Password must be at least 8 characters");
      return;
    }
    if (password !== passwordConfirm) {
      setWarnText("Password does not match");
      return;
    }
    setWarnText(null);
    handleScrollToStage(3);
  }, [password, passwordConfirm]);

  const handleCheckName = useCallback(() => {
    const regex = /^[a-zA-Z0-9\s]{3,20}$/;
    if (!regex.test(name)) {
      if (name.length < 3) {
        setWarnText("Name must be at least 3 characters");
        setSignUpAvailable(false);
        return;
      }
      if (name.length > 20) {
        setWarnText("Name must be at most 20 characters");
        setSignUpAvailable(false);
        return;
      }
      setWarnText("Invalid name format");
      setSignUpAvailable(false);
      return;
    }
    setWarnText(null);
    setSignUpAvailable(true);
  }, [name]);

  const handleUploadImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const imageURLObj = URL.createObjectURL(file!);
      setAvatarUrlLocal(imageURLObj);
      if (!file) {
        return;
      }
      const url = await uploadFileAndGetUrl(file);
      setAvatarUrl(url);
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
      }
    });

    return () => {
      document.removeEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
        }
      });
    };
  });

  useEffect(() => {
    handleCheckSignUpAvailable();
  }, [email, password, name, handleCheckSignUpAvailable]);

  return (
    <div className={styles.main}>
      <div className={styles.wrapper}>
        <div className={styles.header}></div>
        <div className={styles.content}>
          <div id="signup-stage-1" className={styles.container}>
            <h3>Enter email</h3>
            {warnText && <div className={styles.warn}>{warnText}</div>}
            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className={styles.primaryButton}
              onClick={() => {
                handleCheckEmail(email);
              }}
            >
              Next
            </button>
          </div>
          <div id="signup-stage-2" className={styles.container}>
            <h3>Set password</h3>
            {warnText && <div className={styles.warn}>{warnText}</div>}
            <div className={styles.password}>
              <input
                className={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
            <button
              className={styles.primaryButton}
              onClick={() => {
                handleCheckPassword();
              }}
            >
              Next
            </button>
          </div>
          <div id="signup-stage-3" className={styles.container}>
            <h3>Almost Done!</h3>
            {warnText && <div className={styles.warn}>{warnText}</div>}
            <label htmlFor="app-image">
              <div className={styles.appImageSection}>
                <img
                  src={avatarUrlLocal}
                  alt="App Image"
                  style={{
                    borderRadius: "50%",
                    width: "140px",
                    height: "140px",
                    objectFit: "cover",
                  }}
                />
                {avatarUrl.length === 0 && (
                  <div className={styles.imageUploadButton}>
                    <CameraIcon size={24} color="white" />
                  </div>
                )}
              </div>
            </label>
            <input
              type="file"
              id="app-image"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleUploadImage}
              style={{
                display: "none",
              }}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.length > 0 && avatarUrl.length === 0)
                  setAvatarUrlLocal(sampleAvatarUrl(e.target.value));
                handleCheckName();
              }}
            />
            {signUpAvailable && (
              <button
                className={styles.primaryButton}
                onClick={() => {
                  handleSignUp();
                }}
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
        <div className={styles.footer}>
          <p>
            Already have an account?{" "}
            <span onClick={() => router.push("/signin")}>Sign In</span>
          </p>
          <Image src={logoText} alt="logo" width={200} />
        </div>
      </div>
      {renderModal(<LoadingDialog />)}
    </div>
  );
}
