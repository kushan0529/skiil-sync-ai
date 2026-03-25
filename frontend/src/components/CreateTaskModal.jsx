import { useState, useEffect } from "react";
import Modal from "./Modal";
import axios from "axios";
import { Type, FileText, Briefcase, User, Flag, Calendar, CheckCircle2, ChevronDown, Clock } from "lucide-react";
import { useDispatch } from "react-redux";
import { createTask } from "../store/slices/taskSlice";
const CreateTaskModal = ({ isOpen, onClose, onSuccess, defaultProjectId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    deadline: "",
    preference: "medium",
    project: defaultProjectId || "",
    assignee: ""
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (isOpen) {
      fetchData();
      setFormData((prev) => ({
        ...prev,
        project: defaultProjectId || "",
        startDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        // Default to today
      }));
    }
  }, [isOpen, defaultProjectId]);
  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        axios.get("/api/projects"),
        axios.get("/api/users")
      ]);
      setProjects(projectsRes.data.projects || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error("Failed to fetch data");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project) {
      setError("A project association is required to create a task.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resultAction = await dispatch(createTask(formData));
      if (createTask.fulfilled.match(resultAction)) {
        if (onSuccess) onSuccess("Task successfully initialized and assigned.");
        onClose();
        setFormData({
          title: "",
          description: "",
          startDate: "",
          deadline: "",
          preference: "medium",
          project: defaultProjectId || "",
          assignee: ""
        });
      } else {
        setError(resultAction.payload || "Could not initialize task. Please verify your inputs.");
      }
    } catch (err) {
      setError("An unexpected system error occurred.");
    } finally {
      setLoading(false);
    }
  };
  return <Modal isOpen={isOpen} onClose={onClose} title="Define New Task"><form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "0.5rem 0" }}>{error && <div className="fade-in" style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.05)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.1)", textAlign: "center" }}>{error}</div>}<div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}><div className="input-group" style={{ marginBottom: 0 }}><label style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}><Type size={18} className="text-primary" /> Task Title
            </label><input
    type="text"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    required
    placeholder="e.g. Implement OAuth2 flow"
    style={{ padding: "0.875rem 1.125rem", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: "1rem", fontWeight: 500, width: "100%", outline: "none" }}
    className="input-focus"
  /></div><div className="input-group" style={{ marginBottom: 0 }}><label style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}><FileText size={18} className="text-primary" /> Detailed Scope
            </label><textarea
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    rows={4}
    placeholder="Provide technical requirements, constraints, and success criteria..."
    style={{ padding: "0.875rem 1.125rem", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: "1rem", fontWeight: 500, width: "100%", outline: "none", resize: "none" }}
    className="input-focus"
  /></div><div className="grid-2" style={{ gap: "1.5rem" }}><div className="input-group" style={{ marginBottom: 0, position: "relative" }}><label style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}><Briefcase size={18} className="text-primary" /> Project Context
              </label><select
    value={formData.project}
    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
    required
    disabled={!!defaultProjectId}
    style={{ padding: "0.875rem 1.125rem", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: "0.95rem", fontWeight: 600, width: "100%", outline: "none", appearance: "none", cursor: "pointer" }}
    className="input-focus"
  ><option value="">Select Project</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select><ChevronDown size={18} style={{ position: "absolute", right: "1rem", top: "2.8rem", pointerEvents: "none", color: "var(--text-muted)" }} /></div><div className="input-group" style={{ marginBottom: 0, position: "relative" }}><label style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}><User size={18} className="text-primary" /> Assign Talent
              </label><select
    value={formData.assignee}
    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
    style={{ padding: "0.875rem 1.125rem", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--bg)", fontSize: "0.95rem", fontWeight: 600, width: "100%", outline: "none", appearance: "none", cursor: "pointer" }}
    className="input-focus"
  ><option value="">Unassigned (Backlog)</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name} — {u.role}</option>)}</select><ChevronDown size={18} style={{ position: "absolute", right: "1rem", top: "2.8rem", pointerEvents: "none", color: "var(--text-muted)" }} /></div></div><div style={{ padding: "1.5rem", background: "rgba(99, 102, 241, 0.03)", borderRadius: "20px", border: "1px solid rgba(99, 102, 241, 0.08)" }}><p style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.25rem" }}>Timing & Priority</p><div className="grid-3" style={{ gap: "1.25rem" }}><div className="input-group" style={{ marginBottom: 0 }}><label style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem", fontWeight: 700, fontSize: "0.8rem", color: "var(--text-muted)" }}><Flag size={14} /> Priority
                </label><select
    value={formData.preference}
    onChange={(e) => setFormData({ ...formData, preference: e.target.value })}
    style={{ padding: "0.6rem 0.8rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--card-bg)", fontSize: "0.875rem", fontWeight: 700, width: "100%", outline: "none", cursor: "pointer" }}
  ><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div><div className="input-group" style={{ marginBottom: 0 }}><label style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem", fontWeight: 700, fontSize: "0.8rem", color: "var(--text-muted)" }}><Clock size={14} /> Start
                </label><input
    type="date"
    value={formData.startDate}
    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
    required
    style={{ padding: "0.6rem 0.8rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--card-bg)", fontSize: "0.875rem", fontWeight: 700, width: "100%", outline: "none" }}
  /></div><div className="input-group" style={{ marginBottom: 0 }}><label style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem", fontWeight: 700, fontSize: "0.8rem", color: "var(--text-muted)" }}><Calendar size={14} /> Deadline
                </label><input
    type="date"
    value={formData.deadline}
    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
    required
    style={{ padding: "0.6rem 0.8rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--card-bg)", fontSize: "0.875rem", fontWeight: 700, width: "100%", outline: "none" }}
  /></div></div></div></div><div style={{ display: "flex", gap: "1.25rem", justifyContent: "flex-end", marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}><button type="button" onClick={onClose} className="btn btn-outline" style={{ padding: "0.875rem 1.75rem", borderRadius: "12px", fontWeight: 700 }}>Cancel</button><button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "0.875rem 2.25rem", borderRadius: "12px", fontWeight: 700, boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.4)" }}>{loading ? "Processing..." : "Confirm Task"}{!loading && <CheckCircle2 size={18} style={{ marginLeft: "0.5rem" }} />}</button></div></form></Modal>;
};
var stdin_default = CreateTaskModal;
export {
  stdin_default as default
};
