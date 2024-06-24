"use client";

import Image from "next/image";
import styles from "./page.module.css";
import GithubIcon from "@/asset/icon/GithubIcon";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Image src="/logo_text.svg" alt="logo" width={180} height={50} />
        <div className={styles.spacer} />
        <div
          className={styles.icon}
          onClick={() =>
            window.open("https://github.com/AtlasYang/luidium", "_blank")
          }
        >
          <GithubIcon size={30} color="#A0A0A0" />
        </div>
      </div>
      <div className={styles.section1}>
        <div className={styles.sub2}>
          <h1>A streamlined solution for deploying cloud applications</h1>
          <p>
            Deploy your applications with ease. Luidium is platform-agnostic and
            supports various frameworks for web, server and database
            applications.
          </p>
          <div
            className={styles.primaryButton}
            onClick={() => window.open("https://app.luidium.com", "_blank")}
          >
            Get Started
          </div>
        </div>
        <div className={styles.sub1}>
          <div className={styles.videoContainer}>
            <video
              autoPlay
              muted
              loop
              playsInline
              src="https://storage.luidium.lighterlinks.io/media/luidium-demo.webm"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
