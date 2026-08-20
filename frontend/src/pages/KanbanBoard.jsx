import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Minus, MoreVertical, Calendar, Briefcase, UserPlus, GripVertical, User, Gauge, Tags } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllTasks, updateTask, updateTaskStatusInState, updateTaskProgressInState } from "../store/slices/taskSlice";
import { fetchUsers } from "../store/slices/userSlice";
import CreateTaskModal from "../components/CreateTaskModal";
import { useAuth } from "../context/AuthContext";

const columns = {
  "todo": { title: "To Do", color: "var(--text-muted)" },
  "in-progress": { title: "In Progress", color: "var(--primary)" },
  "done": { title: "Done", color: "var(--success)" }
};

const KanbanBoard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllTasks());
    dispatch(fetchUsers());
  }, [dispatch]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    const newStatus = destination.droppableId;
    dispatch(updateTaskStatusInState({ taskId: draggableId, status: newStatus }));
    dispatch(updateTask({
      taskId: draggableId,
      taskData: { status: newStatus }
    }));
  };

  const handleProgressUpdate = (taskId, newProgress) => {
    const currentTask = tasks.find((t) => t && t._id === taskId);
    if (!currentTask) return;
    
    let newStatus = currentTask.status;
    if (newProgress === 100) newStatus = "done";
    else if (newProgress > 0 && currentTask.status === "todo") newStatus = "in-progress";
    else if (newProgress === 0 && currentTask.status === "in-progress") newStatus = "todo";

    dispatch(updateTaskProgressInState({ taskId, progress: newProgress, status: newStatus }));
    dispatch(updateTask({
      taskId,
      taskData: { progress: newProgress, status: newStatus }
    }));
  };

  const handleAssigneeChange = (taskId, userId) => {
    dispatch(updateTask({
      taskId,
      taskData: { assignee: userId }
    }));
  };

  if (loading && tasks.length === 0) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><div className="loading-spinner" /></div>;

  const getTasksByStatus = (status) => tasks.filter((t) => t && t.status === status);
  const isManager = user?.role === "manager" || user?.role === "admin";

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Kanban Board</h1>
          <p className="text-muted">Orchestrate your workflow with drag-and-drop precision.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={20} /> New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", overflowX: "auto", paddingBottom: "2rem" }}>
          {Object.entries(columns).map(([statusKey, config]) => (
            <div key={statusKey} style={{ minWidth: "320px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", padding: "0 0.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.75rem", color: config.color, fontWeight: 700 }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: config.color, boxShadow: `0 0 10px ${config.color}44` }} />
                  {config.title}
                  <span style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", padding: "0.2rem 0.75rem", borderRadius: "50px", fontSize: "0.8rem" }}>{getTasksByStatus(statusKey).length}</span>
                </h3>
              </div>

              <Droppable droppableId={statusKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: snapshot.isDraggingOver ? "rgba(99, 102, 241, 0.03)" : "var(--bg-secondary)",
                      borderRadius: "var(--radius)",
                      minHeight: "600px",
                      padding: "1rem",
                      transition: "all 0.2s ease",
                      border: snapshot.isDraggingOver ? "2px dashed var(--primary)" : "2px solid transparent"
                    }}
                  >
                    {getTasksByStatus(statusKey).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided2, snapshot2) => (
                          <div
                            ref={provided2.innerRef}
                            {...provided2.draggableProps}
                            className="card"
                            style={{
                              marginBottom: "1rem",
                              padding: "1.25rem",
                              background: "var(--bg)",
                              border: "1px solid var(--border)",
                              boxShadow: snapshot2.isDragging ? "var(--shadow-lg)" : "none",
                              ...provided2.draggableProps.style,
                              opacity: snapshot2.isDragging ? 0.9 : 1,
                              transform: snapshot2.isDragging ? `${provided2.draggableProps.style?.transform} scale(1.02)` : provided2.draggableProps.style?.transform,
                              position: "relative"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div {...provided2.dragHandleProps} style={{ color: "var(--text-muted)", cursor: "grab", display: "flex", alignItems: "center" }}>
                                  <GripVertical size={18} />
                                </div>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 800 }}>{task.linearId || "SKL"}</span>
                                <span className={`status-badge status-${task.preference || "medium"}`} style={{ fontSize: "0.65rem" }}>{task.preference || "medium"}</span>
                              </div>
                              <button style={{ color: "var(--text-muted)" }}><MoreVertical size={16} /></button>
                            </div>

                            <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", lineHeight: 1.4 }}>{task.title}</h4>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
                              <span style={{ border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "999px", padding: "0.15rem 0.5rem", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase" }}>{task.issueType || "task"}</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "999px", padding: "0.15rem 0.5rem", fontSize: "0.68rem", fontWeight: 800 }}><Gauge size={12} /> {task.estimate || 0}</span>
                            </div>

                            <div style={{ marginTop: "1rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                <span>Progress</span>
                                <span style={{ fontWeight: 700, color: "var(--primary)" }}>{task.progress || 0}%</span>
                              </div>
                              <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "10px", overflow: "hidden", marginBottom: "0.5rem" }}>
                                <div style={{ width: `${task.progress || 0}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s ease" }} />
                              </div>
                              
                              {(isManager || task.assignee?._id === user?._id) && (
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProgressUpdate(task._id, Math.max((task.progress || 0) - 10, 0));
                                    }}
                                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.25rem", cursor: "pointer", color: "var(--text-main)" }}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProgressUpdate(task._id, Math.min((task.progress || 0) + 10, 100));
                                    }}
                                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(99, 102, 241, 0.1)", border: "1px solid var(--primary)", borderRadius: "6px", padding: "0.25rem", cursor: "pointer", color: "var(--primary)" }}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                <Briefcase size={14} />
                                <span style={{ fontWeight: 500 }}>{task.project?.name || "Independent"}</span>
                              </div>
                              {isManager ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                  <UserPlus size={14} />
                                  <select
                                    value={task.assignee?._id || ""}
                                    onChange={(e) => handleAssigneeChange(task._id, e.target.value)}
                                    style={{ border: "none", background: "transparent", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, outline: "none", cursor: "pointer", padding: 0 }}
                                  >
                                    <option value="">Unassigned</option>
                                    {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                                  </select>
                                </div>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                  <User size={14} />
                                  <span>{task.assignee?.name || "Unassigned"}</span>
                                </div>
                              )}
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                <Calendar size={14} />
                                <span>{task.deadline ? new Date(task.deadline).toLocaleDateString(void 0, { month: "short", day: "numeric" }) : "No deadline"}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                <Tags size={14} />
                                <span>{task.cycle || "Backlog"}{(task.labels || []).length ? ` · ${task.labels.slice(0, 2).join(", ")}` : ""}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default KanbanBoard;
