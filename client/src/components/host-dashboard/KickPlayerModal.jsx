export default function KickPlayerModal({
  player,
  reason,
  setReason,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-2">Kick Player</h3>
        <p className="mb-3 text-sm">
          Kick <span className="font-bold">{player?.username}</span>?
        </p>
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason..."
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Kick
          </button>
        </div>
      </div>
    </div>
  );
}
