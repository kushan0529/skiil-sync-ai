import { useState, useEffect } from "react";
import axios from "axios";
import { User, Check, AlertCircle, Search, Sparkles, CheckCircle2 } from "lucide-react";
const Recommendations = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      const allUsers = Array.isArray(res.data.users) ? res.data.users : Array.isArray(res.data) ? res.data : [];
      setUsers(allUsers.filter((u) => u.role === "member"));
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setFetchingUsers(false);
    }
  };
  const fetchRecommendations = async (userId) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(`/api/projects/recommend/${userId}`);
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchRecommendations(user._id);
  };
  const assignProject = async (projectId) => {
    if (!selectedUser) return;
    try {
      await axios.put(`/api/projects/${projectId}`, {
        $addToSet: { members: selectedUser._id }
      });
      const projectName = recommendations.find((r) => r.project._id === projectId)?.project.name || "Project";
      setMessage(`The project "${projectName}" has been successfully assigned to ${selectedUser.name}.`);
      setRecommendations((prev) => prev.map((rec) => {
        if (rec.project._id === projectId) {
          return {
            ...rec,
            project: {
              ...rec.project,
              members: [...rec.project.members || [], selectedUser._id]
            }
          };
        }
        return rec;
      }));
      setTimeout(() => setMessage(""), 5e3);
    } catch (err) {
      setMessage("Failed to assign project");
    }
  };
  return <div className="fade-in"><div style={{ marginBottom: "2rem" }}><h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem", letterSpacing: "-0.02em" }}><Sparkles size={32} color="var(--primary)" />
          AI Project Matchmaker
        </h1><p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Find the perfect project for your team members using AI skill analysis.</p></div>{message && <div className="card glass fade-in" style={{
    background: "rgba(22, 163, 74, 0.05)",
    borderColor: "var(--success)",
    color: "var(--success)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    padding: "1.25rem",
    borderRadius: "var(--radius)"
  }}><CheckCircle2 size={24} /><div style={{ fontWeight: 600 }}>{message}</div></div>}<div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "2.5rem" }}><div className="card" style={{ padding: "0", overflow: "hidden", height: "fit-content" }}><div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}><h3 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}><User size={20} />
              Team Members
            </h3></div><div style={{ maxHeight: "700px", overflowY: "auto" }}>{fetchingUsers ? <div style={{ padding: "3rem", textAlign: "center" }}><div className="loading-spinner" style={{ margin: "0 auto" }} /></div> : users.length > 0 ? users.map((user) => <div
    key={user._id}
    onClick={() => handleUserSelect(user)}
    style={{
      padding: "1.25rem 1.5rem",
      cursor: "pointer",
      borderBottom: "1px solid var(--border)",
      background: selectedUser?._id === user._id ? "rgba(99, 102, 241, 0.05)" : "transparent",
      borderLeft: selectedUser?._id === user._id ? "4px solid var(--primary)" : "4px solid transparent",
      transition: "all 0.2s"
    }}
  ><div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{user.name}</div><div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{user.email}</div><div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>{user.skills && user.skills.slice(0, 3).map((skill) => <span key={skill} style={{ fontSize: "0.7rem", background: "var(--bg)", padding: "0.15rem 0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}>{skill}</span>)}{user.skills && user.skills.length > 3 && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>+{user.skills.length - 3} more</span>}</div></div>) : <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No members found</div>}</div></div><div>{selectedUser ? <div><div className="card" style={{ marginBottom: "2rem", padding: "1.5rem", background: "var(--bg)", border: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Recommendations for {selectedUser.name}</h3><div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}><span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>Identified Skills:</span>{selectedUser.skills && selectedUser.skills.length > 0 ? selectedUser.skills.map((s) => <span key={s} className="status-badge" style={{ background: "var(--bg-secondary)", color: "var(--text-main)", fontSize: "0.75rem" }}>{s}</span>) : <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontStyle: "italic" }}>None identified yet</span>}</div></div><button onClick={() => fetchRecommendations(selectedUser._id)} className="btn btn-outline" style={{ borderRadius: "50px" }}><Sparkles size={16} style={{ marginRight: "0.5rem" }} /> Refresh AI
                  </button></div></div>{loading ? <div style={{ textAlign: "center", padding: "6rem" }}><div className="loading-spinner" style={{ margin: "0 auto 1.5rem" }} /><p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>AI is analyzing projects and skills compatibility...</p></div> : recommendations.length > 0 ? <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>{recommendations.map((rec) => {
    const isAlreadyMember = rec.project.members?.some((m) => (m._id || m) === selectedUser._id);
    return <div key={rec.project._id} className="card" style={{ borderLeft: `5px solid ${rec.score > 0.8 ? "var(--success)" : "#eab308"}`, padding: "1.75rem" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}><div style={{ flex: 1 }}><h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>{rec.project.name}</h4><div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}><span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", width: "100%", marginBottom: "0.25rem" }}>Skill Match Analysis:</span>{rec.project.requiredSkills.map((skill) => {
      const isMatch = selectedUser.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
      return <span key={skill} style={{
        fontSize: "0.75rem",
        background: isMatch ? "rgba(22, 163, 74, 0.1)" : "var(--bg-secondary)",
        color: isMatch ? "var(--success)" : "var(--text-muted)",
        padding: "0.25rem 0.75rem",
        borderRadius: "50px",
        border: "1px solid currentColor",
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        fontWeight: isMatch ? 700 : 500
      }}>{isMatch && <Check size={12} />}{skill}</span>;
    })}</div></div><div style={{ textAlign: "center", padding: "0.75rem 1.25rem", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border)" }}><div style={{ fontSize: "1.5rem", fontWeight: 800, color: rec.score > 0.8 ? "var(--success)" : "#eab308" }}>{Math.round(rec.score * 100)}%</div><div style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>Match Score</div></div></div><p style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "1.25rem", lineHeight: 1.6 }}>{rec.project.description}</p><div style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(99, 102, 241, 0.1)", marginBottom: "1.5rem" }}><div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><Sparkles size={20} color="var(--primary)" style={{ marginTop: "0.1rem" }} /><div><p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5, color: "var(--text-main)" }}><span style={{ fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", fontSize: "0.75rem", marginRight: "0.5rem" }}>AI Logic:</span>{rec.reason}</p></div></div></div><div style={{ display: "flex", justifyContent: "flex-end" }}>{isAlreadyMember ? <div className="status-badge status-active" style={{ padding: "0.6rem 1.5rem", background: "var(--bg-secondary)", color: "var(--text-muted)" }}><CheckCircle2 size={18} style={{ marginRight: "0.5rem" }} /> Already Assigned
                            </div> : <button onClick={() => assignProject(rec.project._id)} className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
                              Assign {selectedUser.name} to Project
                            </button>}</div></div>;
  })}</div> : <div className="card" style={{ textAlign: "center", padding: "5rem 2rem" }}><AlertCircle size={48} color="var(--text-muted)" style={{ margin: "0 auto 1.5rem", opacity: 0.3 }} /><h3>No Recommendations Found</h3><p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto" }}>We couldn't find any planning-stage projects that match this user's skills at this time.</p></div>}</div> : <div className="card" style={{ height: "500px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", border: "2px dashed var(--border)", background: "transparent", borderRadius: "var(--radius)" }}><Search size={64} style={{ marginBottom: "1.5rem", opacity: 0.2 }} /><h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>Select a Team Member</h3><p style={{ maxWidth: "300px", textAlign: "center", lineHeight: 1.6 }}>Choose a developer from the team list to generate AI-powered project matching recommendations.</p></div>}</div></div></div>;
};
var stdin_default = Recommendations;
export {
  stdin_default as default
};
