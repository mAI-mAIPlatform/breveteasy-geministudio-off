
import React from 'react';

interface ResultsViewProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ score, totalQuestions, onRestart }) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getFeedback = () => {
    if (percentage >= 80) {
      return { message: "Excellent travail !", color: "text-green-600" };
    }
    if (percentage >= 50) {
      return { message: "Bien joué, continuez comme ça !", color: "text-blue-600" };
    }
    return { message: "Ne baissez pas les bras, la persévérance paie !", color: "text-red-600" };
  };

  const feedback = getFeedback();

  return (
    <div className="flex flex-col items-center justify-center text-center h-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Résultats du Quiz</h2>
        
        <div className="relative my-8">
            <svg className="w-48 h-48" viewBox="0 0 36 36">
                <path
                    className="text-gray-200"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <path
                    className={feedback.color}
                    strokeDasharray={`${percentage}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-gray-800">{score}</span>
                <span className="text-xl text-gray-500">/ {totalQuestions}</span>
            </div>
        </div>

        <p className={`text-2xl font-semibold ${feedback.color}`}>{feedback.message}</p>
        <p className="text-lg text-gray-600 mt-2 mb-8">Vous avez obtenu {percentage}% de bonnes réponses.</p>
        
        <button
            onClick={onRestart}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
        >
            Faire un autre quiz
        </button>
    </div>
  );
};
