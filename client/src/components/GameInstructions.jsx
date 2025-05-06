export default function GameInstructions() {
  return (
    <div className="py-4">
      <div className="space-y-5 text-gray-300">
        <section>
          <h3 className="text-lg font-semibold text-white mb-2">
            Game Objective
          </h3>
          <p>
            Write code to recreate the target voxel shape shown in the game
            view. Your goal is to match the exact pattern and colors of the
            target shape by generating a 2D grid of voxels.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-white mb-2">
            Voxel Grid System
          </h3>
          <p>
            Each voxel has coordinates (x, y) on a 2D grid and a color value
            from 1 to 7. A value of 0 or less indicates an empty voxel (not
            rendered).
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-white mb-1">Color Mapping:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-2"></span>{" "}
                  1 = Red
                </li>
                <li>
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-sm mr-2"></span>{" "}
                  2 = Blue
                </li>
                <li>
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-2"></span>{" "}
                  3 = Green
                </li>
                <li>
                  <span className="inline-block w-3 h-3 bg-yellow-400 rounded-sm mr-2"></span>{" "}
                  4 = Yellow
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">&nbsp;</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-sm mr-2"></span>{" "}
                  5 = Purple
                </li>
                <li>
                  <span className="inline-block w-3 h-3 bg-orange-500 rounded-sm mr-2"></span>{" "}
                  6 = Orange
                </li>
                <li>
                  <span className="inline-block w-3 h-3 bg-pink-500 rounded-sm mr-2"></span>{" "}
                  7 = Pink
                </li>
                <li>
                  <span className="inline-block w-3 h-3 border border-gray-500 rounded-sm mr-2"></span>{" "}
                  0 = Empty
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-white mb-2">
            Writing Your Code
          </h3>
          <p>
            You can write your solution in either Python or C++. Your code
            should generate and return a 2D grid (matrix) of integers
            representing the voxel colors.
          </p>

          <div className="mt-3 bg-gray-900 p-3 rounded-md">
            <h4 className="font-medium text-white mb-1">Python Example:</h4>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {`def generate_shape():
      # Create a 10x10 grid with all empty voxels
      grid = [[0 for _ in range(10)] for _ in range(10)]
      
      # Add some colored voxels
      grid[3][3] = 1  # Red voxel at (3,3)
      grid[3][4] = 2  # Blue voxel at (3,4)
      grid[4][3] = 3  # Green voxel at (4,3)
      grid[4][4] = 4  # Yellow voxel at (4,4)
      
      return grid
  
  # Return your shape
  generate_shape()`}
            </pre>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-white mb-2">Scoring</h3>
          <p>
            Your solution is scored based on how closely it matches the target
            shape. A perfect match scores 100%.
          </p>
        </section>

        <p className="text-xs text-gray-400 mt-4 border-t border-gray-700 pt-3">
          Note: In a real competition, your code would be executed on the
          server. This demo simulates code execution.
        </p>
      </div>
    </div>
  );
}
