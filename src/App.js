import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/auth.js";       // <— providerul tău
import AppLayout from "./pages/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import ListEvaluation from "./components/ListEvaluation.jsx";
import ListTopics from "./components/ListTopics";
import Topic from "./components/Topic";
import Evaluation from "./components/Evaluation";
import Login from "./auth/Login.js";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <BrowserRouter>
      {/* onOpenLogin este callback-ul pe care îl vor folosi componentele din app */}
      <AuthProvider onOpenLogin={() => setLoginOpen(true)}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/discipline/romana/evaluari" element={<ListEvaluation />} />
            <Route path="/discipline/romana/teme"     element={<ListTopics />} />
            <Route path="/topics/:id"      element={<Topic />} />
            <Route path="/evaluations/:id" element={<Evaluation />} />
          </Route>
        </Routes>

        {/* modalul de Log in controlat din App */}
        {loginOpen && (
          <Login
            onClose={() => setLoginOpen(false)}
            onSuccess={() => setLoginOpen(false)}   // contextul deja are me
          />
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}
