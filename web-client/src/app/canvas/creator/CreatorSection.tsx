import DatabaseCreatorNode from "./creator-nodes/DatabaseCreatorNode";
import DesktopCreatorNode from "./creator-nodes/DesktopCreatorNode";
import MobileCreatorNode from "./creator-nodes/MobileCreatorNode";
import ServerCreatorNode from "./creator-nodes/ServerCreatorNode";
import StorageCreatorNode from "./creator-nodes/StorageCreatorNode";
import WebCreatorNode from "./creator-nodes/WebCreatorNode";
import styles from "./CreatorSection.module.css";

export default function CreatorSection() {
  return (
    <div className={styles.container}>
      <StorageCreatorNode onClick={() => {}} />
      <DatabaseCreatorNode onClick={() => {}} />
      <div className={styles.divider} />
      <ServerCreatorNode onClick={() => {}} />
      <div className={styles.divider} />
      <WebCreatorNode onClick={() => {}} />
      <MobileCreatorNode onClick={() => {}} />
      <DesktopCreatorNode onClick={() => {}} />
    </div>
  );
}
