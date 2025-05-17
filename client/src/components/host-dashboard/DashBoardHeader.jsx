export default function Header({ onLogOut }) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center mr-2">
            <span className="text-lg font-bold text-gray-900">H</span>
          </div>
          <h1 className="text-lg font-bold">Host Dashboard</h1>
        </div>
        <button
          onClick={onLogOut}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </div>
    </header>
  );
}
