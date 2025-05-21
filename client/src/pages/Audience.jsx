import GridComponent from "../components/GridComponent";
import { useState } from "react";

export default function Audience() {
  const [player1Grid, setPlayer1Grid] = useState([
    [2, 1, 1, 1, 1, 6, 7, 8, 9],
    [2, 1, 1, 1, 1, 6, 7, 8, 9],
    [1, 2, 1, 1, 1, 6, 7, 8, 9],
    [1, 1, 2, 1, 1, 6, 7, 8, 9],
    [1, 1, 1, 2, 1, 6, 7, 8, 9],
    [1, 1, 1, 1, 2, 6, 7, 8, 9],
    [1, 1, 1, 1, 2, 6, 7, 8, 9],
    [1, 1, 1, 1, 2, 6, 7, 8, 9],
    [1, 1, 1, 1, 2, 6, 7, 8, 9],
    [1, 1, 1, 1, 2, 6, 7, 8, 9],
  ]);
  const [player2Grid, setPlayer2Grid] = useState([
    [1, 1, 1, 0, 3, 6, 7, 8, 9],
    [1, 4, 2, 5, 3, 6, 0, 8, 9],
    [1, 0, 7, 3, 3, 6, 7, 8, 9],
    [1, 1, 3, 0, 3, 6, 7, 8, 9],
    [1, 1, 1, 3, 3, 6, 7, 8, 9],
    [1, 1, 1, 1, 3, 6, 7, 0, 9],
    [1, 1, 1, 1, 3, 6, 7, 8, 9],
    [1, 1, 1, 1, 3, 6, 7, 8, 9],
    [1, 1, 1, 1, 3, 6, 7, 8, 0],
    [1, 1, 1, 1, 3, 6, 7, 8, 9],
  ]);

  const [player3Grid, setPlayer3Grid] = useState([
    [1, 1, 4, 0, 4, 6, 7, 8, 9],
    [1, 2, 4, 5, 4, 6, 0, 8, 9],
    [1, 0, 7, 4, 4, 6, 7, 8, 9],
    [1, 1, 4, 0, 4, 6, 7, 8, 9],
    [1, 1, 1, 4, 4, 6, 7, 8, 9],
    [1, 1, 1, 1, 4, 6, 7, 0, 9],
    [1, 1, 1, 1, 4, 6, 7, 8, 9],
    [1, 1, 1, 1, 4, 6, 7, 8, 9],
    [1, 1, 1, 1, 4, 6, 7, 8, 0],
    [1, 1, 1, 1, 4, 6, 7, 8, 9],
  ]);

  const [player4Grid, setPlayer4Grid] = useState([
    [1, 1, 5, 0, 5, 6, 7, 8, 9],
    [1, 2, 5, 3, 5, 6, 0, 8, 9],
    [1, 0, 7, 5, 5, 6, 7, 8, 9],
    [1, 1, 5, 0, 5, 6, 7, 8, 9],
    [1, 1, 1, 5, 5, 6, 7, 8, 9],
    [1, 1, 1, 1, 5, 6, 7, 0, 9],
    [1, 1, 1, 1, 5, 6, 7, 8, 9],
    [1, 1, 1, 1, 5, 6, 7, 8, 9],
    [1, 1, 1, 1, 5, 6, 7, 8, 0],
    [1, 1, 1, 1, 5, 6, 7, 8, 9],
  ]);

  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-2 h-screen">
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
            Player 1
          </h2>
          <GridComponent grid={player1Grid} />
        </div>
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
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
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
            Player 4
          </h2>
          <GridComponent grid={player4Grid} />
        </div>
      </div>
    </div>
  );
}
