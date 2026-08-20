import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  Filter,
  Gauge,
  ListTodo,
  Search,
  Tags,
  User,
  Zap
} from "lucide-react";
import { fetchAllTasks, updateTask, updateTaskStatusInState } from "../store/slices/taskSlice";
import CreateTaskModal from "../components/CreateTaskModal";

const statusConfig = {
  todo: { title: "Backlog", tone: "#94a3b8" },
  "in-progress": { title: "Active", tone: "var(--primary)" },
  done: { title: "Done", tone: "var(--success)" }
};

const issueTone = {
  feature: "#16a34a",
  bug: "#ef4444",
  improvement: "#f59e0b",
  task: "var(--primary)"
};

const priorityTone = {
  high: "#ef4444",
  medium: "var(--primary)",
  low: "#16a34a"
};

const normalize = (value) => String(value || "").toLowerCase();

const LinearWorkspace = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const [query, setQuery] = useState("");
  const [cycleFilter, setCycleFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  const cycles = useMemo(() => {
    return [...new Set(tasks.map((task) => task?.cycle || "Backlog"))].sort();
  }, [tasks]);

  const labels = useMemo(() => {
    return [...new Set(tasks.flatMap((task) => task?.labels || []))].sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const search = normalize(query);
    return tasks.filter((task) => {
      if (!task) return false;
      const searchableText = [
        task.linearId,
        task.title,
        task.description,
        task.project?.name,
        task.assignee?.name,
        task.issueType,
        task.cycle,
        ...(task.labels || [])
      ].map(normalize).join(" ");

      const matchesSearch = !search || searchableText.includes(search);
      const matchesCycle = cycleFilter === "all" || (task.cycle || "Backlog") === cycleFilter;
      const matchesLabel = labelFilter === "all" || (task.labels || []).includes(labelFilter);
      return matchesSearch && matchesCycle && matchesLabel;
    });
  }, [tasks, query, cycleFilter, labelFilter]);

  const metrics = useMemo(() => {
    const activeTasks = filteredTasks.filter((task) => task.status !== "done");
    const estimateTotal = filteredTasks.reduce((sum, task) => sum + (task.estimate || 0), 0);
    const completedEstimate = filteredTasks.filter((task) => task.status === "done").reduce((sum, task) => sum + (task.estimate || 0), 0);

    return {
      openIssues: activeTasks.length,
      cycles: new Set(filteredTasks.map((task) => task.cycle || "Backlog")).size,
      estimateTotal,
      completedEstimate
    };
  }, [filteredTasks]);

  const handleStatusChange = (task, status) => {
    const progress = status === "done" ? 100 : status === "in-progress" ? Math.max(task.progress || 0, 10) : 0;
    dispatch(updateTaskStatusInState({ taskId: task._id, status }));
    dispatch(updateTask({ taskId: task._id, taskData: { status, progress } }));
  };

  const handleCycleChange = (task, cycle) => {
    dispatch(updateTask({ taskId: task._id, taskData: { cycle: cycle || "Backlog" } }));
  };

  const tasksByStatus = (status) => filteredTasks.filter((task) => task.status === status);

  if (loading && tasks.length === 0) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><div className="loading-spinner" /></div>;
  }

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--primary)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            <Zap size={16} />
            <span>Linear Workspace</span>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Issues, cycles, and velocity</h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", maxWidth: "720px" }}>
            Plan SkillSync work with issue IDs, estimates, labels, cycle grouping, and fast status updates.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <ListTodo size={18} /> New Issue
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <CircleDot size={22} style={{ color: "var(--primary)", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{metrics.openIssues}</h3>
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Open Issues</p>
        </div>
        <div className="card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Clock size={22} style={{ color: "#f59e0b", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{metrics.cycles}</h3>
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Active Cycles</p>
        </div>
        <div className="card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Gauge size={22} style={{ color: "#16a34a", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{metrics.completedEstimate}/{metrics.estimateTotal}</h3>
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Points Done</p>
        </div>
        <div className="card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Tags size={22} style={{ color: "var(--primary)", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{labels.length}</h3>
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Labels</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: "2rem", padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
        <div style={{ flex: "1 1 260px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, projects, labels..."
            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.7rem", border: "1px solid var(--border)", borderRadius: "10px", background: "var(--bg)", color: "var(--text-main)", outline: "none", fontWeight: 600 }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontWeight: 700 }}>
          <Filter size={16} />
          <select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)} style={{ padding: "0.75rem 1rem", border: "1px solid var(--border)", borderRadius: "10px", background: "var(--bg)", color: "var(--text-main)", fontWeight: 700 }}>
            <option value="all">All Cycles</option>
            {cycles.map((cycle) => <option key={cycle} value={cycle}>{cycle}</option>)}
          </select>
          <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} style={{ padding: "0.75rem 1rem", border: "1px solid var(--border)", borderRadius: "10px", background: "var(--bg)", color: "var(--text-main)", fontWeight: 700 }}>
            <option value="all">All Labels</option>
            {labels.map((label) => <option key={label} value={label}>{label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(280px, 1fr))", gap: "1.5rem", overflowX: "auto", paddingBottom: "1rem" }}>
        {Object.entries(statusConfig).map(([status, config]) => (
          <section key={status} style={{ minWidth: "280px", background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: "1rem", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: 0, fontSize: "1rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: config.tone }} />
                {config.title}
              </h3>
              <span className="status-badge status-planning" style={{ fontSize: "0.7rem" }}>{tasksByStatus(status).length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {tasksByStatus(status).map((task) => (
                <article key={task._id} className="card" style={{ padding: "1rem", boxShadow: "none", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.8rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 800 }}>{task.linearId || "SKL"}</span>
                      <span style={{ color: issueTone[task.issueType] || "var(--primary)", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0.12rem 0.5rem", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase" }}>{task.issueType || "task"}</span>
                      <span style={{ color: priorityTone[task.preference] || "var(--primary)", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0.12rem 0.5rem", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase" }}>{task.preference || "medium"}</span>
                    </div>
                    {task.status === "done" ? <CheckCircle2 size={18} style={{ color: "var(--success)", flexShrink: 0 }} /> : <CircleDot size={18} style={{ color: config.tone, flexShrink: 0 }} />}
                  </div>

                  <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem", lineHeight: 1.35 }}>{task.title}</h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.9rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {task.description || "No description provided."}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.9rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Briefcase size={13} /> {task.project?.name || "Independent"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><User size={13} /> {task.assignee?.name || "Unassigned"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Calendar size={13} /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</span>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
                    {(task.labels || []).length > 0 ? task.labels.map((label) => (
                      <span key={label} style={{ border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "999px", padding: "0.15rem 0.45rem", fontSize: "0.68rem", fontWeight: 700 }}>{label}</span>
                    )) : <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontStyle: "italic" }}>No labels</span>}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.6rem", alignItems: "center", marginBottom: "0.8rem" }}>
                    <input
                      value={task.cycle || "Backlog"}
                      onChange={(e) => handleCycleChange(task, e.target.value)}
                      style={{ minWidth: 0, padding: "0.45rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-main)", fontWeight: 700, fontSize: "0.78rem" }}
                      aria-label="Cycle"
                    />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--text-main)", fontWeight: 800, fontSize: "0.78rem" }}>
                      <Gauge size={13} /> {task.estimate || 0}
                    </span>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    style={{ width: "100%", padding: "0.55rem 0.65rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-main)", fontWeight: 800 }}
                  >
                    <option value="todo">Backlog</option>
                    <option value="in-progress">Active</option>
                    <option value="done">Done</option>
                  </select>

                  {task.project?._id && (
                    <Link to={`/projects/${task.project._id}`} style={{ display: "inline-flex", marginTop: "0.8rem", color: "var(--primary)", fontSize: "0.78rem", fontWeight: 800 }}>
                      Open project
                    </Link>
                  )}
                </article>
              ))}

              {tasksByStatus(status).length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem 1rem", border: "1px dashed var(--border)", borderRadius: "10px", color: "var(--text-muted)" }}>
                  <AlertCircle size={28} style={{ opacity: 0.35, marginBottom: "0.5rem" }} />
                  <p style={{ margin: 0, fontSize: "0.85rem" }}>No issues here.</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default LinearWorkspace;
