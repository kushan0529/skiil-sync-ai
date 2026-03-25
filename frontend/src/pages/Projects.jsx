import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../store/slices/projectSlice";
import { Briefcase, Search, ArrowRight, Plus, Clock, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CreateProjectModal from "../components/CreateProjectModal";
import DeadlineWarning from "../components/DeadlineWarning";
const Projects = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { projects, loading } = useSelector((state) => state.projects);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);
  const myProjects = projects.filter((p) => p.members?.some((m) => (m?._id || m) === user?._id) || (p.owner?._id || p.owner) === user?._id);
  const globalProjects = projects.filter((p) => !myProjects.some((mp) => mp._id === p._id));
  const filteredMyProjects = myProjects.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredGlobalProjects = globalProjects.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleCreateSuccess = (msg) => {
    setSuccessMessage(msg);
    dispatch(fetchProjects());
    setTimeout(() => setSuccessMessage(""), 5e3);
  };
  if (loading && projects.length === 0) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><div className="loading-spinner" /></div>;
  const ProjectCard = ({ project, isMyProject }) => <div key={project._id} className="card" style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    background: isMyProject ? "var(--card-bg)" : "rgba(0,0,0,0.02)",
    border: isMyProject ? "1px solid var(--border)" : "1px dashed var(--border)",
    opacity: isMyProject ? 1 : 0.8
  }}><div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}><div style={{ padding: "1rem", background: "var(--bg-secondary)", borderRadius: "12px", color: isMyProject ? "var(--primary)" : "var(--text-muted)" }}><Briefcase size={24} /></div><div><h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.25rem" }}>{project.name}</h4><p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>{project.description}</p><div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}><div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)" }}><Clock size={14} />
              Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No date"}</div><div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><Users size={14} />{project.members && project.members.length > 0 ? project.members.map((m) => typeof m === "object" ? m.name : "User").filter(Boolean).join(", ") : "Unassigned"}</div></div></div></div><div style={{ display: "flex", alignItems: "center", gap: "2rem" }}><div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}><span className={`status-badge status-${project.status.toLowerCase()}`}>{project.status}</span><DeadlineWarning deadline={project.deadline} status={project.status} /></div><Link to={`/projects/${project._id}`} className="btn btn-outline btn-sm">{isMyProject ? "Access" : "View"} <ArrowRight size={16} /></Link></div></div>;
  return <div className="fade-in"><div className="flex-between mb-8"><div><h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Project Portfolio</h1><p className="text-muted">Manage and track all your ongoing initiatives.</p></div>{(user?.role === "manager" || user?.role === "admin") && <button onClick={() => setIsModalOpen(true)} className="btn btn-primary"><Plus size={20} /> New Project
          </button>}</div>{successMessage && <div className="card glass mb-8" style={{ background: "rgba(34, 197, 94, 0.1)", borderColor: "var(--success)", color: "var(--success)" }}>{successMessage}</div>}<div className="card mb-8"><div className="flex-between flex-wrap gap-4"><div style={{ position: "relative", flex: 1, minWidth: "300px" }}><Search size={20} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} /><input
    type="text"
    placeholder="Search projects by name or description..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ paddingLeft: "3rem", width: "100%", borderRadius: "50px" }}
  /></div></div></div><div style={{ marginBottom: "3rem" }}><h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>My Projects</h2><div className="grid-1" style={{ gap: "1rem" }}>{filteredMyProjects.length > 0 ? filteredMyProjects.map((p) => <ProjectCard key={p._id} project={p} isMyProject={true} />) : <div className="card" style={{ textAlign: "center", padding: "3rem", border: "1px dashed var(--border)" }}><p className="text-muted">You are not assigned to any projects yet.</p></div>}</div></div><div><h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>All Global Projects</h2><div className="grid-1" style={{ gap: "1rem" }}>{filteredGlobalProjects.length > 0 ? filteredGlobalProjects.map((p) => <ProjectCard key={p._id} project={p} isMyProject={false} />) : <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              No other projects available.
            </div>}</div></div><CreateProjectModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSuccess={handleCreateSuccess}
  /></div>;
};
var stdin_default = Projects;
export {
  stdin_default as default
};
