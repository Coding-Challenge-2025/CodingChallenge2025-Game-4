import GridComponent from "../components/GridComponent";
import {useState} from "react"

export default function Audience() {
  const [player1Grid, setPlayer1Grid] = useState([]);
  const [player2Grid, setPlayer2Grid] = useState([]);
  const [player3Grid, setPlayer3Grid] = useState([]);
  const [player4Grid, setPlayer4Grid] = useState([]);
  
  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-2 h-screen">
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">Player 1</h2>
          <GridComponent grid={player1Grid}/>
        </div>
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">Player 1</h2>
          <GridComponent grid={player1Grid}/>
        </div>
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">Player 1</h2>
          <GridComponent grid={player1Grid}/>
        </div>
        <div className="relative">
          <h2 className="text-xl text-black font-bold absolute top-0 left-1 z-20">Player 1</h2>
          <GridComponent grid={player1Grid}/>
        </div>
      </div>
    </div>
  );
}
