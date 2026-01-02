import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaceTwoGrid } from "@/components/FaceTwoGrid";
import { Statistics } from "@/components/Statistics";
import { Timer } from "@/components/Timer";
import { saveFaceTwoResult } from "@/lib/storage";

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function FaceTwo() {
  const navigate = useNavigate();
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

  // Generate initial grid data (5x5)
  useEffect(() => {
    const newGrid: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const row: number[] = [];
      for (let j = 0; j < 5; j++) {
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
  }, []);

  const calculateRowSum = (rowIndex: number): number => {
    return gridData[rowIndex]?.reduce((sum, num) => sum + num, 0) || 0;
  };

  const calculateColumnSum = (colIndex: number): number => {
    let sum = 0;
    for (let i = 0; i < 5; i++) {
      sum += gridData[i]?.[colIndex] || 0;
    }
    return sum;
  };

  const calculateGrandTotal = (): number => {
    let total = 0;
    for (let i = 0; i < 5; i++) {
      total += calculateRowSum(i);
    }
    return total;
  };

  const handleCheckAllAnswers = useCallback(() => {
    const newCheckedKeys = new Set<string>();
    const newIncorrectKeys = new Set<string>();

    // Check all row sums (column 5, rows 0-4)
    for (let i = 0; i < 5; i++) {
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

    // Check all column sums (row 5, columns 0-4)
    for (let j = 0; j < 5; j++) {
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

    // Check grand total (6,6)
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
  }, [userAnswers, gridData]);

  const handleRefreshProblems = () => {
    const newGrid: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const row: number[] = [];
      for (let j = 0; j < 5; j++) {
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

  if (gridData.length === 0) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-600 to-pink-700 py-3 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Go Back Home Button */}
        <button
          onClick={handleGoHome}
          className="mb-3 sm:mb-4 flex items-center gap-2 text-white font-semibold hover:text-orange-100 transition text-xs sm:text-sm lg:text-base"
        >
          <span>←</span> Go Back Home
        </button>

        <div className="bg-white rounded-lg shadow-2xl p-3 sm:p-4 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-lg sm:text-2xl lg:text-3xl">📊</span>
              <span>Face Two Calculation</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Calculate row sums, column sums, and the grand total
            </p>
          </div>

          {/* Instructions and Controls */}
          <div className="mb-4 sm:mb-6 lg:mb-8 pb-4 sm:pb-6 lg:pb-6 border-b border-slate-200">
            <div className="bg-orange-50 border-l-4 border-orange-600 p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4 lg:mb-6 rounded">
              <p className="text-orange-800 text-xs sm:text-sm lg:text-base leading-relaxed">
                <strong>Instructions:</strong> Calculate and fill in the row
                sums (rightmost column), column sums (bottom row), and grand
                total. Click "Check All" to validate all your answers. Green
                means correct, red means incorrect.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefreshProblems}
                className="flex items-center justify-center gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm lg:text-base whitespace-nowrap"
              >
                <span>🔄</span> Refresh
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

          {/* Grid */}
          <div className="mb-4 sm:mb-6 lg:mb-8 overflow-auto">
            <FaceTwoGrid
              gridData={gridData}
              userAnswers={userAnswers}
              onAnswersChange={setUserAnswers}
              checkedKeys={checkedKeys}
              incorrectKeys={incorrectKeys}
            />
          </div>

          {/* Statistics */}
          {checkedKeys.size > 0 && (
            <>
              <div className="mb-4 sm:mb-6 lg:mb-8 py-4 sm:py-6 lg:py-6 border-t border-slate-200">
                <Statistics
                  correctAnswers={correctAnswers}
                  incorrectAnswers={incorrectAnswers}
                  totalProblems={totalAnswered}
                  accuracy={accuracy}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={handleRefreshProblems}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm lg:text-base"
                >
                  <span>🔄</span> Refresh
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
