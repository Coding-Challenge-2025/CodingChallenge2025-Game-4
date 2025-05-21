import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/authContext";
import Login from "./pages/Login";
import Game from "./pages/Game";
import WaitingRoom from "./pages/WaitingRoom";
import HostDashboard from "./pages/HostDashBoard";
import Audience from "./pages/Audience";
import Showcase from "./pages/Showcase";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log("User is not authenticated");
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/audience" element={<Audience />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route
            path="/game"
            element={
              // <ProtectedRoute>
                <Game />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/waiting-room"
            element={
              <ProtectedRoute>
                <WaitingRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host-dashboard"
            element={
              <ProtectedRoute>
                <HostDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
