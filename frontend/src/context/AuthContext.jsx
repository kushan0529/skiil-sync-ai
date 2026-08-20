import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, loginSuccess, logout as logoutAction } from "../store/slices/authSlice";
const AuthContext = createContext(void 0);
const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  const login = (token, userData) => {
    dispatch(loginSuccess({ token, user: userData }));
  };
  const logout = () => {
    dispatch(logoutAction());
  };
  return <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>{children}</AuthContext.Provider>;
};
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export {
  AuthProvider,
  useAuth
};

