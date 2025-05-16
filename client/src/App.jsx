import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import WaitingRoom from "./pages/WaitingRoom";
import HostDashboard from "./pages/HostDashBoard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
