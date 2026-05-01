import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import GestureControl from "./pages/GestureControl";
import Home from "./pages/Home";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const protectedRoute = (element) => (
    isAuthenticated ? element : <Navigate to="/login" replace />
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home setIsAuthenticated={setIsAuthenticated} />}
        />

        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />

        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={protectedRoute(<Dashboard />)} />
        <Route path="/profile" element={protectedRoute(<Profile />)} />
        <Route path="/notifications" element={protectedRoute(<Notifications />)} />
        <Route path="/settings" element={protectedRoute(<Settings />)} />
        <Route path="/gesture" element={protectedRoute(<GestureControl />)} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
