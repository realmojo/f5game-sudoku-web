import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { Game } from "./components/Game";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game">
          <Route path="sudoku/:type" element={<Game />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
