import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import axios from "axios";
const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am your SkillSync AI Assistant. I can help you with task breakdowns, issue descriptions, and Agile project insights. How can I assist your workflow today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
      setMessages((prev) => [...prev, {
        role: "ai",
        text: aiResponse
      }]);
      setLoading(false);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I encountered an error connecting to the AI service." }]);
      setLoading(false);
    }
  };
  return <>{!isOpen && <div className="ai-widget"><button className="ai-button" onClick={() => setIsOpen(true)}><MessageSquare size={24} /></button></div>}{isOpen && <div
    className="card glass fade-in"
    style={{
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      width: "350px",
      height: "500px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      padding: 0,
      boxShadow: "var(--shadow-lg)"
    }}
  ><div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", background: "var(--primary)", color: "white", borderTopLeftRadius: "var(--radius)", borderTopRightRadius: "var(--radius)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ margin: 0, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "white" }}><MessageSquare size={18} />
              SkillSync Assistant
            </h3><button onClick={() => setIsOpen(false)} style={{ color: "white" }}><X size={20} /></button></div><div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>{messages.map((msg, i) => <div
    key={i}
    style={{
      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
      background: msg.role === "user" ? "var(--primary)" : "var(--bg-secondary)",
      color: msg.role === "user" ? "white" : "var(--text-main)",
      padding: "0.75rem 1rem",
      borderRadius: "1rem",
      borderBottomRightRadius: msg.role === "user" ? "0.25rem" : "1rem",
      borderBottomLeftRadius: msg.role === "ai" ? "0.25rem" : "1rem",
      maxWidth: "85%",
      fontSize: "0.9rem",
      lineHeight: 1.4
    }}
  >{msg.text}</div>)}{loading && <div style={{ alignSelf: "flex-start", color: "var(--text-muted)", fontSize: "0.75rem", paddingLeft: "0.5rem" }}>
                AI is typing...
              </div>}</div><form onSubmit={handleSubmit} style={{ padding: "1rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem" }}><input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask for task suggestions..."
    style={{ flex: 1 }}
  /><button type="submit" className="btn btn-primary" style={{ padding: "0.5rem", borderRadius: "50%", width: "40px", height: "40px" }} disabled={loading}><Send size={18} /></button></form></div>}</>;
};
var stdin_default = AIChatWidget;
export {
  stdin_default as default
};
