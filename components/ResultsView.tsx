import React, { useRef } from 'react';
import type { Quiz } from '../types';

interface ResultsViewProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  quiz: Quiz | null;
  userAnswers: (string | null)[];
}

const CheckIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const CrossIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.607a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const InfoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;

export const ResultsView: React.FC<ResultsViewProps> = ({ score, totalQuestions, onRestart, quiz, userAnswers }) => {
  const correctionRef = useRef<HTMLDivElement>(null);
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const scoreOutOf20 = totalQuestions > 0 ? ((score / totalQuestions) * 20).toFixed(1) : "0.0";

  const getFeedback = () => {
    if (percentage >= 80) {
      return { message: "Excellent travail !", color: "text-green-500 dark:text-green-400", stroke: "stroke-green-500" };
    }
    if (percentage >= 50) {
      return { message: "Bien joué, continuez comme ça !", color: "text-sky-500 dark:text-sky-400", stroke: "stroke-sky-500" };
    }
    return { message: "Ne baissez pas les bras, la persévérance paie !", color: "text-red-500 dark:text-red-400", stroke: "stroke-red-500" };
  };

  const feedback = getFeedback();

  const scrollToCorrection = () => {
    correctionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-xl mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Résultats du Quiz</h2>
          
          <div className="relative my-6" style={{filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.1))'}}>
              <svg className="w-48 h-48" viewBox="0 0 36 36">
                  <path className="stroke-black/10 dark:stroke-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                  <path className={feedback.stroke} strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">{scoreOutOf20}</span>
                  <span className="text-xl text-gray-600 dark:text-gray-400">/ 20</span>
              </div>
          </div>

          <p className={`text-2xl font-semibold ${feedback.color}`}>{feedback.message}</p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">Cela correspond à {percentage}% de bonnes réponses.</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <button onClick={onRestart} className="px-8 py-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all w-full sm:w-auto">
                Accueil
            </button>
            <button onClick={scrollToCorrection} className="px-8 py-4 bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-white/30 dark:border-white/20 text-indigo-500 dark:text-sky-300 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-black/30 transform hover:scale-105 transition-all w-full sm:w-auto">
                Voir la correction
            </button>
          </div>
      </div>

      <div ref={correctionRef} className="w-full mt-12 bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-inner">
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">Correction détaillée</h3>
            <div className="space-y-6">
                {quiz?.questions.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    return (
                        <div key={index} className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-lg">
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{index + 1}. {question.questionText}</p>
                            <div className="mb-3">
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Votre réponse :</span>
                                {userAnswer ? (
                                    <div className={`mt-1 flex items-center p-3 rounded-lg border ${isCorrect ? 'bg-green-500/20 text-green-800 dark:text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30'}`}>
                                        {isCorrect ? <CheckIcon /> : <CrossIcon />}
                                        <span>{userAnswer}</span>
                                    </div>
                                ) : (
                                    <div className="mt-1 flex items-center p-3 rounded-lg bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30">
                                        <span>Vous n'avez pas répondu.</span>
                                    </div>
                                )}
                            </div>
                            {!isCorrect && (
                                <div className="mb-3">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Bonne réponse :</span>
                                    <div className="mt-1 flex items-center p-3 rounded-lg bg-green-500/20 text-green-800 dark:text-green-300 border-green-500/30">
                                        <CheckIcon />
                                        <span>{question.correctAnswer}</span>
                                    </div>
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Explication :</span>
                                <div className="mt-1 flex items-start p-3 rounded-lg bg-sky-500/20 text-sky-900 dark:text-sky-200 border-sky-500/30">
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