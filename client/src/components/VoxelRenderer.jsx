import { useEffect, useRef } from "react";

const COLORS = [
  null, // 0 is empty
  "#FF5252", // 1: Red
  "#4285F4", // 2: Blue
  "#0F9D58", // 3: Green
  "#FFEB3B", // 4: Yellow
  "#9C27B0", // 5: Purple
  "#FF9800", // 6: Orange
  "#E91E63", // 7: Pink
];

export default function VoxelRenderer({ shape }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current  
    if (!canvas || !shape || shape.length === 0) return

    const ctx = canvas.getContext("2d") 
    const width = canvas.width
    const height = canvas.height  

    ctx.clearRect(0, 0, width, height)

    // Calculate the size of each voxel based on the canvas size and grid size
    const gridSize = shape.length  
    const voxelSize = Math.min(width, height) / (gridSize * 1.2)

    // Calculate the offset to center the grid in the canvas
    const originX = width / 2
    const originY = height / 3
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const colorIndex = shape[y][x]
        if (colorIndex <= 0) continue; // Skip empty voxels

        const isoX = originX + (x - y) * voxelSize * 0.5
        const isoY = originY + (x + y) * voxelSize * 0.25

        // Draw the voxel
        drawIsometricVoxel(ctx, isoX, isoY, voxelSize, COLORS[colorIndex])
      }
    }
  }, [shape])

  // Function to draw a single isometric voxel
  const drawIsometricVoxel = (ctx, x, y, size, color) => {
    const halfSize = size / 2

    // Top face (diamond)
    ctx.beginPath()
    ctx.moveTo(x, y - halfSize * 0.5)
    ctx.lineTo(x + halfSize, y)
    ctx.lineTo(x, y + halfSize * 0.5)
    ctx.lineTo(x - halfSize, y)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1
    ctx.stroke()

    // Left face
    ctx.beginPath()
    ctx.moveTo(x - halfSize, y)
    ctx.lineTo(x, y + halfSize * 0.5)
    ctx.lineTo(x, y + size)
    ctx.lineTo(x - halfSize, y + halfSize * 1.5)
    ctx.closePath()
    ctx.fillStyle = darkenColor(color, 0.2)
    ctx.fill()
    ctx.stroke()

    // Right face
    ctx.beginPath()
    ctx.moveTo(x + halfSize, y)
    ctx.lineTo(x, y + halfSize * 0.5)
    ctx.lineTo(x, y + size)
    ctx.lineTo(x + halfSize, y + halfSize * 1.5)
    ctx.closePath()
    ctx.fillStyle = darkenColor(color, 0.4)
    ctx.fill()
    ctx.stroke()
  }

  // Helper function to darken a color
  const darkenColor = (color, amount) => {
    const hex = color.replace("#", "")
    let r = Number.parseInt(hex.substring(0, 2), 16)
    let g = Number.parseInt(hex.substring(2, 4), 16)
    let b = Number.parseInt(hex.substring(4, 6), 16)

    r = Math.max(0, Math.floor(r * (1 - amount)))
    g = Math.max(0, Math.floor(g * (1 - amount)))
    b = Math.max(0, Math.floor(b * (1 - amount)))

    return `rgb(${r}, ${g}, ${b})`
  }

  // Update the canvas size to be larger
  return <canvas ref={canvasRef} width={500} height={400} className="w-full h-full" />
}
