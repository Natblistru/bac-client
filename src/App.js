import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListEvaluation from "./components/ListEvaluation";
import Topic from "./components/Topic";
import ListTopics from "./components/ListTopics";
import Evaluation from "./components/Evaluation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<ListEvaluation />} /> */}
        <Route path="/" element={<ListTopics />} />
        <Route path="/topics/:id" element={<Topic />} />
        <Route path="/evaluations/:id" element={<Evaluation />} />
      </Routes>
    </BrowserRouter>
  );
}
