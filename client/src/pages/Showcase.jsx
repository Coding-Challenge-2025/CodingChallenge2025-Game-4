import { useState } from "react";
import GridComponent from "../components/GridComponent";
import { Grid } from "@react-three/drei";

export default function Showcase() {
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
    <div className="grid grid-rows-2 grid-cols-4 w-screen h-screen">
      <div className="main-shape col-span-4 relative">
        <button className="px-3 py-1 text-lg rounded-md text-white bg-blue-600 font-bold p-6 absolute z-20 m-4">Prev</button>
        <button className="px-3 py-1 text-lg rounded-md text-white bg-blue-600 font-bold p-6 absolute right-0 z-20 m-4">Prev</button>
        <GridComponent grid={player1Grid} />
      </div>

      <div className="relative">
        <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
          Player 1
        </h2>
        <GridComponent grid={player1Grid} />
        <h2 className="text-xl text-red-500 font-bold absolute bottom-4 left-[40%]"> 20 points</h2>
      </div>
      <div className="relative">
        <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
          Player 2
        </h2>
        <GridComponent grid={player2Grid} />
        <h2 className="text-xl text-red-500 font-bold absolute bottom-4 left-[40%]"> 20 points</h2>
      </div>
      <div className="relative">
        <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
          Player 3
        </h2>
        <GridComponent grid={player3Grid} />
        <h2 className="text-xl text-red-500 font-bold absolute bottom-4 left-[40%]"> 20 points</h2>
      </div>
      <div className="relative">
        <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">
          Player 4
        </h2>
        <GridComponent grid={player4Grid} />
        <h2 className="text-xl text-red-500 font-bold absolute bottom-4 left-[40%]"> 20 points</h2>
      </div>
    </div>
  );
}
