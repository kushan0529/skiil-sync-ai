import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, User, CheckCircle2, ShieldCheck, Eye, EyeOff } from "lucide-react";
const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("member");
  useEffect(() => {
    setIsLogin(location.pathname !== "/register");
    setError("");
    setSuccess("");
    setShowPassword(false);
  }, [location.pathname]);
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      login(res.data.token, res.data.user);

      // Redirect to the originally intended destination, or home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !isLogin && !name) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/register", { name, email, password, role });
      if (role === "manager") {
        setSuccess("Manager account created! Your account is pending administrator approval.");
        setTimeout(() => navigate("/login"), 5e3);
      } else {
        setSuccess("Account successfully created! You can now sign in.");
        setTimeout(() => setIsLogin(true), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. This email might already be in use.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "#0a0a0c",
      overflowX: "hidden",
      position: "relative",
    }}>
      {/* --- REFINED BACKGROUND --- */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(circle at center, black, transparent 90%)"
        }} />
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(2vw, -2vh) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .blob {
          position: absolute; width: 40vmax; height: 40vmax;
          border-radius: 50%; filter: blur(100px); opacity: 0.1;
          animation: float 25s infinite alternate ease-in-out;
        }
        .blob-1 { background: #4f46e5; top: -5%; left: -5%; animation-delay: 0s; }
        .blob-2 { background: #7c3aed; bottom: -5%; right: -5%; animation-delay: -5s; }

        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(30deg); }
          100% { transform: translateX(250%) rotate(30deg); }
        }
        .shimmer-card::before {
          content: ""; position: absolute; top: 0; left: 0; width: 30%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent);
          animation: shimmer 6s infinite linear;
        }
        
        .input-focus:focus-within {
          border-color: rgba(99, 102, 241, 0.5) !important;
          background: rgba(255,255,255,0.05) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .btn-glow:hover { 
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.4); 
          transform: translateY(-1px);
          background: #fdfdfd !important;
        }
        .btn-glow:active { transform: translateY(0); }

        .feature-card {
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        .feature-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(10px);
        }

        @media (max-width: 1024px) {
          .content-split {
            flex-direction: column !important;
            padding: 2rem !important;
          }
          .marketing-side {
            display: none !important;
          }
          .auth-side {
            width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="content-split" style={{
        display: "flex",
        width: "100%",
        maxWidth: "1440px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        padding: "0 2rem"
      }}>
        {/* --- MARKETING SIDE --- */}
        <div className="marketing-side" style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingRight: "4rem",
          color: "white"
        }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(99, 102, 241, 0.1)",
              padding: "0.5rem 1rem",
              borderRadius: "100px",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "#818cf8",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "1.5rem"
            }}>
              <Sparkles size={16} />
              Core AI Ecosystem
            </div>
            <h1 style={{
              fontSize: "3.5rem",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              letterSpacing: "-0.04em",
              background: "linear-gradient(to bottom right, #fff 50%, rgba(255,255,255,0.5))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Syncing Human Skills with <br />
              <span style={{ color: "#6366f1" }}>AI Intelligence.</span>
            </h1>
            <p style={{
              fontSize: "1.125rem",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "500px",
              lineHeight: 1.6
            }}>
              Experience the future of talent management. Our AI-driven ecosystem bridges the gap between vision and execution.
            </p>
          </div>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div className="feature-card" style={{ padding: "1.25rem", borderRadius: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "start" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", flexShrink: 0 }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>AI-Powered Matching</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>Instantly connect with the perfect developers using advanced skill analysis.</p>
              </div>
            </div>

            <div className="feature-card" style={{ padding: "1.25rem", borderRadius: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "start" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", flexShrink: 0 }}>
                <Mail size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Seamless Gmail Sync</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>Every task and project assignment detail will be shared directly through Gmail.</p>
              </div>
            </div>

            <div className="feature-card" style={{ padding: "1.25rem", borderRadius: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "start" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", flexShrink: 0 }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Smart Insights</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>This app automatically parses developer resumes and assigns relevant tasks and projects to them .</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "4rem", paddingTop: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "3rem" }}>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>98%</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.25rem" }}>Matching Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>24/7</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.25rem" }}>AI Assistance</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>10k+</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.25rem" }}>Talent Pool</div>
            </div>
          </div>
        </div>

        {/* --- AUTH SIDE --- */}
        <div className="auth-side" style={{
          width: "480px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 0"
        }}>
          <div className="shimmer-card" style={{
            width: "100%",
            background: "rgba(15, 15, 18, 0.7)",
            backdropFilter: "blur(30px)",
            borderRadius: "28px",
            padding: "3.5rem 2.5rem",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px -20px rgba(0,0,0,0.8)",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div style={{
                width: "64px",
                height: "64px",
                background: "linear-gradient(145deg, #6366f1, #818cf8)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                color: "white",
                position: "relative",
                boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.5)"
              }}>
                <Sparkles size={32} />
              </div>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", marginBottom: "0.5rem", letterSpacing: "-0.04em" }}>
                {isLogin ? "Welcome Back" : "Get Started"}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.95rem", fontWeight: 400 }}>
                {isLogin ? "SkillSync AI: Your intelligence-driven workspace" : "Create your account to join the talent network"}
              </p>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {error && <div className="fade-in" style={{ color: "#fca5a5", fontSize: "0.875rem", textAlign: "left", background: "rgba(239, 68, 68, 0.08)", padding: "1rem", borderRadius: "14px", border: "1px solid rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", gap: "0.75rem" }}><AlertCircle size={18} />{error}</div>}
              {success && <div className="fade-in" style={{ color: "#86efac", fontSize: "0.875rem", textAlign: "left", background: "rgba(34, 197, 94, 0.08)", padding: "1rem", borderRadius: "14px", border: "1px solid rgba(34, 197, 94, 0.15)", display: "flex", alignItems: "center", gap: "0.75rem" }}><CheckCircle2 size={18} />{success}</div>}

              {!isLogin && (
                <div className="input-focus" style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", transition: "all 0.3s" }}>
                  <User size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "14px 14px 14px 3.25rem", background: "transparent", border: "none", color: "white", outline: "none", fontSize: "0.95rem" }}
                  />
                </div>
              )}

              <div className="input-focus" style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", transition: "all 0.3s" }}>
                <Mail size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "14px 14px 14px 3.25rem", background: "transparent", border: "none", color: "white", outline: "none", fontSize: "0.95rem" }}
                />
              </div>

              <div className="input-focus" style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", transition: "all 0.3s" }}>
                <Lock size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "14px 4rem 14px 3.25rem", background: "transparent", border: "none", color: "white", outline: "none", fontSize: "0.95rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", padding: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                >{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>

              {!isLogin && (
                <div className="input-focus" style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", transition: "all 0.3s" }}>
                  <ShieldCheck size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: "100%", padding: "14px 14px 14px 3.25rem", background: "transparent", border: "none", color: "white", outline: "none", appearance: "none", fontSize: "0.95rem", cursor: "pointer" }}
                  >
                    <option value="member" style={{ background: "#1e293b" }}>Developer Member</option>
                    <option value="manager" style={{ background: "#1e293b" }}>Project Manager</option>
                    <option value="admin" style={{ background: "#1e293b" }}>Administrator</option>
                  </select>
                  <div style={{ position: "absolute", right: "1.25rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgba(255,255,255,0.3)" }} />
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-glow" style={{
                width: "100%",
                padding: "16px",
                background: "white",
                color: "#0a0a0c",
                border: "none",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                marginTop: "1rem"
              }}>
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                {!loading && <ArrowRight size={20} />}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      const newIsLogin = !isLogin;
                      setIsLogin(newIsLogin);
                      navigate(newIsLogin ? "/login" : "/register");
                    }}
                    style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 600, cursor: "pointer", padding: 0 }}
                  >
                    {isLogin ? "Register" : "Sign In"}
                  </button>
                </p>
              </div>
            </form>

            <div style={{ marginTop: "3.5rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2rem" }}>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em" }}>
                SKILLSYNC <span style={{ color: "#6366f1" }}>CORE AI</span> v2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
var stdin_default = AuthPage;
export {
  stdin_default as default
};
