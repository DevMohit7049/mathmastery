interface StatisticsProps {
  correctAnswers: number;
  incorrectAnswers: number;
  totalProblems: number;
  accuracy: number;
}

export const Statistics = ({
  correctAnswers,
  incorrectAnswers,
  totalProblems,
  accuracy,
}: StatisticsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      <div className="text-center">
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium mb-1 sm:mb-2">
          Correct Answers
        </p>
        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600">
          {correctAnswers}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium mb-1 sm:mb-2">
          Incorrect Answers
        </p>
        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600">
          {incorrectAnswers}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium mb-1 sm:mb-2">
          Total Problems
        </p>
        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-700">
          {totalProblems}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium mb-1 sm:mb-2">
          Accuracy
        </p>
        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
          {accuracy}%
        </p>
      </div>
    </div>
  );
};
