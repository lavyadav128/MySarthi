import { useEffect, useState } from "react";

// Safely parse JSON
const safeJSONParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// Decode JWT payload (no verification – frontend only)
const decodeJWT = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

function useAuth() {
  const [token, setToken] = useState(undefined); // undefined = loading
  const [user, setUser] = useState(undefined);   // undefined = loading

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setToken(storedToken || null);
    setUser(safeJSONParse(storedUser));
  }, []);

  /* ---------- TOKEN PERSISTENCE ---------- */
  useEffect(() => {
    if (token === undefined) return;

    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  /* ---------- USER PERSISTENCE ---------- */
  useEffect(() => {
    if (user === undefined) return;

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  /* ---------- TOKEN EXPIRY CHECK ---------- */
  useEffect(() => {
    if (!token) return;

    const decoded = decodeJWT(token);
    if (!decoded?.exp) return;

    const expiresAt = decoded.exp * 1000;
    if (Date.now() >= expiresAt) {
      logout(); // auto logout on expiry
    }
  }, [token]);

  /* ---------- CROSS-TAB SYNC ---------- */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setToken(e.newValue);
      if (e.key === "user") setUser(safeJSONParse(e.newValue));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (token, user) => {
    if (!token || !user) return;
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading: token === undefined || user === undefined,
    login,
    logout,
  };
}

export default useAuth;
