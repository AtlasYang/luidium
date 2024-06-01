import SignOutIcon from "@/asset/Icons/SignOutIcon";
import { logout } from "@/service/auth/auth-api";
import { User } from "@/service/user/interface";
import styles from "@/styles/user/UserBlock.module.css";
import { useRouter } from "next/navigation";

export default function UserBlock({
  user,
  onClick,
}: {
  user: User;
  onClick: () => void;
}) {
  const router = useRouter();
  return (
    <div className={styles.container} onClick={onClick}>
      <div
        className={styles.signOut}
        onClick={async (e) => {
          await logout();
          router.push("/signin");
        }}
      >
        <SignOutIcon size={20} color="#000" />
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{user.name}</div>
        <div className={styles.email}>{user.email}</div>
      </div>
      <img className={styles.avatar} src={user.image_url} alt="user" />
    </div>
  );
}
