import { useState, useRef, useEffect } from "react";

interface FaceTwoGridProps {
  gridData: number[][];
  userAnswers: Map<string, number | null>;
  onAnswersChange?: (answers: Map<string, number | null>) => void;
  checkedKeys?: Set<string>;
  incorrectKeys?: Set<string>;
}

export const FaceTwoGrid = ({
  gridData,
  userAnswers,
  onAnswersChange,
  checkedKeys = new Set(),
  incorrectKeys = new Set(),
}: FaceTwoGridProps) => {
  const [answers, setAnswers] =
    useState<Map<string, number | null>>(userAnswers);
  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  useEffect(() => {
    onAnswersChange?.(answers);
  }, [answers, onAnswersChange]);

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

  const handleInputChange = (key: string, value: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(key, value === "" ? null : parseInt(value, 10));
    setAnswers(newAnswers);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: string,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInputs = Array.from(inputRefs.current.keys());
      const currentIndex = nextInputs.indexOf(key);
      if (currentIndex < nextInputs.length - 1) {
        inputRefs.current.get(nextInputs[currentIndex + 1])?.focus();
      }
    }
  };

  return (
    <div className="overflow-x-auto w-full -mx-4 sm:-mx-0">
      <div className="inline-block min-w-full px-4 sm:px-0">
        <table className="border-collapse">
          <thead>
            <tr className="bg-orange-600 text-white">
              <th className="border border-orange-600 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center font-semibold text-xs sm:text-sm lg:text-base min-w-12 sm:min-w-16 lg:min-w-20">
                #
              </th>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <th
                  key={colIndex}
                  className="border border-orange-600 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center font-semibold text-xs sm:text-sm lg:text-base min-w-12 sm:min-w-16 lg:min-w-20"
                >
                  C{colIndex + 1}
                </th>
              ))}
              <th className="border border-orange-600 bg-yellow-300 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center font-semibold text-slate-800 text-xs sm:text-sm lg:text-base min-w-12 sm:min-w-16 lg:min-w-20">
                Row Sum
              </th>
            </tr>
          </thead>
          <tbody>
            {gridData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border border-slate-200 bg-slate-50 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center font-semibold text-slate-700 text-xs sm:text-sm lg:text-base min-w-12 sm:min-w-16 lg:min-w-20">
                  R{rowIndex + 1}
                </td>
                {row.map((num, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-slate-300 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center bg-white min-w-12 sm:min-w-16 lg:min-w-20"
                  >
                    <div className="font-semibold text-slate-800 text-xs sm:text-sm lg:text-base">
                      {num}
                    </div>
                  </td>
                ))}
                {/* Row Sum Input */}
                <td className="border border-slate-300 bg-yellow-50 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center min-w-12 sm:min-w-16 lg:min-w-20">
                  <input
                    ref={(el) => {
                      const key = `row-${rowIndex}`;
                      if (el) {
                        inputRefs.current.set(key, el);
                      }
                    }}
                    type="number"
                    value={answers.get(`row-${rowIndex}`) ?? ""}
                    onChange={(e) =>
                      handleInputChange(`row-${rowIndex}`, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, `row-${rowIndex}`)}
                    className={`w-full h-8 sm:h-9 lg:h-10 px-1 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 border-2 rounded text-center font-semibold text-slate-700 focus:outline-none text-xs sm:text-sm lg:text-base transition-colors ${
                      incorrectKeys.has(`row-${rowIndex}`)
                        ? "border-red-500 bg-red-50 focus:border-red-700"
                        : checkedKeys.has(`row-${rowIndex}`)
                          ? "border-green-500 bg-green-50 focus:border-green-700"
                          : "border-slate-300 focus:border-slate-400"
                    }`}
                    placeholder="?"
                  />
                </td>
              </tr>
            ))}
            {/* Column Sum Row */}
            <tr className="bg-yellow-50">
              <td className="border border-slate-200 bg-yellow-300 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center font-semibold text-slate-800 text-xs sm:text-sm lg:text-base min-w-12 sm:min-w-16 lg:min-w-20">
                Col Sum
              </td>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-slate-300 bg-yellow-50 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center min-w-12 sm:min-w-16 lg:min-w-20"
                >
                  <input
                    ref={(el) => {
                      const key = `col-${colIndex}`;
                      if (el) {
                        inputRefs.current.set(key, el);
                      }
                    }}
                    type="number"
                    value={answers.get(`col-${colIndex}`) ?? ""}
                    onChange={(e) =>
                      handleInputChange(`col-${colIndex}`, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, `col-${colIndex}`)}
                    className={`w-full h-8 sm:h-9 lg:h-10 px-1 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 border-2 rounded text-center font-semibold text-slate-700 focus:outline-none text-xs sm:text-sm lg:text-base transition-colors ${
                      incorrectKeys.has(`col-${colIndex}`)
                        ? "border-red-500 bg-red-50 focus:border-red-700"
                        : checkedKeys.has(`col-${colIndex}`)
                          ? "border-green-500 bg-green-50 focus:border-green-700"
                          : "border-slate-300 focus:border-slate-400"
                    }`}
                    placeholder="?"
                  />
                </td>
              ))}
              {/* Grand Total */}
              <td className="border border-slate-300 bg-yellow-300 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center min-w-12 sm:min-w-16 lg:min-w-20">
                <input
                  ref={(el) => {
                    if (el) {
                      inputRefs.current.set("grand-total", el);
                    }
                  }}
                  type="number"
                  value={answers.get("grand-total") ?? ""}
                  onChange={(e) =>
                    handleInputChange("grand-total", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "grand-total")}
                  className={`w-full h-8 sm:h-9 lg:h-10 px-1 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 border-2 rounded text-center font-semibold text-slate-700 focus:outline-none text-xs sm:text-sm lg:text-base transition-colors ${
                    incorrectKeys.has("grand-total")
                      ? "border-red-500 bg-red-50 focus:border-red-700"
                      : checkedKeys.has("grand-total")
                        ? "border-green-500 bg-green-50 focus:border-green-700"
                        : "border-slate-300 focus:border-slate-400"
                  }`}
                  placeholder="?"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
