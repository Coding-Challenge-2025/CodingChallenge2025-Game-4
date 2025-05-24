import { useState, useEffect } from "react";
import GridComponent from "../components/GridComponent";

export default function Showcase() {
  const [player1Grid, setPlayer1Grid] = useState([]);
  const [player2Grid, setPlayer2Grid] = useState([]);
  const [player3Grid, setPlayer3Grid] = useState([]);
  const [player4Grid, setPlayer4Grid] = useState([]);
  
  const [mainGrid, setMainGrid] = useState([]);

  const [shapeId, setShapeId] = useState(1);

  const nextShape = () => {
    if (shapeId === 4) {
      window.location.href = "/leaderboard";
      return;
    };
    
    setShapeId((prev) => (prev === 4 ? 4 : prev + 1));

    setVisibleGrids({
      main: true, // Main shape is always visible
      player1: false,
      player2: false,
      player3: false,
      player4: false,
    });
  };

  const prevShape = () => {
    setShapeId((prev) => (prev === 1 ? 1 : prev - 1));

    setVisibleGrids({
      main: true, // Main shape is always visible
      player1: false,
      player2: false,
      player3: false,
      player4: false,
    });
  };

  useEffect(() => {
    const fetchGridData = async (userId, setter) => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/audience/showcase?shapeId=${shapeId}&userId=${userId}`
        );
        const data = await response.json();
        setter(data.outputShape); // assuming `data.grid` is a 2D array
      } catch (err) {
        console.error(`Error fetching grid for user ${userId}:`, err);
      }
    };
    
    const fetchMainGridData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/shape/${shapeId}`
        );
        const data = await response.json();
        setMainGrid(data.shape.matrix); // assuming `data.grid` is a 2D array
      } catch (err) {
        console.error("Error fetching main grid:", err);
      }
    };

    fetchGridData(1, setPlayer1Grid);
    fetchGridData(2, setPlayer2Grid);
    fetchGridData(3, setPlayer3Grid);
    fetchGridData(4, setPlayer4Grid);
    
    fetchMainGridData();
    
  }, [shapeId]);

  // State to manage visibility of each player's grid
  const [visibleGrids, setVisibleGrids] = useState({
    main: true, // Main shape is always visible
    player1: false,
    player2: false,
    player3: false,
    player4: false,
  });

  // Handle keypress events to toggle grid visibility
  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case "1":
          setVisibleGrids((prev) => ({ ...prev, player1: !prev.player1 }));
          break;
        case "2":
          setVisibleGrids((prev) => ({ ...prev, player2: !prev.player2 }));
          break;
        case "3":
          setVisibleGrids((prev) => ({ ...prev, player3: !prev.player3 }));
          break;
        case "4":
          setVisibleGrids((prev) => ({ ...prev, player4: !prev.player4 }));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="grid grid-rows-2 grid-cols-4 w-screen h-screen">
      <div className="main-shape col-span-4 relative">
        <button
          className="px-3 py-1 text-lg rounded-md text-white bg-blue-600 font-bold p-6 absolute z-20 m-4"
          onClick={prevShape}
        >
          Prev
        </button>
        <button
          className="px-3 py-1 text-lg rounded-md text-white bg-blue-600 font-bold p-6 absolute right-0 z-20 m-4"
          onClick={nextShape}
        >
          Next
        </button>
        {visibleGrids.main && <GridComponent grid={mainGrid} />}
      </div>

      <div className="relative p-8 bg-[#f8e7ca]">
        <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
          Player 1
        </h2>
        {visibleGrids.player1 ? (
          <>
            <GridComponent grid={player1Grid} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Press '1' to reveal
          </div>
        )}
      </div>
      <div className="relative p-8 bg-[#f8e7ca]">
        <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
          Player 2
        </h2>
        {visibleGrids.player2 ? (
          <>
            <GridComponent grid={player2Grid} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Press '2' to reveal
          </div>
        )}
      </div>
      <div className="relative p-8 bg-[#f8e7ca]">
        <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
          Player 3
        </h2>
        {visibleGrids.player3 ? (
          <>
            <GridComponent grid={player3Grid} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Press '3' to reveal
          </div>
        )}
      </div>
      <div className="relative p-8 bg-[#f8e7ca]">
        <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
          Player 4
        </h2>
        {visibleGrids.player4 ? (
          <>
            <GridComponent grid={player4Grid} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Press '4' to reveal
          </div>
        )}
      </div>
    </div>
  );
}
