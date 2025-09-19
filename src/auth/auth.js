// auth/auth.js
import { createContext, useContext, useEffect, useState } from "react";
import api, { bootCsrf } from "../routes/api";

const AuthCtx = createContext(null);
const STORAGE_KEY = "auth:user";

function readUser() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; }
  catch { return null; }
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
    // păstrează dacă ai nevoie de CSRF (Sanctum)
    try { await bootCsrf(); } catch {}
    const { data } = await api.post("/api/login", payload); // sau "/login" dacă folosești web guard
    const user = data?.user ?? data; // în caz că ai { user: {...} } sau direct userul
    setMe(user);
    writeUser(user);
    return user;
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
