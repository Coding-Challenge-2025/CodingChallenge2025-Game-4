import GridComponent from "../components/GridComponent";
import { useEffect, useState } from "react";

const baseURL =
  import.meta.env.VITE_ENV === "production"
    ? import.meta.env.VITE_PROD_BACKEND_HTTP
    : import.meta.env.VITE_BACKEND_HTTP ?? "http://localhost:3000";

export default function Audience() {
  const [countdown, setCountdown] = useState(100);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Pull time or other stuff
  useEffect(() => {
    let timer;
    const fetchStartTime = async () => {
      try {
        const response = await fetch(
          new URL("api/audience/startTime", baseURL)
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch start time, defaulting to 100 seconds."
          );
          setCountdown(100);
          return;
        } else {
          const data = await response.json();
          console.log("Fetched start time data:", data.startTime);

          const startTime = data.startTime; // Default to 100 seconds if not provided
          const now = Date.now(); // Current time in ms

          const elapsedSeconds = Math.floor((now - parseInt(startTime)) / 1000);
          console.log("Elapsed seconds since start:", elapsedSeconds);
          const remainingSeconds = Math.max(
            0,
            import.meta.env.VITE_GAME_DURATION - elapsedSeconds
          );

          setCountdown(remainingSeconds);
        }
      } catch (error) {
        console.error("Error setting time limit:", error);
      }
    };

    fetchStartTime();

    timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // clean up interval
  }, []);

  const [player1Grid, setPlayer1Grid] = useState([]);

  const [player2Grid, setPlayer2Grid] = useState([]);

  const [player3Grid, setPlayer3Grid] = useState([]);

  const [player4Grid, setPlayer4Grid] = useState([]);

  // Fetch player grids every 2 seconds
  const baseURL =
    import.meta.env.VITE_ENV === "production"
      ? import.meta.env.VITE_PROD_BACKEND_HTTP
      : import.meta.env.VITE_BACKEND_HTTP ?? "http://localhost:3000";

  useEffect(() => {
    const fetchPlayerGrids = async () => {
      for (let id = 1; id <= 4; id++) {
        try {
          const response = await fetch(`${baseURL}/api/audience/${id}`);
          if (!response.ok) {
            console.log(
              `Failed to fetch data for player ${id} but it's all good, continuing...`
            );
            continue;
          }
          const data = await response.json();

          console.log(`Player ${id} grid data:`, data);

          // Assuming the API returns a grid in the format { grid: [...] }
          const grid = data.currentShape || [];
          if (Array.isArray(grid) && grid.length > 0) {
            switch (id) {
              case 1:
                setPlayer1Grid(grid);
                break;
              case 2:
                setPlayer2Grid(grid);
                break;
              case 3:
                setPlayer3Grid(grid);
                break;
              case 4:
                setPlayer4Grid(grid);
                break;
              default:
                break;
            }
          }
        } catch (error) {
          console.error(`Error fetching grid for player ${id}:`, error);
        }
      }
    };

    // Initial fetch
    fetchPlayerGrids();

    // Set up interval to fetch every 2 seconds
    const interval = setInterval(fetchPlayerGrids, 2000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-2 h-screen relative">
        <div className="text-2xl rounded p-2 absolute top-[50%] left-[50%] translate-[-50%] z-30 grid grid-cols-1 grid-rows-1">
          <p
            className={`text-center font-bold ${
              countdown > 60 ? "text-black" : "text-red-500"
            }`}
          >
            {formatTime(countdown)}
          </p>
          <img src="logo.png" alt="" className="w-48" />
          {countdown <= 0 && (
            <a
              href="/showcase"
              className="px-3 py-1 text-lg rounded-md text-white bg-blue-600 font-bold p-6 text-center"
            >
              Go to result page
            </a>
          )}
        </div>

        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
            Player 1
          </h2>
          <GridComponent grid={player1Grid} />
        </div>
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 right-1 z-20">
            Player 2
          </h2>
          <GridComponent grid={player2Grid} />
        </div>
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
            Player 3
          </h2>
          <GridComponent grid={player3Grid} />
        </div>
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 right-1 z-20">
            Player 4
          </h2>
          <GridComponent grid={player4Grid} />
        </div>
      </div>
    </div>
  );
}
