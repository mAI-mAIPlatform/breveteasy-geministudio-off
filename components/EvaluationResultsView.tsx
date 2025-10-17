import React from 'react';
import type { Evaluation, EvaluationResult, EvaluationAnswers, EvaluationQuestion } from '../types';

interface EvaluationResultsViewProps {
  evaluation: Evaluation;
  userAnswers: EvaluationAnswers;
  result: EvaluationResult;
  onRestart: () => void;
}

const CheckIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const CrossIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.607a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const InfoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;

const getCorrectAnswerText = (question: EvaluationQuestion): string => {
    switch(question.type) {
        case 'qcm':
        case 'short-text':
            return question.correctAnswer;
        case 'fill-in-the-blank':
            return question.correctAnswers.join(', ');
        case 'long-text':
            return question.idealAnswer;
        default:
            return "N/A";
    }
}

export const EvaluationResultsView: React.FC<EvaluationResultsViewProps> = ({ evaluation, userAnswers, result, onRestart }) => {
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Résultats de l'évaluation</h2>
          
          <div className="my-6">
              <span className="text-7xl font-bold text-slate-900 dark:text-slate-100">{result.totalScore.toFixed(1)}</span>
              <span className="text-4xl text-slate-600 dark:text-slate-400">/ 20</span>
          </div>

          <p className={`text-xl font-semibold text-slate-300`}>{result.overallFeedback}</p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <button onClick={onRestart} className="px-8 py-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all w-full sm:w-auto">
                Accueil
            </button>
          </div>
      </div>

      <div className="w-full mt-12 bg-black/5 dark:bg-slate-950/70 backdrop-blur-xl border border-white/10 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-inner">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-8 text-center">Correction détaillée</h3>
            <div className="space-y-6">
                {evaluation.questions.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const graded = result.gradedQuestions[index];
                    const isCorrect = graded?.isCorrect ?? false;
                    const correctAnswerText = getCorrectAnswerText(question);

                    const userAnswerText = Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer;

                    return (
                        <div key={index} className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 p-6 rounded-2xl shadow-lg">
                            <div className="flex justify-between items-start">
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex-1">{index + 1}. {question.questionText}</p>
                                <div className={`font-bold text-sm px-3 py-1 rounded-full ${isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {graded.scoreAwarded} / {question.points} pts
                                </div>
                            </div>
                            <div className="mb-3">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Votre réponse :</span>
                                <div className={`mt-1 flex items-center p-3 rounded-lg border ${isCorrect ? 'bg-green-500/20 text-green-800 dark:text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30'}`}>
                                    {isCorrect ? <CheckIcon /> : <CrossIcon />}
                                    <span className="italic">{userAnswerText || "Pas de réponse"}</span>
                                </div>
                            </div>
                            {!isCorrect && (
                                <div className="mb-3">
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Réponse attendue :</span>
                                    <div className="mt-1 flex items-start p-3 rounded-lg bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20">
                                        <InfoIcon />
                                        <p className="flex-1">{correctAnswerText}</p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Correction :</span>
                                <div className="mt-1 flex items-start p-3 rounded-lg bg-slate-500/10 text-slate-900 dark:text-slate-200 border-slate-500/20">
                                   <p className="flex-1">{graded.feedback}</p>
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
