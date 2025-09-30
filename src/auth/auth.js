// auth/auth.js
import { createContext, useContext, useEffect, useState } from "react";
import { extractErrorMessage } from "../utils/http";
import api, { bootCsrf } from "../routes/api";

const AuthCtx = createContext(null);
const STORAGE_KEY = "auth:user";
const STUDENT_ID_KEY = "auth.student_id";

function readUser() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return null;

    const data = JSON.parse(s);
    return isValidUser(data) ? data : null;
  } catch {
    return null;
  }
}

function isValidUser(x) {
  //  console.log("x",x)
  if (!x || typeof x !== "object") return false;

  // filtrează cazurile de eroare stocate în cache
  if (x.status === 401) return false;
  if (typeof x.message === "string" &&
      x.message.toLowerCase().includes("invalid credentials")) {
    return false;
  }

  // reguli minime pentru un "user" valid
  const hasId = typeof x.id === "number" && x.id > 0;
  const hasEmail =
    x.email == null || (typeof x.email === "string" && x.email.includes("@"));

  //console.log("hasId",hasId)
  return hasId && hasEmail;
}

function writeUser(user) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children, onOpenLogin }) {
  // Rehidratează din localStorage
  const [me, setMe] = useState(() => readUser());

  // Interceptor 401: dacă sesiunea server a expirat, curățăm clientul
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          setMe(null);
          writeUser(null);
          onOpenLogin?.();
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [onOpenLogin]);

  // Sync între taburi/ferestre
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setMe(readUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Login: apelează endpointul tău (care returnează user) și persistă local
  const login = async (payload) => {
    try {
      try { await bootCsrf(); } catch {}
      const { data } = await api.post("/api/login", payload); // sau "/login" dacă folosești web guard
      
      if (data?.status === 401) {
        return { ok: false, message: extractErrorMessage(data) };
      }
        
      const user = data?.user ?? data; // în caz că ai { user: {...} } sau direct userul
      setMe(user);
      writeUser(user);
      // salvează student_id (din roleId)
      if (typeof data?.roleId !== "undefined") {
        localStorage.setItem(STUDENT_ID_KEY, String(data.roleId));
      } else {
        localStorage.removeItem(STUDENT_ID_KEY);
      }
      return user;
    } catch (err) {
      return { ok: false, message: extractErrorMessage(err) };
    }
  };

  // Logout: opțional lovește serverul, dar oricum curăță localStorage
  const logout = async () => {
    try { await api.post("/api/logout"); } catch {}
    setMe(null);
    writeUser(null);
  };

  const requireAuth = () => {
    if (me?.id) return true;
    onOpenLogin?.();
    return false;
  };

  return (
    <AuthCtx.Provider value={{ me, setMe, login, logout, requireAuth }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
