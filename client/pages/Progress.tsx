import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  getResults,
  getResultsByType,
  getAverageAccuracy,
  getFaceTwoResults,
} from "@/lib/storage";
import type { Result } from "@/lib/storage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Progress() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  const results: Result[] = type
    ? type === "phase-two" || type === "face-two"
      ? getFaceTwoResults()
      : getResultsByType(type)
    : getResults();
  const avgAccuracy = type ? getAverageAccuracy(type) : getAverageAccuracy();

  // Group results by date
  const groupedByDate = results.reduce(
    (acc, result) => {
      const date = new Date(result.timestamp);
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(result);
      return acc;
    },
    {} as Record<string, Result[]>,
  );

  // Sort dates in reverse order (newest first)
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Prepare chart data - show last 14 sessions with accuracy trend
  const chartData = results
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-14)
    .map((result, index) => ({
      session: index + 1,
      accuracy: result.accuracy,
      date: new Date(result.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  const getOperationLabel = (op: string) => {
    const labels: Record<string, string> = {
      addition: "Addition",
      subtraction: "Subtraction",
      multiplication: "Multiplication",
      division: "Division",
      "phase-two": "Phase Two Calculation",
      "face-two": "Phase Two Calculation",
    };
    return labels[op] || op;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 py-8 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-white font-semibold hover:text-purple-100 transition"
        >
          <span>←</span> Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            📊 {type ? getOperationLabel(type) : "All"} Progress
          </h1>
          <p className="text-slate-600 mb-8 text-lg">
            Track your practice performance and improvement
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-slate-200">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-slate-600 text-sm font-medium mb-2">
                Total Sessions
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
                {avgAccuracy}%
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-slate-600 text-sm font-medium mb-2">
                Problems Solved
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {results.reduce((sum, r) => sum + r.totalProblems, 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-slate-600 text-sm font-medium mb-2">
                Total Time
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {formatTime(
                  results.reduce(
                    (sum, r) => sum + ("timeSpent" in r ? r.timeSpent : 0),
                    0,
                  ),
                )}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          {results.length > 0 && (
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                📋 Table View
              </button>
              <button
                onClick={() => setViewMode("chart")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === "chart"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                📈 Chart View
              </button>
            </div>
          )}

          {/* Results History */}
          {results.length > 0 ? (
            <div>
              {viewMode === "chart" && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    Accuracy Trend (Last 14 Sessions)
                  </h2>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6" }}
                          name="Accuracy %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {viewMode === "table" ? "Recent Sessions" : "Session History"}
              </h2>

              {viewMode === "table" ? (
                <div>
                  {sortedDates.map((dateKey) => (
                    <div key={dateKey} className="mb-8">
                      <h3 className="text-lg font-bold text-slate-700 mb-3 sticky top-0 bg-white z-10 py-2">
                        📅 {dateKey}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left mb-4">
                          <thead>
                            <tr className="border-b-2 border-slate-300 bg-slate-50">
                              <th className="px-4 py-3 font-semibold text-slate-700">
                                Time
                              </th>
                              <th className="px-4 py-3 font-semibold text-slate-700">
                                Type
                              </th>
                              <th className="px-4 py-3 font-semibold text-slate-700">
                                Difficulty
                              </th>
                              <th className="px-4 py-3 font-semibold text-slate-700">
                                Score
                              </th>
                              <th className="px-4 py-3 font-semibold text-slate-700">
                                Accuracy
                              </th>
                              <th className="px-4 py-3 font-semibold text-slate-700">
                                Duration
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedByDate[dateKey]
                              .sort((a, b) => b.timestamp - a.timestamp)
                              .map((result) => (
                                <tr
                                  key={result.id}
                                  className="border-b border-slate-200 hover:bg-slate-50 transition"
                                >
                                  <td className="px-4 py-3 text-slate-700 font-medium">
                                    {new Date(
                                      result.timestamp,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-slate-700 font-semibold">
                                    {getOperationLabel(result.type)}
                                  </td>
                                  <td className="px-4 py-3 text-slate-700">
                                    {result.type === "phase-two"
                                      ? `${"gridSize" in result ? result.gridSize : "5"}×${"gridSize" in result ? result.gridSize : "5"}`
                                      : `${"digits" in result ? result.digits : "-"}-Digit`}
                                  </td>
                                  <td className="px-4 py-3 text-slate-700">
                                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
                                      {result.correctAnswers}/
                                      {result.totalProblems}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-bold">
                                    <span
                                      className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
                                        result.accuracy >= 80
                                          ? "bg-green-100 text-green-800"
                                          : result.accuracy >= 60
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {result.accuracy}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-700 font-medium">
                                    {formatTime(
                                      "timeSpent" in result
                                        ? result.timeSpent
                                        : 0,
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-50">
                        <th className="px-4 py-3 font-semibold text-slate-700">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-700">
                          Type
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-700">
                          Difficulty
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-700">
                          Score
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-700">
                          Accuracy
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-700">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr
                          key={result.id}
                          className="border-b border-slate-200 hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3 text-slate-700">
                            {formatDate(result.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold">
                            {getOperationLabel(result.type)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {result.type === "phase-two"
                              ? `${"gridSize" in result ? result.gridSize : "5"}×${"gridSize" in result ? result.gridSize : "5"}`
                              : `${"digits" in result ? result.digits : "-"}-Digit`}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
                              {result.correctAnswers}/{result.totalProblems}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            <span
                              className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
                                result.accuracy >= 80
                                  ? "bg-green-100 text-green-800"
                                  : result.accuracy >= 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {result.accuracy}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">
                            {formatTime(
                              "timeSpent" in result ? result.timeSpent : 0,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg mb-6">
                No practice sessions yet. Start practicing to see your progress!
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Start Practicing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
