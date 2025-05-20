/**
 * Code templates for different programming languages in VoxelCode
 */

// Python code template
export const PYTHON_TEMPLATE = `N= 10  # Size of the grid

# Modify the grid to create a specific shape
def generate_shape(grid):
    """
    Example:
    for i in range(N):
        for j in range(N):
            grid[i][j] = (i + j) % 2  # Example pattern
    """
    pass  # Replace with actual logic

# Do not modify the code below
def main():
    shape = [[0 for _ in range(N)] for _ in range(N)]  # Initialize a 10x10 grid with zeros
    generate_shape(shape)  # Call the function to modify the grid

    # Print the grid
    for row in shape:
        print(' '.join(str(cell) for cell in row))

if __name__ == "__main__":
    main()
`

// C++ code template
export const CPP_TEMPLATE = `#include <iostream>
#include <vector>
using namespace std;

const int N = 10; // Size of the grid

// Modify the grid to create a specific shape
void generate_shape(vector<vector<int>>& grid) {
    /*
        Example: 
        for (int i = 0; i < N; ++i) {
            for (int j = 0; j < N; ++j) {
                grid[i][j] = (i + j) % 2; // Example pattern
            }
        }
    */

    // Replace with your own logic to create a specific shape
}

// Do not modify the code below
int main() {
    vector<vector<int>> shape(N, vector<int>(N, 0)); // Initialize a 10x10 grid with zeros
    generate_shape(shape); // Call the function to modify the grid

    // Print the grid
    for (const auto& row : shape) {
        for (int cell : row) {
            cout << cell << ' ';
        }
        cout << '\\n';
    }
    return 0;
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

