
import React, { useRef } from 'react';
import type { Quiz } from '../types';

interface ResultsViewProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  quiz: Quiz | null;
  userAnswers: (string | null)[];
  xpGained: number;
  leveledUp: boolean;
}

const CheckIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const CrossIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.607a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const InfoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;

export const ResultsView: React.FC<ResultsViewProps> = ({ score, totalQuestions, onRestart, quiz, userAnswers, xpGained, leveledUp }) => {
  const correctionRef = useRef<HTMLDivElement>(null);
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const scoreOutOf20 = totalQuestions > 0 ? ((score / totalQuestions) * 20).toFixed(1) : "0.0";

  const getFeedback = () => {
    if (percentage >= 80) {
      return { message: "Excellent travail !", color: "text-green-600 dark:text-green-400" };
    }
    if (percentage >= 50) {
      return { message: "Bien joué, continuez comme ça !", color: "text-blue-600 dark:text-blue-400" };
    }
    return { message: "Ne baissez pas les bras, la persévérance paie !", color: "text-red-600 dark:text-red-500" };
  };

  const feedback = getFeedback();

  const scrollToCorrection = () => {
    correctionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl mb-8 dark:border dark:border-gray-700">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Résultats du Quiz</h2>
          
          <div className="relative my-6">
              <svg className="w-48 h-48" viewBox="0 0 36 36">
                  <path className="text-gray-200 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className={feedback.color} strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">{scoreOutOf20}</span>
                  <span className="text-xl text-gray-500 dark:text-gray-400">/ 20</span>
              </div>
          </div>

          <p className={`text-2xl font-semibold ${feedback.color}`}>{feedback.message}</p>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Cela correspond à {percentage}% de bonnes réponses.</p>
          
          {xpGained > 0 && (
            <div className="my-6 p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700/50 rounded-lg text-yellow-800 dark:text-yellow-300 animate-fade-in-up">
              <p className="font-bold text-lg">+{xpGained} XP</p>
              {leveledUp && <p className="font-bold text-green-600 dark:text-green-400 text-xl mt-1">Niveau Supérieur !</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button onClick={onRestart} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all w-full sm:w-auto">
                Accueil
            </button>
            <button onClick={scrollToCorrection} className="px-8 py-4 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 font-bold rounded-lg shadow-lg hover:bg-blue-50 dark:hover:bg-gray-600 transform hover:scale-105 transition-all w-full sm:w-auto">
                Voir la correction
            </button>
          </div>
      </div>

      <div ref={correctionRef} className="w-full mt-12 bg-gray-50 dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-inner border border-gray-200 dark:border-gray-700">
            <h3 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 text-center">Correction détaillée</h3>
            <div className="space-y-6">
                {quiz?.questions.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{index + 1}. {question.questionText}</p>
                            <div className="mb-3">
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Votre réponse :</span>
                                {userAnswer ? (
                                    <div className={`mt-1 flex items-center p-3 rounded-lg border ${isCorrect ? 'bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                                        {isCorrect ? <CheckIcon /> : <CrossIcon />}
                                        <span>{userAnswer}</span>
                                    </div>
                                ) : (
                                    <div className="mt-1 flex items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                                        <span>Vous n'avez pas répondu.</span>
                                    </div>
                                )}
                            </div>
                            {!isCorrect && (
                                <div className="mb-3">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Bonne réponse :</span>
                                    <div className="mt-1 flex items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                                        <CheckIcon />
                                        <span>{question.correctAnswer}</span>
                                    </div>
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Explication :</span>
                                <div className="mt-1 flex items-start p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                                   <InfoIcon />
                                   <p className="flex-1">{question.explanation}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
