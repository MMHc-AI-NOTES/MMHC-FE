import { calculateSMEScore, calculatePercentageMatch } from './reviewUtils';
import { IssueForm } from './types';

interface ScoreComparisonProps {
  issues: IssueForm[];
  auditScore: number;
}

const ScoreComparison = ({ issues, auditScore }: ScoreComparisonProps) => {
  const smeScore = calculateSMEScore(issues);
  const percentage = calculatePercentageMatch(smeScore, auditScore);

  const getPercentageColor = () => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">SME Score:</span>
        <span className={`font-semibold ${smeScore < 0 ? 'text-red-600' : 'text-gray-900'}`}>{smeScore}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">AI Score:</span>
        <span className="font-semibold text-gray-900">{auditScore}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Match:</span>
        <span className={`font-semibold ${getPercentageColor()}`}>{percentage}%</span>
      </div>
    </div>
  );
};

export default ScoreComparison;
