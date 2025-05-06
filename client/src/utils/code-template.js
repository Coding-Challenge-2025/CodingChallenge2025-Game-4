/**
 * Code templates for different programming languages in VoxelCode
 */

// Python code template
export const PYTHON_TEMPLATE = `def generate_shape():
    grid = [[0 for _ in range(5)] for _ in range(5)]
    for i in range(5):
        grid[i][i] = 1

    return grid

def main():
    shape = generate_shape()
    for row in shape:
        print(' '.join(map(str, row)))

if __name__ == "__main__":
    main()
`

// C++ code template
export const CPP_TEMPLATE = `#include <iostream>
#include <vector>
using namespace std;

// Modify this function to generate the desired shape
vector<vector<int>> generate_shape() {
    vector<vector<int>> grid(5, vector<int>(5, 0));
    for (int i = 0; i < 5; i++) grid[i][i] = 1;

    return grid;
}

int main() {
    auto shape = generate_shape();
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

