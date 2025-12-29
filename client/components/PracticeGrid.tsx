import { useState, useRef, useEffect } from "react";

interface GridProblem {
  rowNum: number;
  colNum: number;
  answer: number;
}

interface PracticeGridProps {
  columnHeaders: number[];
  rowHeaders: number[];
  type: "addition" | "subtraction" | "multiplication" | "division";
  onAnswersChange?: (answers: Map<string, number | null>) => void;
  checkedKeys?: Set<string>;
  incorrectKeys?: Set<string>;
}

interface PracticeGridCallbacks {
  onFocusCell?: (rowNum: number, colNum: number) => void;
}

export const PracticeGrid = ({
  columnHeaders,
  rowHeaders,
  type,
  onAnswersChange,
  checkedKeys = new Set(),
  incorrectKeys = new Set(),
  onFocusCell,
}: PracticeGridProps & PracticeGridCallbacks) => {
  const [answers, setAnswers] = useState<Map<string, number | null>>(new Map());
  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  useEffect(() => {
    onAnswersChange?.(answers);
  }, [answers, onAnswersChange]);

  const getOperationSymbol = (): string => {
    switch (type) {
      case "addition":
        return "+";
      case "subtraction":
        return "−";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
      default:
        return "+";
    }
  };

  const calculateAnswer = (rowNum: number, colNum: number): number => {
    switch (type) {
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

  const handleInputChange = (rowNum: number, colNum: number, value: string) => {
    const key = `${rowNum}-${colNum}`;
    const newAnswers = new Map(answers);
    newAnswers.set(key, value === "" ? null : parseInt(value, 10));
    setAnswers(newAnswers);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number,
  ) => {
    if (e.key === "Enter") {
      // Move to next row in same column
      if (rowIndex < rowHeaders.length - 1) {
        const nextKey = `${rowHeaders[rowIndex + 1]}-${columnHeaders[colIndex]}`;
        inputRefs.current.get(nextKey)?.focus();
      }
    } else if (e.key === "ArrowRight") {
      // Move to next column in same row
      if (colIndex < columnHeaders.length - 1) {
        const nextKey = `${rowHeaders[rowIndex]}-${columnHeaders[colIndex + 1]}`;
        inputRefs.current.get(nextKey)?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      // Move to previous column in same row
      if (colIndex > 0) {
        const prevKey = `${rowHeaders[rowIndex]}-${columnHeaders[colIndex - 1]}`;
        inputRefs.current.get(prevKey)?.focus();
      }
    } else if (e.key === "ArrowDown") {
      // Move to next row in same column
      if (rowIndex < rowHeaders.length - 1) {
        const nextKey = `${rowHeaders[rowIndex + 1]}-${columnHeaders[colIndex]}`;
        inputRefs.current.get(nextKey)?.focus();
      }
    } else if (e.key === "ArrowUp") {
      // Move to previous row in same column
      if (rowIndex > 0) {
        const prevKey = `${rowHeaders[rowIndex - 1]}-${columnHeaders[colIndex]}`;
        inputRefs.current.get(prevKey)?.focus();
      }
    }
  };

  const symbol = getOperationSymbol();

  return (
    <div className="overflow-x-auto w-full -mx-4 sm:-mx-0">
      <div className="inline-block min-w-full px-4 sm:px-0">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-blue-600 px-1.5 sm:px-2 lg:px-3 py-2 lg:py-3 text-center font-semibold text-xs sm:text-sm lg:text-base min-w-10 sm:min-w-14 lg:min-w-16 whitespace-nowrap">
                {symbol}
              </th>
              {columnHeaders.map((colNum, index) => (
                <th
                  key={index}
                  className="border border-blue-600 px-1.5 sm:px-2 lg:px-3 py-2 lg:py-3 text-center font-semibold text-xs sm:text-sm lg:text-base min-w-10 sm:min-w-14 lg:min-w-16 whitespace-nowrap"
                >
                  {colNum}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowHeaders.map((rowNum, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border border-slate-200 bg-slate-50 px-1.5 sm:px-2 lg:px-3 py-2 lg:py-3 text-center font-semibold text-slate-700 text-xs sm:text-sm lg:text-base min-w-10 sm:min-w-14 lg:min-w-16 whitespace-nowrap">
                  {rowNum}
                </td>
                {columnHeaders.map((colNum, colIndex) => {
                  const key = `${rowNum}-${colNum}`;
                  const correctAnswer = calculateAnswer(rowNum, colNum);
                  const userAnswer = answers.get(key);

                  return (
                    <td
                      key={colIndex}
                      className="border border-slate-200 px-1 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-3 text-center min-w-10 sm:min-w-14 lg:min-w-16"
                    >
                      <input
                        ref={(el) => {
                          if (el) {
                            inputRefs.current.set(key, el);
                          }
                        }}
                        type="number"
                        value={userAnswer ?? ""}
                        onChange={(e) =>
                          handleInputChange(rowNum, colNum, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        onFocus={() => onFocusCell?.(rowNum, colNum)}
                        className={`w-full h-8 sm:h-9 lg:h-10 px-1 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 border-2 rounded text-center font-semibold text-slate-700 focus:outline-none text-xs sm:text-sm lg:text-base transition-colors ${
                          incorrectKeys.has(key)
                            ? "border-red-500 bg-red-50 focus:border-red-700"
                            : checkedKeys.has(key)
                              ? "border-green-500 bg-green-50 focus:border-green-700"
                              : "border-slate-300 focus:border-slate-400"
                        }`}
                        placeholder="?"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
