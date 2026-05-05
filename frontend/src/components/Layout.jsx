import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  if (!isAuthenticated || isAuthPage) {
    return <>{children}</>;
  }
  return <div className="app-layout"><Sidebar /><main className="main-content"><div className="fade-in">{children}</div></main></div>;
};
export default Layout;