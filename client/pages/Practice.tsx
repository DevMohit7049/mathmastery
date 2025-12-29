import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Timer } from "@/components/Timer";
import { Statistics } from "@/components/Statistics";
import { PracticeGrid } from "@/components/PracticeGrid";
import { saveResult, PracticeResult } from "@/lib/storage";

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getMaxNumberForDigits = (digits: number): number => {
  return Math.pow(10, digits) - 1;
};

const getMinNumberForDigits = (digits: number): number => {
  if (digits === 1) return 0;
  return Math.pow(10, digits - 1);
};

export default function Practice() {
  const navigate = useNavigate();
  const {
    type = "addition",
    digits = "2",
    count = "2",
  } = useParams<{
    type: string;
    digits: string;
    count: string;
  }>();

  const digitCount = parseInt(digits, 10);
  const problemType = type as
    | "addition"
    | "subtraction"
    | "multiplication"
    | "division";

  const [columnHeaders, setColumnHeaders] = useState<number[]>([]);
  const [rowHeaders, setRowHeaders] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Map<string, number | null>>(new Map());
  const [timerActive, setTimerActive] = useState(true);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [incorrectKeys, setIncorrectKeys] = useState<Set<string>>(new Set());
  const [focusedCell, setFocusedCell] = useState<{
    rowNum: number;
    colNum: number;
  } | null>(null);

  const generateGridHeaders = () => {
    const maxNum = getMaxNumberForDigits(digitCount);
    const minNum = getMinNumberForDigits(digitCount);

    const cols: number[] = [];
    const rows: number[] = [];

    for (let i = 0; i < 10; i++) {
      cols.push(getRandomNumber(minNum, maxNum));
      rows.push(getRandomNumber(minNum, maxNum));
    }

    return { cols, rows };
  };

  // Generate problems on mount
  useEffect(() => {
    const { cols, rows } = generateGridHeaders();
    setColumnHeaders(cols);
    setRowHeaders(rows);
    setAnswers(new Map());
  }, [problemType, digitCount]);

  const getOperationLabel = () => {
    const labels: Record<string, string> = {
      addition: "Addition",
      subtraction: "Subtraction",
      multiplication: "Multiplication",
      division: "Division",
    };
    return labels[problemType] || "Addition";
  };

  const getDigitLabel = () => {
    const labels: Record<number, string> = {
      1: "1-Digit",
      2: "2-Digit",
      3: "3-Digit",
      4: "4-Digit",
      5: "5-Digit",
      6: "6-Digit",
    };
    return labels[digitCount] || `${digitCount}-Digit`;
  };

  const calculateCorrectAnswer = (rowNum: number, colNum: number): number => {
    switch (problemType) {
      case "addition":
        return rowNum + colNum;
      case "subtraction":
        return Math.max(0, rowNum - colNum);
      case "multiplication":
        return rowNum * colNum;
      case "division":
        return colNum !== 0 ? Math.floor(rowNum / colNum) : 0;
      default:
        return rowNum + colNum;
    }
  };

  const handleTimeUpdate = useCallback((time: number) => {
    setTimeSpent(time);
  }, []);

  const handleCheckAllAnswers = useCallback(() => {
    if (!focusedCell) return;

    const key = `${focusedCell.rowNum}-${focusedCell.colNum}`;
    const userAnswer = answers.get(key);

    // Only check if cell has user input
    if (userAnswer === null) return;

    const correctAnswer = calculateCorrectAnswer(
      focusedCell.rowNum,
      focusedCell.colNum,
    );

    const newCheckedKeys = new Set(checkedKeys);
    const newIncorrectKeys = new Set(incorrectKeys);

    // Mark this cell as checked
    newCheckedKeys.add(key);

    // Check if answer is correct
    if (userAnswer === correctAnswer) {
      newIncorrectKeys.delete(key);
    } else {
      newIncorrectKeys.add(key);
    }

    // Recalculate statistics from all checked cells
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
  }, [focusedCell, answers, checkedKeys, incorrectKeys]);

  const handleFocusCell = useCallback((rowNum: number, colNum: number) => {
    setFocusedCell({ rowNum, colNum });
  }, []);

  const handleRefreshProblems = () => {
    const { cols, rows } = generateGridHeaders();
    setColumnHeaders(cols);
    setRowHeaders(rows);
    setAnswers(new Map());
    setShowStats(false);
    setTimerActive(true);
    setTimerPaused(false);
    setTimeSpent(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setAccuracy(0);
    setTotalAnswered(0);
    setCheckedKeys(new Set());
    setIncorrectKeys(new Set());
  };

  const handleSaveResult = () => {
    const result: PracticeResult = {
      id: `${Date.now()}`,
      type: problemType,
      digits: digitCount,
      totalProblems: totalAnswered,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      timeSpent,
      timestamp: Date.now(),
    };
    saveResult(result);
    navigate("/");
  };

  const handleViewProgress = () => {
    navigate("/progress");
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem("calculation-mastery-results");
      navigate("/");
    }
  };

  const handlePauseTimer = () => {
    setTimerPaused(true);
  };

  const handleResumeTimer = () => {
    setTimerPaused(false);
  };

  const handleGoHome = () => {
    if (checkedKeys.size === 0 && timeSpent > 0) {
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

  if (columnHeaders.length === 0 || rowHeaders.length === 0) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 py-3 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Go Back Home Button */}
        <button
          onClick={handleGoHome}
          className="mb-3 sm:mb-4 flex items-center gap-2 text-white font-semibold hover:text-purple-100 transition text-xs sm:text-sm lg:text-base"
        >
          <span>←</span> Go Back Home
        </button>

        <div className="bg-white rounded-lg shadow-2xl p-3 sm:p-4 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-lg sm:text-2xl lg:text-3xl">📋</span>
              <span className="line-clamp-1">
                {getOperationLabel()} Skills Practice
              </span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
              Mastering {getDigitLabel()} {getOperationLabel()}
            </p>
          </div>

          {/* Instructions and Controls */}
          <div className="mb-4 sm:mb-6 lg:mb-8 pb-4 sm:pb-6 lg:pb-6 border-b border-slate-200">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4 lg:mb-6 rounded">
              <p className="text-blue-800 text-xs sm:text-sm lg:text-base leading-relaxed">
                <strong>Instructions:</strong> Answer the math problems in the
                table below. Click on a cell, type your answer, and click
                "Check" to validate only that cell. Green means correct, red
                means incorrect. Check each cell one by one.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
              <div className="flex-shrink-0">
                <Timer
                  isActive={timerActive}
                  isPaused={timerPaused}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleRefreshProblems}
                  className="flex items-center justify-center gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-2 lg:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm lg:text-base whitespace-nowrap"
                >
                  <span>🔄</span>{" "}
                  <span className="hidden sm:inline">
                    Refresh - Generate New Numbers
                  </span>{" "}
                  <span className="sm:hidden">Refresh</span>
                </button>
                {!timerPaused && (
                  <button
                    onClick={handlePauseTimer}
                    className="flex items-center justify-center gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition text-xs sm:text-sm lg:text-base"
                  >
                    <span>⏸️</span>{" "}
                    <span className="hidden sm:inline">Pause</span>
                  </button>
                )}
                {timerPaused && (
                  <button
                    onClick={handleResumeTimer}
                    className="flex items-center justify-center gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm lg:text-base"
                  >
                    <span>▶️</span>{" "}
                    <span className="hidden sm:inline">Resume</span>
                  </button>
                )}
                <button
                  onClick={handleCheckAllAnswers}
                  className="flex items-center justify-center gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-xs sm:text-sm lg:text-base"
                  disabled={
                    !focusedCell ||
                    answers.get(
                      `${focusedCell.rowNum}-${focusedCell.colNum}`,
                    ) === null
                  }
                >
                  <span>✓</span> <span className="hidden sm:inline">Check</span>
                  <span className="sm:hidden">Check</span>
                </button>
              </div>
            </div>
          </div>

          {/* Practice Grid */}
          <div className="mb-4 sm:mb-6 lg:mb-8 overflow-auto">
            <PracticeGrid
              columnHeaders={columnHeaders}
              rowHeaders={rowHeaders}
              type={problemType}
              onAnswersChange={setAnswers}
              checkedKeys={checkedKeys}
              incorrectKeys={incorrectKeys}
              onFocusCell={handleFocusCell}
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
                  onClick={handleSaveResult}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-xs sm:text-sm lg:text-base"
                >
                  <span>💾</span>{" "}
                  <span className="hidden sm:inline">Save Result</span>
                  <span className="sm:hidden">Save</span>
                </button>
                <button
                  onClick={handleViewProgress}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm lg:text-base"
                >
                  <span>📊</span>{" "}
                  <span className="hidden sm:inline">View Progress</span>
                  <span className="sm:hidden">Progress</span>
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition text-xs sm:text-sm lg:text-base"
                >
                  <span>🏠</span>{" "}
                  <span className="hidden sm:inline">Go Home</span>
                  <span className="sm:hidden">Home</span>
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition text-xs sm:text-sm lg:text-base"
                >
                  <span>🗑️</span>{" "}
                  <span className="hidden sm:inline">Clear History</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
