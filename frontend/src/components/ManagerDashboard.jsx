import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTasks } from "../store/slices/taskSlice";
import { fetchUsers, removeUserFromState } from "../store/slices/userSlice";
import { fetchProjects } from "../store/slices/projectSlice";
import axios from "axios";
import { Plus, Users, ClipboardList, UserPlus, Zap, Briefcase, FileSearch, Trash2, AlertTriangle, Sparkles } from "lucide-react";
import CreateProjectModal from "./CreateProjectModal";
import CreateTaskModal from "./CreateTaskModal";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext";
import SkillOverlay from "./SkillOverlay";
const ManagerDashboard = ({ onSuccess }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [unassignedTasks, setUnassignedTasks] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isUserDeleteModalOpen, setIsUserDeleteModalOpen] = useState(false);
  const [userDeleteLoading, setUserDeleteLoading] = useState(false);
  const [parsingUserId, setParsingUserId] = useState(null);
  const [showSkills, setShowSkills] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  useEffect(() => {
    dispatch(fetchAllTasks());
    dispatch(fetchUsers());
  }, [dispatch]);
  useEffect(() => {
    setUnassignedTasks(tasks.filter((t) => !t.assignee));
  }, [tasks]);
  useEffect(() => {
    if (currentUser?.role === "admin") {
      setDevelopers(users.filter((u) => u._id !== currentUser?._id));
    } else {
      setDevelopers(users.filter((u) => u.role === "developer" || u.role === "member" || u.role === "user"));
    }
  }, [users, currentUser]);
  const handleAssignTask = async (taskId, userId) => {
    try {
      await axios.put(`/api/tasks/${taskId}/assignee`, { userId });
      dispatch(fetchAllTasks());
      if (onSuccess) onSuccess("Task successfully assigned to team member.");
    } catch (err) {
      console.error("Failed to assign task");
    }
  };
  const handleProjectSuccess = (msg) => {
    dispatch(fetchAllTasks());
    dispatch(fetchProjects());
    if (onSuccess) onSuccess(msg);
  };
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setUserDeleteLoading(true);
    try {
      await axios.delete(`/api/users/${userToDelete._id}`);
      if (onSuccess) onSuccess(`User "${userToDelete.name}" deleted successfully.`);
      dispatch(removeUserFromState(userToDelete._id));
      setIsUserDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Failed to delete user");
    } finally {
      setUserDeleteLoading(false);
    }
  };
  const handleSeedProjects = async () => {
    try {
      const res = await axios.post("/api/projects/seed");
      if (onSuccess) onSuccess(res.data.message);
      dispatch(fetchProjects());
      dispatch(fetchAllTasks());
    } catch (err) {
      console.error("Failed to seed projects");
    }
  };
  const handleResumeUpload = async (e, userId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);
    setParsingUserId(userId);
    try {
      const res = await axios.post("/api/users/upload-resume", formData);
      const skills = res.data.user.skills || [];
      setExtractedSkills(skills);
      if (skills.length > 0) {
        setShowSkills(true);
        setTimeout(() => setShowSkills(false), 3e3);
      }
      dispatch(fetchUsers());
      if (onSuccess) onSuccess(`Resume for ${res.data.user.name} parsed successfully!`);
    } catch (err) {
      console.error("Failed to upload resume");
    } finally {
      setParsingUserId(null);
    }
  };
  const isAdmin = currentUser?.role === "admin";
  const loading = tasksLoading || usersLoading;
  if (loading && developers.length === 0) return <div className="card" style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)" }}><div className="loading-spinner" /><p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Synchronizing management data...</p></div>;
  return <div className="card glass" style={{
    padding: "2rem",
    border: "1px solid var(--primary)",
    background: "rgba(99, 102, 241, 0.03)",
    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.1)"
  }}><SkillOverlay skills={extractedSkills} isVisible={showSkills} /><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1.5rem" }}><div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}><div style={{
    padding: "0.875rem",
    background: "var(--primary)",
    color: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
  }}><Zap size={28} /></div><div><h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Quick Management Actions</h2><p style={{ margin: "0.25rem 0 0 0", fontSize: "1rem", color: "var(--text-muted)" }}>Allocate resources and initialize new workstreams</p></div></div><div style={{ display: "flex", gap: "1rem" }}><button
    onClick={handleSeedProjects}
    className="btn btn-outline"
    style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, background: "var(--bg)" }}
  ><Sparkles size={20} className="text-primary" /> Seed Demo Projects
          </button><button
    onClick={() => setIsProjectModalOpen(true)}
    className="btn btn-primary"
    style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}
  ><Plus size={20} /> Create Project
          </button><button
    onClick={() => setIsTaskModalOpen(true)}
    className="btn btn-outline"
    style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, background: "var(--bg)" }}
  ><Plus size={20} /> Create Task
          </button></div></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}><div style={{ display: "flex", flexDirection: "column" }}><h4 style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", fontSize: "1.125rem", fontWeight: 700 }}><ClipboardList size={20} className="text-primary" /> 
            Backlog: Unassigned Tasks 
            <span style={{ fontSize: "0.75rem", background: "var(--primary)", color: "white", padding: "0.1rem 0.6rem", borderRadius: "50px", marginLeft: "0.5rem" }}>{unassignedTasks.length}</span></h4><div style={{
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "380px",
    overflowY: "auto",
    padding: "0.5rem",
    background: "rgba(0,0,0,0.02)",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)"
  }}>{unassignedTasks.length === 0 ? <div style={{ textAlign: "center", padding: "3rem 1rem", background: "var(--bg)", borderRadius: "var(--radius)" }}><Users size={32} style={{ opacity: 0.2, marginBottom: "1rem" }} /><p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>Great job! No unassigned tasks.</p></div> : unassignedTasks.map((task) => <div key={task._id} className="card" style={{ padding: "1.25rem", border: "1px solid var(--border)", boxShadow: "none", background: "var(--bg)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{task.title}</div><div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}><Briefcase size={12} /> {task.project?.name || "Independent Task"}</div></div><span className={`status-badge status-${task.priority || "medium"}`} style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>{task.priority}</span></div><div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}><label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                        Assign Contributor
                    </label><select
    style={{ width: "100%", padding: "0.6rem", fontSize: "0.875rem", borderRadius: "8px" }}
    onChange={(e) => e.target.value && handleAssignTask(task._id, e.target.value)}
    value=""
  ><option value="">Select from available members...</option>{developers.map((dev) => {
    const projectSkills = task.project?.requiredSkills || [];
    const matchedCount = (dev.skills || []).filter(
      (s) => projectSkills.some((ps) => ps.toLowerCase() === s.toLowerCase())
    ).length;
    return <option key={dev._id} value={dev._id}>{dev.name} ({dev.role}){matchedCount > 0 ? ` \u2501 \u2728 ${matchedCount} Skill Matches` : ""}</option>;
  })}</select></div></div>)}</div></div><div style={{ display: "flex", flexDirection: "column" }}><h4 style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", fontSize: "1.125rem", fontWeight: 700 }}><UserPlus size={20} className="text-primary" /> 
            Talent Pool Availability
          </h4><div style={{
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    maxHeight: "380px",
    overflowY: "auto",
    padding: "0.5rem"
  }}>{developers.map((dev) => <div key={dev._id} className="card" style={{
    padding: "1rem 1.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid var(--border)",
    boxShadow: "none",
    background: "var(--bg)"
  }}><div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}><div style={{
    width: "48px",
    height: "48px",
    background: "var(--primary)",
    color: "white",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    fontWeight: 800,
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
    flexShrink: 0
  }}>{dev.name.charAt(0)}</div><div style={{ flex: 1 }}><div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em", marginBottom: "0.1rem" }}>{dev.name}</div><div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>{dev.role}</div>{
    /* Skills Highlighting */
  }{dev.skills && dev.skills.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.4rem" }}>{dev.skills.slice(0, 3).map((s) => <span key={s} style={{
    fontSize: "0.65rem",
    background: "rgba(99, 102, 241, 0.08)",
    color: "var(--primary)",
    padding: "0.1rem 0.4rem",
    borderRadius: "4px",
    fontWeight: 600,
    border: "1px solid rgba(99, 102, 241, 0.1)"
  }}>{s}</span>)}{dev.skills.length > 3 && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", alignSelf: "center" }}>
                            +{dev.skills.length - 3}</span>}</div>}</div></div><div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><button
    onClick={() => navigate(`/manager/assign/${dev._id}`)}
    className="btn btn-outline btn-sm"
    style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
  ><FileSearch size={14} /> Analyze
                   </button>{(isAdmin || currentUser?.role === "manager") && <button
    onClick={() => {
      setUserToDelete(dev);
      setIsUserDeleteModalOpen(true);
    }}
    className="btn btn-outline btn-sm"
    style={{ padding: "0.4rem", color: "var(--error)", borderColor: "rgba(239, 68, 68, 0.2)" }}
    title="Delete Member"
  ><Trash2 size={14} /></button>}<span style={{
    fontSize: "0.75rem",
    background: "rgba(22, 163, 163, 0.1)",
    color: "var(--success)",
    padding: "0.3rem 0.75rem",
    borderRadius: "50px",
    fontWeight: 600,
    border: "1px solid rgba(22, 163, 163, 0.2)"
  }}>
                        Available
                    </span></div></div>)}</div></div></div><CreateProjectModal
    isOpen={isProjectModalOpen}
    onClose={() => setIsProjectModalOpen(false)}
    onSuccess={handleProjectSuccess}
  /><CreateTaskModal
    isOpen={isTaskModalOpen}
    onClose={() => setIsTaskModalOpen(false)}
    onSuccess={handleProjectSuccess}
  />{
    /* User Delete Confirmation Modal */
  }<Modal
    isOpen={isUserDeleteModalOpen}
    onClose={() => setIsUserDeleteModalOpen(false)}
    title="Confirm User Deletion"
  ><div style={{ textAlign: "center", padding: "1rem" }}><div style={{
    width: "64px",
    height: "64px",
    background: "rgba(239, 68, 68, 0.1)",
    color: "var(--error)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem"
  }}><AlertTriangle size={32} /></div><h3 style={{ marginBottom: "1rem" }}>Delete Member?</h3><p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.5 }}>
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
          </p><div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}><button
    className="btn btn-outline"
    onClick={() => setIsUserDeleteModalOpen(false)}
    disabled={userDeleteLoading}
  >
                Cancel
            </button><button
    className="btn btn-primary"
    onClick={handleDeleteUser}
    disabled={userDeleteLoading}
    style={{ background: "var(--error)", borderColor: "var(--error)" }}
  >{userDeleteLoading ? "Deleting..." : "Confirm Delete"}</button></div></div></Modal></div>;
};
var stdin_default = ManagerDashboard;
export {
  stdin_default as default
};
