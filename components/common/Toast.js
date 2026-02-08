"use client";
import styles from "./toast.module.css";

export default function Toast({ type = "success", message, onClose }) {
  if (!message) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
}
