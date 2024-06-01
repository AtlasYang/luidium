import styles from "@/styles/dialogs/ForbiddenAccess.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForbiddenAccess() {
  const router = useRouter();
  const [redirectedInSec, setRedirectedInSec] = useState(5);

  setTimeout(() => {
    setRedirectedInSec(redirectedInSec - 1);
    if (redirectedInSec === 1) {
      router.push("/");
    }
  }, 1000);

  return (
    <div className={styles.container}>
      <h1>Forbidden Access</h1>
      <p>{"You don't have permission to this application."}</p>
      <p>{`You will be redirected to the main page in ${redirectedInSec} seconds.`}</p>
    </div>
  );
}
