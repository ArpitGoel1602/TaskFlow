
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export default AuthContext;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  async function login(email, password) {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return data;
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      return data;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}