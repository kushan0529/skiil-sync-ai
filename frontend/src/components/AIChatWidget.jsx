import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2, Plus, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createTask } from "../store/slices/taskSlice";
import { useAuth } from "../context/AuthContext";

const AIChatWidget = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentProject } = useSelector((state) => state.projects);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am your SkillSync AI Assistant. I can help you with task breakdowns, issue descriptions, and project matching. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssignSuggestion = async (msgIndex, taskIndex) => {
    const msg = messages[msgIndex];
    const taskSuggestion = msg.tasks[taskIndex];
    
    if (!currentProject) return;

    // Update message state to show loading for this specific task
    const newMessages = [...messages];
    newMessages[msgIndex].tasks[taskIndex].isAssigning = true;
    setMessages(newMessages);

    try {
      const taskObj = {
        ...taskSuggestion,
        preference: taskSuggestion.preference || taskSuggestion.priority || "medium",
        issueType: taskSuggestion.issueType || "task",
        estimate: Number(taskSuggestion.estimate) || 1,
        labels: taskSuggestion.labels || [],
        cycle: taskSuggestion.cycle || "Backlog",
        project: currentProject._id,
        assignee: user?._id,
        status: "todo"
      };
      
      const result = await dispatch(createTask(taskObj));
      
      const updatedMessages = [...messages];
      if (createTask.fulfilled.match(result)) {
        updatedMessages[msgIndex].tasks[taskIndex].isAssigned = true;
        updatedMessages[msgIndex].tasks[taskIndex].mailStatus = result.payload.mailStatus;
      } else {
        updatedMessages[msgIndex].tasks[taskIndex].error = "Assignment failed";
      }
      updatedMessages[msgIndex].tasks[taskIndex].isAssigning = false;
      setMessages(updatedMessages);
    } catch (err) {
      console.error("Manual assignment failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await axios.post("/api/ai/chat", { message: userMessage });
      const aiResponse = res.data.response;
      
      // Try to parse JSON for tasks
      let taskData = null;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          taskData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {}

      if (taskData && taskData.tasks && Array.isArray(taskData.tasks)) {
        setMessages((prev) => [...prev, { 
          role: "ai", 
          type: "suggestion",
          tasks: taskData.tasks.map(t => ({ ...t, isAssigned: false, isAssigning: false })),
          text: currentProject 
            ? `I've generated some task suggestions for "${currentProject.name}". You can review and assign them below:`
            : `I've generated some task suggestions, but please open a project to enable assignment buttons.`
        }]);
      } else {
        setMessages((prev) => [...prev, {
          role: "ai",
          text: aiResponse
        }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I encountered an error connecting to the AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="ai-widget">
          <button className="ai-button" onClick={() => setIsOpen(true)}>
            <MessageSquare size={24} />
          </button>
        </div>
      )}
      {isOpen && (
        <div
          className="card glass fade-in"
          style={{
            position: 'fixed',
            top: "2rem",
            right: "2rem",
            width: "400px",
            height: "600px",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            padding: 0,
            boxShadow: "var(--shadow-xl)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", background: "var(--primary)", color: "white", borderTopLeftRadius: "var(--radius)", borderTopRightRadius: "var(--radius)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.6rem", color: "white", fontWeight: 700 }}>
              <MessageSquare size={18} />
              SkillSync AI Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} style={{ color: "white", background: "transparent", border: "none", cursor: "pointer" }}><X size={20} /></button>
          </div>
          
          <div style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "var(--primary)" : "var(--bg-secondary)",
                  color: msg.role === "user" ? "white" : "var(--text-main)",
                  padding: "1rem",
                  borderRadius: "1.25rem",
                  borderBottomRightRadius: msg.role === "user" ? "0.3rem" : "1.25rem",
                  borderBottomLeftRadius: msg.role === "ai" ? "0.3rem" : "1.25rem",
                  maxWidth: "90%",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
              >
                {msg.text}
                
                {msg.type === "suggestion" && msg.tasks && (
                  <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {msg.tasks.map((t, idx) => (
                      <div key={idx} style={{ background: "var(--bg)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.4rem", color: "var(--text-main)" }}>{t.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem", lineHeight: 1.4 }}>{t.description}</div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className={`status-badge status-${t.preference || t.priority || "medium"}`} style={{ fontSize: "0.65rem", padding: "0.1rem 0.5rem" }}>{t.preference || t.priority || "medium"}</span>
                          
                          {currentProject && !t.isAssigned ? (
                            <button 
                              onClick={() => handleAssignSuggestion(i, idx)}
                              disabled={t.isAssigning}
                              className="btn btn-primary btn-sm"
                              style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.75rem" }}
                            >
                              {t.isAssigning ? <><Loader2 size={12} className="animate-spin" /> Assigning...</> : <><Plus size={12} /> Accept & Assign</>}
                            </button>
                          ) : t.isAssigned ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                              <div style={{ color: "var(--success)", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <CheckCircle2 size={14} /> Task Assigned
                              </div>
                              {t.mailStatus?.success ? (
                                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>📧 Email sent to team</span>
                              ) : t.mailStatus?.error ? (
                                <span style={{ fontSize: "0.65rem", color: "#f59e0b" }}>⚠️ Task created, but email failed</span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text-muted)", fontSize: "0.85rem", paddingLeft: "0.5rem" }}>
                <Loader2 size={16} className="animate-spin" /> AI is thinking...
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} style={{ padding: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.75rem", background: "var(--bg)" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 'Suggest some tasks for frontend'"
              style={{ flex: 1, padding: "0.8rem 1.25rem", borderRadius: "50px", border: "1px solid var(--border)", background: "var(--bg-secondary)", outline: "none", fontSize: "0.95rem" }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: 0, borderRadius: "50%", width: "45px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} disabled={loading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
