import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaceTwoGrid } from "@/components/FaceTwoGrid";
import { Statistics } from "@/components/Statistics";
import { Timer } from "@/components/Timer";
import { saveFaceTwoResult } from "@/lib/storage";
import { toast } from "sonner";

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const GRID_SIZES = [5, 6, 7, 8, 9, 10];

export default function FaceTwo() {
  const navigate = useNavigate();
  const [gridSize, setGridSize] = useState<number | null>(null);
  const [gridData, setGridData] = useState<number[][]>([]);
  const [userAnswers, setUserAnswers] = useState<Map<string, number | null>>(
    new Map(),
  );
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [incorrectKeys, setIncorrectKeys] = useState<Set<string>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Generate grid data based on selected size
  const generateGrid = useCallback((size: number) => {
    const newGrid: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        row.push(getRandomNumber(10, 99));
      }
      newGrid.push(row);
    }
    setGridData(newGrid);
    setUserAnswers(new Map());
    setCheckedKeys(new Set());
    setIncorrectKeys(new Set());
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setAccuracy(0);
    setTotalAnswered(0);
    setTimerActive(true);
    setIsPaused(false);
    setTimeSpent(0);
  }, []);

  const handleGridSizeSelect = (size: number) => {
    setGridSize(size);
    generateGrid(size);
  };

  const calculateRowSum = (rowIndex: number): number => {
    return gridData[rowIndex]?.reduce((sum, num) => sum + num, 0) || 0;
  };

  const calculateColumnSum = (colIndex: number): number => {
    let sum = 0;
    for (let i = 0; i < gridSize!; i++) {
      sum += gridData[i]?.[colIndex] || 0;
    }
    return sum;
  };

  const calculateGrandTotal = (): number => {
    let total = 0;
    for (let i = 0; i < gridSize!; i++) {
      total += calculateRowSum(i);
    }
    return total;
  };

  const handleCheckAllAnswers = useCallback(() => {
    const newCheckedKeys = new Set<string>();
    const newIncorrectKeys = new Set<string>();

    // Check all row sums
    for (let i = 0; i < gridSize!; i++) {
      const rowKey = `row-${i}`;
      const userAnswer = userAnswers.get(rowKey);

      if (userAnswer !== null && userAnswer !== undefined) {
        const correctAnswer = calculateRowSum(i);
        newCheckedKeys.add(rowKey);

        if (userAnswer !== correctAnswer) {
          newIncorrectKeys.add(rowKey);
        }
      }
    }

    // Check all column sums
    for (let j = 0; j < gridSize!; j++) {
      const colKey = `col-${j}`;
      const userAnswer = userAnswers.get(colKey);

      if (userAnswer !== null && userAnswer !== undefined) {
        const correctAnswer = calculateColumnSum(j);
        newCheckedKeys.add(colKey);

        if (userAnswer !== correctAnswer) {
          newIncorrectKeys.add(colKey);
        }
      }
    }

    // Check grand total
    const grandTotalKey = "grand-total";
    const grandTotalAnswer = userAnswers.get(grandTotalKey);

    if (grandTotalAnswer !== null && grandTotalAnswer !== undefined) {
      const correctGrandTotal = calculateGrandTotal();
      newCheckedKeys.add(grandTotalKey);

      if (grandTotalAnswer !== correctGrandTotal) {
        newIncorrectKeys.add(grandTotalKey);
      }
    }

    // Recalculate statistics
    let correct = 0;
    let incorrect = 0;

    newCheckedKeys.forEach((checkedKey) => {
      if (newIncorrectKeys.has(checkedKey)) {
        incorrect++;
      } else {
        correct++;
      }
    });

    setCheckedKeys(newCheckedKeys);
    setIncorrectKeys(newIncorrectKeys);
    setCorrectAnswers(correct);
    setIncorrectAnswers(incorrect);
    setTotalAnswered(newCheckedKeys.size);

    const calculatedAccuracy =
      newCheckedKeys.size > 0
        ? Math.round((correct / newCheckedKeys.size) * 100)
        : 0;
    setAccuracy(calculatedAccuracy);
  }, [userAnswers, gridData, gridSize]);

  const handleTimeUpdate = useCallback((time: number) => {
    setTimeSpent(time);
  }, []);

  const handleRefreshProblems = () => {
    if (gridSize !== null) {
      generateGrid(gridSize);
      toast.success("Grid refreshed!");
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? "Timer resumed" : "Timer paused");
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];
    if (hours > 0) parts.push(String(hours).padStart(2, "0"));
    parts.push(String(minutes).padStart(2, "0"));
    parts.push(String(secs).padStart(2, "0"));
    return parts.join(":");
  };

  const handleSaveResult = () => {
    const result = {
      id: `${Date.now()}`,
      type: "phase-two" as const,
      gridSize: gridSize!,
      totalProblems: totalAnswered,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      timeSpent,
      timestamp: Date.now(),
    };
    saveFaceTwoResult(result);
    toast.success(`Result saved! Time: ${formatTime(timeSpent)}`);
    navigate("/");
  };

  const handleGoHome = () => {
    if (checkedKeys.size === 0 && userAnswers.size > 0) {
      if (
        !confirm(
          "You have unsaved progress. Do you want to go back home without saving?",
        )
      ) {
        return;
      }
    }
    navigate("/");
  };

  // Grid size selection view
  if (gridSize === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-600 to-pink-700 py-3 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleGoHome}
            className="mb-3 sm:mb-4 flex items-center gap-2 text-white font-semibold hover:text-orange-100 transition text-xs sm:text-sm lg:text-base"
          >
            <span>←</span> Go Back Home
          </button>

          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 lg:p-12">
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-2xl sm:text-3xl lg:text-4xl">📊</span>
                <span>Phase Two Calculation</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
                Select a grid size to practice calculating row sums, column sums, and grand totals
              </p>
            </div>

            <div className="mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-6">
                Choose Grid Size
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {GRID_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleGridSizeSelect(size)}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 sm:p-8 text-white text-center hover:shadow-lg hover:scale-105 transition-all duration-300 transform"
                  >
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                      {size}
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base font-semibold">
                      {size}×{size} Grid
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-600 p-3 sm:p-4 lg:p-6 rounded">
              <p className="text-orange-800 text-xs sm:text-sm lg:text-base leading-relaxed">
                <strong>Instructions:</strong> Calculate and fill in all row sums (rightmost column), column sums (bottom row), and grand total. Click "Check All" to validate your answers. Green means correct, red means incorrect.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gridData.length === 0) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-600 to-pink-700 py-3 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleGoHome}
          className="mb-3 sm:mb-4 flex items-center gap-2 text-white font-semibold hover:text-orange-100 transition text-xs sm:text-sm lg:text-base"
        >
          <span>←</span> Go Back Home
        </button>

        <div className="bg-white rounded-lg shadow-2xl p-3 sm:p-4 lg:p-8">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-lg sm:text-2xl lg:text-3xl">📊</span>
              <span>Phase Two Calculation ({gridSize}×{gridSize})</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Calculate row sums, column sums, and the grand total
            </p>
          </div>

          <div className="mb-4 sm:mb-6 lg:mb-8 pb-4 sm:pb-6 lg:pb-6 border-b border-slate-200">
            <div className="bg-orange-50 border-l-4 border-orange-600 p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4 lg:mb-6 rounded">
              <p className="text-orange-800 text-xs sm:text-sm lg:text-base leading-relaxed">
                <strong>Instructions:</strong> Calculate and fill in the row sums (rightmost column), column sums (bottom row), and grand total. Click "Check All" to validate all your answers. Green means correct, red means incorrect.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-start sm:items-center">
              <Timer
                isActive={timerActive}
                isPaused={isPaused}
                onTimeUpdate={handleTimeUpdate}
              />
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePauseResume}
                  className="flex items-center justify-center gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition text-xs sm:text-sm lg:text-base whitespace-nowrap"
                >
                  <span>{isPaused ? "▶" : "⏸"}</span>{" "}
                  <span className="hidden sm:inline">
                    {isPaused ? "Resume" : "Pause"}
                  </span>
                  <span className="sm:hidden">{isPaused ? "Resume" : "Pause"}</span>
                </button>
                <button
                  onClick={handleRefreshProblems}
                  className="flex items-center justify-center gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm lg:text-base whitespace-nowrap"
                >
                  <span>🔄</span>{" "}
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </button>
                <button
                  onClick={handleCheckAllAnswers}
                  className="flex items-center justify-center gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-xs sm:text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={userAnswers.size === 0}
                >
                  <span>✓</span>{" "}
                  <span className="hidden sm:inline">Check All</span>
                  <span className="sm:hidden">Check</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4 sm:mb-6 lg:mb-8 overflow-auto">
            <FaceTwoGrid
              gridData={gridData}
              gridSize={gridSize}
              userAnswers={userAnswers}
              onAnswersChange={setUserAnswers}
              checkedKeys={checkedKeys}
              incorrectKeys={incorrectKeys}
            />
          </div>

          {checkedKeys.size > 0 && (
            <>
              <div className="mb-4 sm:mb-6 lg:mb-8 py-4 sm:py-6 lg:py-6 border-t border-slate-200">
                <Statistics
                  correctAnswers={correctAnswers}
                  incorrectAnswers={incorrectAnswers}
                  totalProblems={totalAnswered}
                  accuracy={accuracy}
                  timeSpent={timeSpent}
                />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={handleRefreshProblems}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm lg:text-base"
                >
                  <span>🔄</span>{" "}
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </button>
                <button
                  onClick={handleSaveResult}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-xs sm:text-sm lg:text-base"
                >
                  <span>💾</span>{" "}
                  <span className="hidden sm:inline">Save Result</span>
                  <span className="sm:hidden">Save</span>
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition text-xs sm:text-sm lg:text-base"
                >
                  <span>🏠</span>{" "}
                  <span className="hidden sm:inline">Go Home</span>
                  <span className="sm:hidden">Home</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
