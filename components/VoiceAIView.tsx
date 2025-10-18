import React, { useState } from 'react';
import type { SubscriptionPlan, Question } from '../types';

interface FlashAIViewProps {
  onGenerate: (level: string) => void;
  isLoading: boolean;
  question: Question | null;
  onClear: () => void;
}

const LEVELS = ['CM2', '6ème', '5ème', '4ème', '3ème', 'Brevet'];

export const FlashAIView: React.FC<FlashAIViewProps> = ({
  onGenerate,
  isLoading,
  question,
  onClear,
}) => {
  const [level, setLevel] = useState<string>('Brevet');
  const [showAnswer, setShowAnswer] = useState(false);

  const handleGenerate = () => {
    setShowAnswer(false);
    onGenerate(level);
  };
  
  const handleNewQuestion = () => {
      onClear();
      setShowAnswer(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white">FlashAI</h1>
        <p className="text-xl text-slate-700 dark:text-slate-400 mt-2">Générez une question aléatoire pour un test rapide.</p>
      </div>

      {!question && !isLoading && (
        <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div>
            <label htmlFor="level-select" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">
              Choisissez un niveau
            </label>
            <select
              id="level-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 text-slate-900 dark:text-slate-100"
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Générer une question
          </button>
        </div>
      )}

      {isLoading && (
          <div className="text-center p-8">
              <div className="w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-slate-600 dark:text-slate-400">Génération de la question...</p>
          </div>
      )}

      {question && !isLoading && (
        <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Question Flash</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{question.questionText}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, index) => {
                  const isCorrect = option === question.correctAnswer;
                  const buttonClass = showAnswer 
                    ? (isCorrect ? 'bg-green-500/80 text-white border-transparent' : 'bg-red-500/20 text-red-300 border-transparent opacity-70')
                    : 'bg-white/20 dark:bg-slate-800/60 border-white/30 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-400';

                return (
                  <button key={index} className={`p-4 rounded-2xl text-left text-lg transition-colors duration-300 border ${buttonClass}`} disabled>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {showAnswer && (
            <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl animate-fade-in">
                <h4 className="font-bold text-sky-800 dark:text-sky-300">Explication</h4>
                <p className="text-sky-900 dark:text-sky-200 mt-1">{question.explanation}</p>
            </div>
          )}
            
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button onClick={handleNewQuestion} className="w-full py-3 px-4 bg-white/20 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors">
                Nouvelle question
            </button>
            {!showAnswer && (
                 <button onClick={() => setShowAnswer(true)} className="w-full py-3 px-4 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-colors">
                    Révéler la réponse
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
