import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListEvaluation from "./components/ListEvaluation";
import Evaluation from "./components/Evaluation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListEvaluation />} />
        <Route path="/evaluations/:id" element={<Evaluation />} />
      </Routes>
    </BrowserRouter>
  );
}
