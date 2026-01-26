import ClientSidebar from "./ClientSidebar";
import styles from "./clientLayout.module.css";

export default function ClientLayout({ children }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebarFixed}>
        <ClientSidebar />
      </div>

      <div className={styles.pageContent}>{children}</div>
    </div>
  );
}
