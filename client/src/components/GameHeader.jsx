// import { useState } from "react";

export default function GameHeader() {
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
                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md">Leaderboard</button>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md">Submit Solution</button>
                    </div>
                </div>
            </div>
        </header>
    )
}