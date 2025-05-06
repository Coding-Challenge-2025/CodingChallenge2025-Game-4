// Function to generate a random target shape
export function generateTargetShape() {
  const gridSize = 10;
  const shape = Array(gridSize)
    .fill()
    .map(() => Array(gridSize).fill(0));

  // Generate a simple pattern
  const patterns = [
    generatePyramid,
    generateCross,
    generateSpiral,
    generateRandom,
  ];

  // Select a random pattern generator
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern(shape, gridSize);
}

// Generate a pyramid pattern
function generatePyramid(shape, size) {
  const center = Math.floor(size / 2);
  const height = Math.floor(size / 3);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distanceFromCenter = Math.max(
        Math.abs(x - center),
        Math.abs(y - center)
      );

      if (distanceFromCenter < height) {
        // Assign colors based on distance from center
        shape[y][x] = height - distanceFromCenter;
      }
    }
  }

  return shape;
}

// Generate a cross pattern
function generateCross(shape, size) {
  const center = Math.floor(size / 2);
  const width = Math.floor(size / 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Horizontal bar
      if (y >= center - width && y <= center + width) {
        shape[y][x] = 1 + (x % 7);
      }

      // Vertical bar
      if (x >= center - width && x <= center + width) {
        shape[y][x] = 1 + (y % 7);
      }
    }
  }

  return shape;
}

// Generate a spiral pattern
function generateSpiral(shape, size) {
  const center = Math.floor(size / 2);
  let x = center;
  let y = center;
  let direction = 0; // 0: right, 1: down, 2: left, 3: up
  let steps = 1;
  let stepCount = 0;
  let stepChange = 0;

  for (let i = 0; i < (size * size) / 2; i++) {
    shape[y][x] = 1 + (i % 7);

    // Move in the current direction
    switch (direction) {
      case 0:
        x++;
        break; // right
      case 1:
        y++;
        break; // down
      case 2:
        x--;
        break; // left
      case 3:
        y--;
        break; // up
    }

    stepCount++;

    // Change direction if needed
    if (stepCount === steps) {
      direction = (direction + 1) % 4;
      stepCount = 0;
      stepChange++;

      // Increase steps every 2 direction changes
      if (stepChange === 2) {
        steps++;
        stepChange = 0;
      }
    }

    // Stop if we go out of bounds
    if (x < 0 || x >= size || y < 0 || y >= size) {
      break;
    }
  }

  return shape;
}

// Generate a random pattern
function generateRandom(shape, size) {
  const numVoxels = Math.floor(size * size * 0.3); // Fill about 30% of the grid

  for (let i = 0; i < numVoxels; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const color = 1 + Math.floor(Math.random() * 7); // Random color 1-7

    shape[y][x] = color;
  }

  return shape;
}
