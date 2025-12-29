import { useState } from "react";
import { Link } from "react-router-dom";
import { getResults, getAverageAccuracy } from "@/lib/storage";

export default function Index() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const results = getResults();

  const operations = [
    {
      id: "addition",
      name: "Addition",
      emoji: "➕",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "subtraction",
      name: "Subtraction",
      emoji: "➖",
      color: "from-purple-400 to-purple-600",
    },
    {
      id: "multiplication",
      name: "Multiplication",
      emoji: "✖️",
      color: "from-pink-400 to-pink-600",
    },
    {
      id: "division",
      name: "Division",
      emoji: "➗",
      color: "from-cyan-400 to-cyan-600",
    },
  ];

  const digitCounts = [2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 py-8 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:text-center md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center md:justify-center gap-3">
            <span className="text-4xl md:text-5xl">🧮</span>
            Calculation Mastery
          </h1>
          <p className="text-purple-100 text-lg md:text-xl max-w-2xl md:mx-auto">
            Master math operations with timed practice, instant feedback, and
            progress tracking
          </p>
        </div>

        {/* Main Content */}
        {!selectedType ? (
          <div>
            {/* Statistics */}
            {results.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  📊 Your Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-slate-600 text-sm font-medium mb-2">
                      Total Practice Sessions
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {results.length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-slate-600 text-sm font-medium mb-2">
                      Average Accuracy
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {getAverageAccuracy()}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-slate-600 text-sm font-medium mb-2">
                      Total Problems Solved
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {results.reduce((sum, r) => sum + r.totalProblems, 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-slate-600 text-sm font-medium mb-2">
                      Total Time Spent
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {Math.round(
                        results.reduce((sum, r) => sum + r.timeSpent, 0) / 60,
                      )}
                      m
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Face Two Calculation Section */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                Advanced Calculation
              </h2>
              <Link
                to="/face-two"
                className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg p-6 md:p-8 text-white block"
              >
                <div className="text-4xl md:text-5xl mb-3">📊</div>
                <h3 className="text-xl md:text-2xl font-bold">
                  Face Two Calculation
                </h3>
                <p className="text-sm text-white/80 mt-2">
                  Calculate row and column sums in a grid
                </p>
              </Link>
            </div>

            {/* Operations Selection */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                Choose an Operation to Practice
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {operations.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setSelectedType(op.id)}
                    className={`bg-gradient-to-br ${op.color} rounded-lg shadow-lg p-6 md:p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                  >
                    <div className="text-4xl md:text-5xl mb-3">{op.emoji}</div>
                    <h3 className="text-xl md:text-2xl font-bold">{op.name}</h3>
                    {results.some((r) => r.type === op.id) && (
                      <p className="text-sm text-white/80 mt-2">
                        Avg: {getAverageAccuracy(op.id)}%
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedType(null)}
              className="mb-8 flex items-center gap-2 text-white font-semibold hover:text-purple-100 transition"
            >
              <span>←</span> Back to Operations
            </button>

            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
                Choose Number of Digits
              </h2>
              <p className="text-slate-600 mb-8 text-lg">
                Select the difficulty level for {selectedType} practice
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {digitCounts.map((digits) => (
                  <Link
                    key={digits}
                    to={`/practice/${selectedType}/digits/${digits}/count/2`}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 md:p-8 text-white text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {digits}
                    </div>
                    <p className="text-sm md:text-base font-semibold">
                      {digits}-Digit Numbers
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
