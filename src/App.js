import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListEvaluation from "./components/ListEvaluation";
import Topic from "./components/Topic";
import Home from "./pages/Home"
import ListTopics from "./components/ListTopics";
import Evaluation from "./components/Evaluation";
import AppLayout from "./pages/AppLayout"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<ListEvaluation />} /> */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home/>} />
          <Route path="/discipline/romana/evaluari" element={<ListEvaluation/>} />
          <Route path="/discipline/romana/teme"     element={<ListTopics/>} />
          {/* <Route path="/" element={<ListTopics />} /> */}
          <Route path="/topics/:id" element={<Topic />} />
          <Route path="/evaluations/:id" element={<Evaluation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
