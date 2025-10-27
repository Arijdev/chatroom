import React, { useEffect, useRef, useState } from "react";
import Settings from "./pages/Settings.jsx";
import Chat from "./pages/Chat.jsx";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}