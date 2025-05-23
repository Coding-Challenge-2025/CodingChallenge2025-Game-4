import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Game from "./pages/Game";
import WaitingRoom from "./pages/WaitingRoom";
import HostDashboard from "./pages/HostDashBoard";
import Audience from "./pages/Audience";
import LoadingScreen from "./components/host-dashboard/LoadingScreen";

const AuthenticatedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
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
          <Route
            path="/waiting-room"
            element={
              <AuthenticatedRoute>
                <WaitingRoom />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/host-dashboard"
            element={
              <AuthenticatedRoute>
                <HostDashboard />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/game"
            element={
              <AuthenticatedRoute>
                <Game />
              </AuthenticatedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
