import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectById, clearCurrentProject } from "../store/slices/projectSlice";
import { fetchTasksByProjectId, updateTask, deleteTask, updateTaskProgressInState } from "../store/slices/taskSlice";
import { fetchUsers } from "../store/slices/userSlice";
import { ArrowLeft, CheckCircle2, Circle, Clock, MoreVertical, Plus, Minus, UserPlus, Calendar, Sparkles, Trash2, Gauge, Tags, Layers } from "lucide-react";
import AssignMemberModal from "../components/AssignMemberModal";
import CreateTaskModal from "../components/CreateTaskModal";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import DeadlineWarning from "../components/DeadlineWarning";

const socket = io(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:4040" : window.location.origin), {
  reconnectionAttempts: 5,
  transports: ["polling", "websocket"],
  timeout: 1e4
});

const ProjectDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentProject: project, loading: projectLoading } = useSelector((state) => state.projects);
  const { projectTasks: tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleTaskSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const toggleTaskCompletion = async (task) => {
    const isNowDone = task.status !== "done";
    const newStatus = isNowDone ? "done" : "todo";
    const newProgress = isNowDone ? 100 : 0;
    
    if (!id) return;

    dispatch(updateTaskProgressInState({ taskId: task._id, progress: newProgress, status: newStatus }));
    
    try {
      await dispatch(updateTask({
        taskId: task._id,
        taskData: { status: newStatus, progress: newProgress }
      }));
    } catch (err) {
      console.error("Failed to toggle task completion");
    }
  };

  const handleTaskProgressChange = (taskId, newProgress) => {
    let newStatus = "todo";
    if (newProgress === 100) newStatus = "done";
    else if (newProgress > 0) newStatus = "in-progress";

    dispatch(updateTaskProgressInState({ taskId, progress: newProgress, status: newStatus }));
    dispatch(updateTask({
      taskId,
      taskData: { progress: newProgress, status: newStatus }
    }));
  };

  const handleAssigneeChange = async (taskId, userId) => {
    try {
      const result = await dispatch(updateTask({
        taskId,
        taskData: { assignee: userId }
      }));
      
      if (updateTask.fulfilled.match(result)) {
        if (result.payload.mailStatus && result.payload.mailStatus.success) {
          setSuccessMsg("Task assigned and email notification sent successfully!");
          setTimeout(() => setSuccessMsg(""), 5000);
        }
      }
    } catch (err) {
      console.error("Failed to update assignee");
    }
  };

  const TaskProgressManager = ({ task, canModify, isManager, user }) => {
    const handleIncrement = () => {
      if (!canModify) return;
      const nextProgress = Math.min((task.progress || 0) + 10, 100);
      handleTaskProgressChange(task._id, nextProgress);
    };

    const handleDecrement = () => {
      if (!canModify) return;
      const nextProgress = Math.max((task.progress || 0) - 10, 0);
      handleTaskProgressChange(task._id, nextProgress);
    };

    const isAssignedToMe = (task.assignee?._id || task.assignee) === user?._id;
    const canEditProgress = canModify && (isManager || isAssignedToMe);

    return (
      <div style={{ flex: "0 0 220px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Task Progress</span>
          <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.1rem", background: "rgba(99, 102, 241, 0.1)", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>{task.progress || 0}%</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {canEditProgress && (
            <button 
              onClick={handleDecrement}
              className="hover-scale"
              title="Decrease Progress (10%)"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.4rem", cursor: "pointer", color: "var(--text-main)", display: "flex", alignItems: "center" }}
            >
              <Minus size={16} />
            </button>
          )}
          
          <div style={{ flex: 1, height: "10px", background: "var(--bg-secondary)", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
            <div style={{ width: `${task.progress || 0}%`, height: "100%", background: "var(--primary)", transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </div>

          {canEditProgress && (
            <button 
              onClick={handleIncrement}
              className="hover-scale"
              title="Increase Progress (10%)"
              style={{ background: "var(--primary)", border: "none", borderRadius: "8px", padding: "0.4rem", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    dispatch(fetchUsers());
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchTasksByProjectId(id));
      socket.emit("joinProject", id);
      
      socket.on("taskUpdate", (data) => {
        // Optimization: If the socket sends the updated task, update state directly to avoid flicker
        if (data && data.task) {
          dispatch(updateTaskProgressInState({ 
            taskId: data.task._id, 
            progress: data.task.progress, 
            status: data.task.status 
          }));
        }
        // Small delay before full refetch to allow DB consistency in production
        setTimeout(() => {
          dispatch(fetchTasksByProjectId(id));
        }, 500);
      });
      
      socket.on("projectUpdate", (data) => {
        // Recalculate event triggered by backend
        setTimeout(() => {
          dispatch(fetchProjectById(id));
        }, 800);
      });
    }

    return () => {
      if (id) {
        socket.emit("leaveProject", id);
        socket.off("taskUpdate");
        socket.off("projectUpdate");
      }
      dispatch(clearCurrentProject());
    };
  }, [id, dispatch]);

  const handleAssignSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteTaskAction = async (taskId, taskTitle) => {
    if (window.confirm(`Are you sure you want to delete the task "${taskTitle}"?`)) {
      try {
        await dispatch(deleteTask(taskId));
        setSuccessMsg(`Task "${taskTitle}" deleted successfully.`);
        setTimeout(() => setSuccessMsg(""), 5000);
      } catch (err) {
        console.error("Failed to delete task");
      }
    }
  };

  const isManager = user?.role === "manager" || user?.role === "admin";
  const isMember = project?.members?.some((m) => (m._id || m) === user?._id) || 
                   project?.owner === user?._id || 
                   project?.owner?._id === user?._id;
  const canModify = isManager || isMember;
  const loading = projectLoading || tasksLoading;

  if (loading && !project) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "5rem" }}><div className="loading-spinner" /></div>;
  if (!project && !loading) return <div className="card" style={{ textAlign: "center", padding: "5rem" }}><h2>Project not found</h2><Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>Back to Dashboard</Link></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "2.5rem" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        {successMsg && (
          <div className="status-badge status-active" style={{ width: "100%", padding: "1rem", marginBottom: "1.5rem", justifyContent: "center", fontSize: "1rem" }}>
            {successMsg}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>{project?.name}</h1>
            <p style={{ color: "var(--text-muted)", maxWidth: "700px", fontSize: "1.1rem", lineHeight: 1.6 }}>{project?.description}</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            {canModify && (
              <>
                <button className="btn btn-outline" style={{ background: "var(--bg)" }} onClick={() => setIsAssignModalOpen(true)}>
                  <UserPlus size={18} /> Manage Team
                </button>
                <button className="btn btn-primary" onClick={() => setIsCreateTaskModalOpen(true)}>
                  <Plus size={18} /> New Task
                </button>
              </>
            )}
            {!canModify && (
              <div className="status-badge" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                <Clock size={16} /> View-only Mode
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Work Items</h2>
              <span className="status-badge status-planning" style={{ fontSize: "0.8rem" }}>{tasks.length} Total Tasks</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task._id} className="card task-item-container" style={{ 
                  padding: "1.5rem", 
                  display: "flex", 
                  flexDirection: "row",
                  alignItems: "flex-start", 
                  gap: "1.5rem", 
                  border: "1px solid var(--border)", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  opacity: canModify ? 1 : 0.85,
                  flexWrap: "wrap"
                }}>
                  <div style={{ display: "flex", alignItems: "center", height: "100%", paddingTop: "0.25rem" }}>
                    <button 
                      onClick={() => canModify && toggleTaskCompletion(task)}
                      disabled={!canModify}
                      style={{ 
                        color: task.status === "done" ? "var(--success)" : "var(--text-muted)", 
                        background: "transparent", 
                        transition: "all 0.2s", 
                        cursor: canModify ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                        borderRadius: "50%",
                        border: "none"
                      }}
                      className={canModify ? "hover-scale" : ""}
                    >
                      {task.status === "done" ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                    </button>
                  </div>
                  
                  <div style={{ flex: "1 1 300px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      <h4 style={{ 
                        fontSize: "1.2rem", 
                        fontWeight: 700, 
                        margin: 0,
                        textDecoration: task.status === "done" ? "line-through" : "none",
                        color: task.status === "done" ? "var(--text-muted)" : "var(--text-main)",
                        wordBreak: "break-word"
                      }}>{task.title}</h4>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {task.progress >= 75 && task.progress < 100 && <span className="status-badge status-active" style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem" }}>High Progress</span>}
                        {task.progress === 100 && (
                          <span className="status-badge status-active" style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", background: "var(--success)", color: "white" }}>
                            <CheckCircle2 size={12} style={{ marginRight: "0.2rem" }} /> Completed
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontWeight: 800 }}>
                        {task.linearId || "SKL"}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <Layers size={14} /> {task.issueType || "task"}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <Gauge size={14} /> {task.estimate || 0} pts
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <Clock size={14} /> Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: (task.preference || task.priority) === "high" ? "var(--error)" : (task.preference || task.priority) === "medium" ? "var(--primary)" : "var(--success)" }} />
                        Priority: <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{task.preference || task.priority}</span>
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <UserPlus size={14} /> Assignee: {isManager ? (
                          <select
                            value={task.assignee?._id || ""}
                            onChange={(e) => handleAssigneeChange(task._id, e.target.value)}
                            style={{ border: "none", background: "transparent", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, outline: "none", cursor: "pointer", padding: 0 }}
                          >
                            <option value="">Unassigned</option>
                            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                          </select>
                        ) : (
                          <span style={{ fontWeight: 600 }}>{task.assignee?.name || "Unassigned"}</span>
                        )}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                      <Tags size={14} />
                      <span style={{ fontWeight: 700 }}>{task.cycle || "Backlog"}</span>
                      {(task.labels || []).map((label) => (
                        <span key={label} style={{ border: "1px solid var(--border)", borderRadius: "999px", padding: "0.12rem 0.5rem", fontWeight: 700 }}>{label}</span>
                      ))}
                    </div>

                    <DeadlineWarning deadline={task.deadline} status={task.status} />
                  </div>

                  <TaskProgressManager 
                    task={task} 
                    canModify={canModify} 
                    isManager={isManager} 
                    user={user} 
                  />
                  
                  {isManager && canModify && (
                    <div style={{ alignSelf: "flex-start" }}>
                      <button 
                        onClick={() => handleDeleteTaskAction(task._id, task.title)}
                        style={{ color: "var(--error)", background: "transparent", padding: "0.5rem", borderRadius: "50%", cursor: "pointer", transition: "all 0.2s" }}
                        title="Delete Task"
                        className="hover-scale"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                  <button style={{ color: "var(--text-muted)", background: "transparent", cursor: canModify ? "pointer" : "default" }}><MoreVertical size={20} /></button>
                </div>
              )) : (
                <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px dashed var(--border)" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>This project currently has no active tasks.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: "1rem" }} onClick={() => setIsCreateTaskModalOpen(true)}>Create First Task</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card-no-hover" style={{ position: "sticky", top: "24px", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>Project Control</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Overall Progress</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ flex: 1, height: "10px", background: "var(--bg-secondary)", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ width: `${project?.progress || 0}%`, height: "100%", background: "var(--primary)", transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--primary)", minWidth: "40px" }}>{project?.progress || 0}%</span>
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Current Status</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className={`status-badge status-${project?.status?.toLowerCase()}`} style={{ fontSize: "0.9rem", padding: "0.5rem 1.25rem" }}>{project?.status}</span>
                    <DeadlineWarning deadline={project?.deadline} status={project?.status} />
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "1rem", letterSpacing: "0.05em" }}>Team Members ({project?.members?.length || 0})</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {project?.members && project.members.length > 0 ? project.members.map((member) => (
                      <div key={member._id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>{member.name?.charAt(0) || "U"}</div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.name}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{member.role}</div>
                        </div>
                        {member.skills && member.skills.length > 0 && (
                          <div style={{ display: "flex", gap: "0.25rem" }}>
                            <span title={member.skills.join(", ")} style={{ cursor: "help" }}>
                              <Sparkles size={14} style={{ color: "var(--primary)", opacity: 0.7 }} />
                            </span>
                          </div>
                        )}
                      </div>
                    )) : <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No members assigned yet.</p>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
              padding: "1.5rem",
              borderRadius: "var(--radius)",
              border: "1px solid rgba(99, 102, 241, 0.1)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: "-10px", right: "-10px", opacity: 0.1 }}><Sparkles size={64} /></div>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
                <Sparkles size={18} /> SkillSync Insights
              </h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                Based on project requirements, we recommend assigning a <strong>Frontend Lead</strong> with React expertise.
              </p>
              <Link to="/manager" className="btn btn-primary" style={{ width: "100%", fontSize: "0.875rem" }}>
                Open Assignment Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {project && (
        <AssignMemberModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          projectId={id || ""}
          currentMembers={project.members || []}
          requiredSkills={project.requiredSkills || []}
          onSuccess={handleAssignSuccess}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSuccess={handleTaskSuccess}
        defaultProjectId={id}
      />
    </div>
  );
};

export default ProjectDetails;
