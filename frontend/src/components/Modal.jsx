import { X } from "lucide-react";
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1e3,
    backdropFilter: "blur(4px)",
    overflowY: "auto",
    padding: "2rem 1rem"
  }}><div className="card fade-in" style={{
    width: "100%",
    maxWidth: "500px",
    maxHeight: "none",
    position: "relative",
    margin: "0 auto"
  }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}><h2 style={{ fontSize: "1.25rem", margin: 0 }}>{title}</h2><button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={24} /></button></div>{children}</div></div>;
};
export default Modal;
