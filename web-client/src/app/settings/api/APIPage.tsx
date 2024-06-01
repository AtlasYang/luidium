"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./APIPage.module.css";
import {
  createCliToken,
  deleteCliToken,
  readAllCliToken,
} from "@/service/cli/api";
import useModal from "@/lib/hook/useModal";
import LoadingDialog from "@/app/components/dialog/LoadingDialog";
import CopyIcon from "@/asset/Icons/CopyIcon";
import { successToast } from "@/utils/toasts";

export default function APIPage() {
  const [tokens, setTokens] = useState<string[] | null>(null);
  const [loadingText, setLoadingText] = useState<string>("");
  const {
    openModal: openLoadingModal,
    closeModal: closeLoadingModal,
    renderModal: renderLoadingModal,
  } = useModal();

  const handleGetAllCliTokens = useCallback(async () => {
    const res = await readAllCliToken();
    setTokens(res.map((token) => token.token));
  }, []);

  const handleCreateCliToken = useCallback(async () => {
    setLoadingText("Creating CLI token...");
    openLoadingModal();
    const res = await createCliToken();
    if (res) {
      handleGetAllCliTokens();
    }
    closeLoadingModal();
  }, [handleGetAllCliTokens, openLoadingModal, closeLoadingModal]);

  const handleDeleteCliToken = useCallback(
    async (token: string) => {
      setLoadingText("Deleting CLI token...");
      openLoadingModal();
      const res = await deleteCliToken(token);
      if (res) {
        handleGetAllCliTokens();
      }
      closeLoadingModal();
    },
    [handleGetAllCliTokens, openLoadingModal, closeLoadingModal]
  );

  useEffect(() => {
    handleGetAllCliTokens();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.section}>
        <h1>CLI Tokens</h1>
        <p>
          Manage your CLI tokens here. You can create, read, and delete CLI
          tokens.
        </p>
        <button className={styles.textButton} onClick={handleCreateCliToken}>
          <p>Create Token</p>
        </button>
        <div className={styles.tokenList}>
          {tokens === null && <p>Loading...</p>}
          {tokens?.length === 0 && <p>No tokens found</p>}
          {tokens?.map((token, index) => (
            <div key={index} className={styles.token}>
              <p>{token}</p>
              <div className={styles.spacer} />
              <button
                className={styles.copyButton}
                onClick={() => {
                  navigator.clipboard.writeText(token);
                  successToast("Copied to clipboard");
                }}
              >
                <CopyIcon size={16} color="#343434" />
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteCliToken(token)}
              >
                <p>Revoke</p>
              </button>
            </div>
          ))}
        </div>
      </div>
      {renderLoadingModal(<LoadingDialog text={loadingText} />)}
    </div>
  );
}
