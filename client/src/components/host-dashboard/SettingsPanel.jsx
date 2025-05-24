export default function SettingsPanel({
  roomSettings,
  setRoomSettings,
  isEditingSettings,
  setIsEditingSettings,
  onSaveSettings,
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            Room Settings
          </h2>
          {isEditingSettings ? (
            <div className="flex gap-2">
              <button
                onClick={onSaveSettings}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingSettings(false)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingSettings(true)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Room Name
            </label>
            {isEditingSettings ? (
              <input
                type="text"
                value={roomSettings.name}
                onChange={(e) =>
                  setRoomSettings({
                    ...roomSettings,
                    name: e.target.value,
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
            ) : (
              <div className="bg-gray-700 px-3 py-2 rounded text-sm">
                {roomSettings.name}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Max Players
            </label>
            {isEditingSettings ? (
              <input
                type="number"
                min="2"
                max="50"
                value={roomSettings.maxPlayers}
                onChange={(e) =>
                  setRoomSettings({
                    ...roomSettings,
                    maxPlayers: Number.parseInt(e.target.value),
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
            ) : (
              <div className="bg-gray-700 px-3 py-2 rounded text-sm">
                {roomSettings.maxPlayers}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Game Duration (minutes)
            </label>
            {isEditingSettings ? (
              <input
                type="number"
                min="1"
                max="10"
                value={roomSettings.gameDuration}
                onChange={(e) =>
                  setRoomSettings({
                    ...roomSettings,
                    gameDuration: Number.parseInt(e.target.value),
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
            ) : (
              <div className="bg-gray-700 px-3 py-2 rounded text-sm">
                {roomSettings.gameDuration}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Min Players to Start
            </label>
            {isEditingSettings ? (
              <input
                type="number"
                min="1"
                max="10"
                value={roomSettings.minPlayersToStart}
                onChange={(e) =>
                  setRoomSettings({
                    ...roomSettings,
                    minPlayersToStart: Number.parseInt(e.target.value),
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
            ) : (
              <div className="bg-gray-700 px-3 py-2 rounded text-sm">
                {roomSettings.minPlayersToStart}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
