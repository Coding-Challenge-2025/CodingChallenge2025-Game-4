import { useEffect, useState } from "react";
import { Menubar } from "radix-ui";

export default function GameHeader({ submittable }) {
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Time limit in seconds
  const [timeLeft, setTimeLeft] = useState();

  useEffect(() => {
    let timer;

    try {
      setTimeLeft(60);
    } catch (error) {
      console.error("Error setting time limit:", error);
    }

    timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // clean up interval
  }, []);

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center md-4 md:mb-0">
            <div className="mr-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">V</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">VoxelCode</h1>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md">
              {formatTime(timeLeft)}
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md">
              Leaderboard
            </button>
            <Menubar.Root>
              <Menubar.Menu>
                <Menubar.Trigger />
                <Menubar.Portal>
                  <Menubar.Content>
                    <Menubar.Label />
                    <Menubar.Item>New Tab</Menubar.Item>

                    <Menubar.Group>
                      <Menubar.Item />
                    </Menubar.Group>

                    <Menubar.CheckboxItem>
                      <Menubar.ItemIndicator />
                    </Menubar.CheckboxItem>

                    <Menubar.RadioGroup>
                      <Menubar.RadioItem>
                        <Menubar.ItemIndicator />
                      </Menubar.RadioItem>
                    </Menubar.RadioGroup>

                    <Menubar.Sub>
                      <Menubar.SubTrigger />
                      <Menubar.Portal>
                        <Menubar.SubContent />
                      </Menubar.Portal>
                    </Menubar.Sub>

                    <Menubar.Separator />
                    <Menubar.Arrow />
                  </Menubar.Content>
                </Menubar.Portal>
              </Menubar.Menu>
            </Menubar.Root>
            <button
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all
                                ${
                                  submittable
                                    ? "bg-blue-600 hover:bg-blue-500 cursor-pointer"
                                    : "bg-gray-700 cursor-not-allowed"
                                }`}
              disabled={!submittable}
              onClick={() => {
                if (submittable) {
                  alert("Solution submitted!");
                  // Add actual submit logic here
                }
              }}
            >
              Submit Solution
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
