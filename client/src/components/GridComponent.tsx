import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

// 📝 NOTE: READ THE color-palette-test.css FILE FOR PALETTE PREVIEW
const Grid = ({grid}:{grid: number[][]}) => {
  // Colors for values 1 to 9
  const valueColors = [
    "#4600e8",
    "#256486",
    "#2bf2f9",
    "#b5eaf5",
    "#693421",
    "#ecad32",
    "#f8cd83",
    "#d92517",
    "#f2f2f2",
    "#41e590",
  ];

  const gap = 1; // Space between blocks

  // State to track the currently clicked block's coordinates
  const [clickedCoord, setClickedCoord] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  // Explicitly type the cubes array as React.ReactNode[]
  const cubes: React.ReactNode[] = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      const value = grid?.[y]?.[x] ?? 0; // Get the value from the array
      const color = valueColors[value]; // Map value to color (1-based to 0-based index)
      const isClicked = clickedCoord && clickedCoord.x === x && clickedCoord.y === y && clickedCoord.visible;
      cubes.push(
        <mesh
          key={`${x}-${y}`}
          position={[x * gap, (9 - y) * gap, 0]} // Top-left as origin: (x=0, y=9) at (0,0,0)
          onClick={() => {
            // Toggle visibility: if clicking the same block, hide; otherwise, show new block
            if (isClicked) {
              setClickedCoord(null);
            } else {
              setClickedCoord({ x, y, visible: true });
            }
          }}
        >
          <RoundedBox args={[1, 1, 1]} radius={0.2} smoothness={4}>
            <meshLambertMaterial
              color={color as unknown as THREE.Color}
              transparent={true}
              opacity={1}
              emissive={isClicked ? color as unknown as THREE.Color : "#000000"} // Brighten clicked block
              emissiveIntensity={isClicked ? 0.5 : 0} // Adjust brightness
            />
          </RoundedBox>
        </mesh>
      );
    }
  }

  // Add axes with labels
  const xAxisLabels: React.ReactNode[] = [];
  const yAxisLabels: React.ReactNode[] = [];
  for (let i = 0; i < 10; i++) {
    // X-axis labels (top edge)
    xAxisLabels.push(
      <Text
        key={`x-${i}`}
        position={[i * gap, 9 * gap + 0.8, 0]} // Position above top row (y=9)
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {i}
      </Text>
    );
    // Y-axis labels (left edge)
    yAxisLabels.push(
      <Text
        key={`y-${i}`}
        position={[-0.8, (9 - i) * gap, 0]} // Position to the left of x=0, closer to edge
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {i}
      </Text>
    );
  }

  return (
    <group rotation={[0, THREE.MathUtils.degToRad(12), 0]}>
      {cubes}
      {xAxisLabels}
      {yAxisLabels}
      {clickedCoord && clickedCoord.visible && (
        <Text
          position={[
            clickedCoord.x * gap,
            (9 - clickedCoord.y) * gap, // Above the block, adjusted for new Y mapping
            0.6
          ]}
          fontSize={0.3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          ({clickedCoord.x}, {clickedCoord.y})
        </Text>
      )}
    </group>
  );
};

const CameraSetup = ({
  left,
  front,
  top,
}: {
  left: number;
  front: number;
  top: number;
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<null>(null);

  useEffect(() => {
    // Set camera position based on props
    camera.position.set(left, front, top); // Position along Z-axis
    camera.lookAt(4.5, 4.5, 0); // Look at the center of the grid (adjusted for new origin)
    if (controlsRef.current) {
      (controlsRef.current as any).target.set(4.5, 4.5, 0); // Ensure OrbitControls targets the center
      (controlsRef.current as any).update();
    }
  }, [camera, left, front, top]);

  return <OrbitControls ref={controlsRef} minDistance={10} maxDistance={30} />;
};

const GridComponent = ({grid = []}:{grid: number[][]}) => {
  const [left, setLeft] = useState(5);
  const [front, setFront] = useState(5);
  const [top, setTop] = useState(10); // Camera positioned along Z-axis

  return (
    <>
      <Canvas
        camera={{ position: [left, front, top], fov: 60 }}
        style={{ height: "100%", width: "100%", background: "#f8e7ca" }}
      >
        {/* Ambient light for overall illumination, increased intensity */}
        <ambientLight intensity={1} />
        {/* Directional light for full lighting, increased intensity */}
        <directionalLight position={[5, 10, 5]} intensity={1.0} />
        <directionalLight position={[-5, 10, -5]} intensity={0.8} />
        <Grid grid={grid}/>
        <CameraSetup left={left} front={front} top={top} />
      </Canvas>

      <input
        type="number"
        value={left}
        onChange={(e) => {
          setLeft(parseInt(e.target.value));
        }}
      />
      <input
        type="number"
        value={front}
        onChange={(e) => {
          setFront(parseInt(e.target.value));
        }}
      />
      <input
        type="number"
        value={top}
        onChange={(e) => {
          setTop(parseInt(e.target.value));
        }}
      />
    </>
  );
};

export default GridComponent;