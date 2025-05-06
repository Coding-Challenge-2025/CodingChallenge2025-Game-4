/**
 * Code templates for different programming languages in VoxelCode
 */

// Python code template
export const PYTHON_TEMPLATE = `# Write your code here
# Example (Python):

def generate_shape():
    # Create a 10x10 grid with all empty voxels
    grid = [[0 for _ in range(10)] for _ in range(10)]
    
    # Add some colored voxels
    grid[3][3] = 1  # Red voxel at (3,3)
    grid[3][4] = 2  # Blue voxel at (3,4)
    grid[4][3] = 3  # Green voxel at (4,3)
    grid[4][4] = 4  # Yellow voxel at (4,4)
    
    return grid
`

// C++ code template
export const CPP_TEMPLATE = `// Write your code here
// Example (C++):

#include <vector>

std::vector<std::vector<int>> generateShape() {
    // Create a 10x10 grid with all empty voxels (value 0)
    std::vector<std::vector<int>> grid(10, std::vector<int>(10, 0));

    // Add some colored voxels
    grid[3][3] = 1; // Red voxel at (3,3)
    grid[3][4] = 2; // Blue voxel at (3,4)
    grid[4][3] = 3; // Green voxel at (4,3)
    grid[4][4] = 4; // Yellow voxel at (4,4)

    return grid;
}
`

// Function to get template based on language
export const getCodeTemplate = (language) => {
  switch (language.toLowerCase()) {
    case 'cpp':
      return CPP_TEMPLATE
    case 'python':
    default:
      return PYTHON_TEMPLATE
  }
}

