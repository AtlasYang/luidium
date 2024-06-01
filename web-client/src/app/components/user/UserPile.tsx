import styles from "@/styles/user/UserPile.module.css";
import { User } from "@/service/user/interface";
import { useState } from "react";
import ChevronLeft from "@/asset/Icons/ChevronLeft";
import ChevronRight from "@/asset/Icons/ChevronRight";

export default function UserPile({
  users,
  onClick,
}: {
  users: User[];
  onClick: (user: User) => void;
}) {
  const [visibleLastIndex, setVisibleLastIndex] = useState(3);

  return (
    <div className={styles.container}>
      {users.length > 3 && visibleLastIndex != 3 && (
        <div
          className={styles.btn}
          onClick={() =>
            setVisibleLastIndex((prev) => (prev - 3 < 3 ? 3 : prev - 3))
          }
        >
          <ChevronLeft size={16} color="black" />
        </div>
      )}
      {users.slice(visibleLastIndex - 3, visibleLastIndex).map((user, idx) => (
        <div
          key={user.id}
          className={styles.user}
          onClick={() => onClick(user)}
        >
          <img className={styles.avatar} src={user.image_url} alt="user" />
          <div className={styles.info}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>
      ))}
      {users.length > 3 && visibleLastIndex != users.length && (
        <div
          className={styles.btn}
          onClick={() =>
            setVisibleLastIndex((prev) =>
              prev + 3 > users.length ? users.length : prev + 3
            )
          }
        >
          <ChevronRight size={16} color="black" />
        </div>
      )}
    </div>
  );
}
