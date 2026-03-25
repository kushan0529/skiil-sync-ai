import { Sparkles } from "lucide-react";
const SkillOverlay = ({ skills, isVisible }) => {
  if (!isVisible) return null;
  return <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.92)",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    padding: "2rem",
    textAlign: "center",
    backdropFilter: "blur(8px)"
  }}><div style={{ animation: "bounce 2s infinite" }}><Sparkles size={80} color="var(--primary)" style={{ marginBottom: "2rem", filter: "drop-shadow(0 0 15px var(--primary))" }} /></div><h1 style={{
    fontSize: "3.5rem",
    fontWeight: 900,
    marginBottom: "1rem",
    background: "linear-gradient(to right, #fff, var(--primary))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.02em"
  }}>
        Skills Identified!
      </h1><p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.6)", marginBottom: "3rem", fontWeight: 500 }}>
        Our AI has successfully parsed the professional expertise
      </p><div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", justifyContent: "center", maxWidth: "1000px" }}>{skills.map((skill, i) => <div
    key={skill}
    style={{
      fontSize: "1.5rem",
      fontWeight: 700,
      padding: "0.75rem 1.75rem",
      background: "rgba(99, 102, 241, 0.2)",
      borderRadius: "1rem",
      border: "1px solid var(--primary)",
      animation: `fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.08}s`,
      opacity: 0,
      boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)",
      color: "white"
    }}
  >{skill}</div>)}</div><div style={{ marginTop: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}><div className="loading-spinner" style={{ borderTopColor: "white" }} /><p style={{ fontSize: "1.125rem", opacity: 0.8, fontWeight: 500 }}>
          Analyzing skill-project synergy...
        </p></div><style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style></div>;
};
var stdin_default = SkillOverlay;
export {
  stdin_default as default
};
