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
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword.jsx";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);


  return (
    <BrowserRouter>
      {/* onOpenLogin este callback-ul pe care îl vor folosi componentele din app */}
      <AuthProvider onOpenLogin={() => setLoginOpen(true)} onOpenSignup={() => setSignupOpen(true)}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/discipline/romana/evaluari" element={<ListEvaluation />} />
            <Route path="/discipline/romana/teme"     element={<ListTopics />} />
            <Route path="/topics/:id"      element={<Topic />} />
            <Route path="/evaluations/:id" element={<Evaluation />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
          </Route>
        </Routes>

        {/* modalul de Log in controlat din App */}
        {loginOpen && (
          <Login
            onClose={() => setLoginOpen(false)}
            onSuccess={() => setLoginOpen(false)}
            onOpenSignup={() => {        // <-- important: închide login și deschide register
              setLoginOpen(false);
              setSignupOpen(true);
            }}
            onOpenForgot={() => { 
              setLoginOpen(false); 
              setForgotOpen(true); 
            }}
          />
        )}

        {signupOpen && (
          <Register
            onClose={() => setSignupOpen(false)}
            onSuccess={() => setSignupOpen(false)}
            onOpenLogin={() => {         // opțional: link „Have an account? Log in”
              setSignupOpen(false);
              setLoginOpen(true);
            }}
          />
        )}
        {forgotOpen && (
          <ForgotPassword
            onClose={() => setForgotOpen(false)}
          />
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}
