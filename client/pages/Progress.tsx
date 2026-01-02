import { useParams, useNavigate } from 'react-router-dom';
import { getResults, getResultsByType, getAverageAccuracy, getFaceTwoResults } from '@/lib/storage';
import type { Result } from '@/lib/storage';

export default function Progress() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  const results: Result[] = type ? (type === 'face-two' ? getFaceTwoResults() : getResultsByType(type)) : getResults();
  const avgAccuracy = type ? getAverageAccuracy(type) : getAverageAccuracy();

  const getOperationLabel = (op: string) => {
    const labels: Record<string, string> = {
      addition: 'Addition',
      subtraction: 'Subtraction',
      multiplication: 'Multiplication',
      division: 'Division',
      'face-two': 'Face Two Calculation',
    };
    return labels[op] || op;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-white font-semibold hover:text-purple-100 transition"
        >
          <span>←</span> Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            📊 {type ? getOperationLabel(type) : 'All'} Progress
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
              <p className="text-3xl font-bold text-blue-600">{results.length}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-slate-600 text-sm font-medium mb-2">
                Average Accuracy
              </p>
              <p className="text-3xl font-bold text-green-600">{avgAccuracy}%</p>
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
                {formatTime(results.reduce((sum, r) => sum + ('timeSpent' in r ? r.timeSpent : 0), 0))}
              </p>
            </div>
          </div>

          {/* Results History */}
          {results.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Recent Sessions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-50">
                      <th className="px-4 py-3 font-semibold text-slate-700">
                        Date
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
                        Time
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
                          {result.type === 'face-two' ? '5x5 Grid' : `${('digits' in result) ? result.digits : '-'}-Digit`}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                            {result.correctAnswers}/{result.totalProblems}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-semibold ${
                              result.accuracy >= 80
                                ? 'bg-green-100 text-green-800'
                                : result.accuracy >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {result.accuracy}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {result.type === 'face-two' ? '-' : formatTime(('timeSpent' in result) ? result.timeSpent : 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg mb-6">
                No practice sessions yet. Start practicing to see your progress!
              </p>
              <button
                onClick={() => navigate('/')}
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
