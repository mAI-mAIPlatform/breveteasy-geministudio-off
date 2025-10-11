import React, { useState, useEffect } from 'react';
import type { Quiz, Question } from '../types';

interface QuizViewProps {
  quiz: Quiz;
  onSubmit: (answers: (string | null)[]) => void;
}

const QuestionDisplay: React.FC<{
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: string | null;
  onOptionSelect: (option: string) => void;
}> = ({ question, questionNumber, totalQuestions, selectedOption, onOptionSelect }) => (
  <div className="w-full">
    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Question {questionNumber} / {totalQuestions}</p>
    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{question.questionText}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options.map((option, index) => {
        const isSelected = selectedOption === option;
        return (
          <button
            key={index}
            onClick={() => onOptionSelect(option)}
            className={`p-4 rounded-2xl text-left text-lg transition-all duration-300 border ${
              isSelected
                ? 'bg-sky-400/30 dark:bg-sky-400/40 text-white border-sky-300 dark:border-sky-400 shadow-[0_0_20px_theme(colors.sky.400)] scale-105'
                : 'bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-sky-300 dark:hover:border-sky-400 hover:bg-white/40 dark:hover:bg-slate-700/60'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

export const QuizView: React.FC<QuizViewProps> = ({ quiz, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(quiz.questions.length).fill(null));
  const [progress, setProgress] = useState(0);
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  
  const totalQuestions = quiz.questions.length;

  useEffect(() => {
    setProgress(((currentQuestionIndex + 1) / totalQuestions) * 100);
  }, [currentQuestionIndex, totalQuestions]);

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setAnimationClass('animate-slide-out-left');
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnimationClass('animate-slide-in-right');
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setAnimationClass('animate-slide-out-right');
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setAnimationClass('animate-slide-in-left');
      }, 300);
    }
  };
  
  const handleSubmit = () => {
    onSubmit(answers);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col">
      <div className="mb-6">
        <div className="w-full bg-black/10 dark:bg-slate-800/50 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-indigo-400 to-sky-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, boxShadow: '0 0 10px theme(colors.sky.400)' }}></div>
        </div>
      </div>

      <div className={`bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-lg flex-grow flex items-center justify-center ${animationClass}`}>
        <QuestionDisplay
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          selectedOption={answers[currentQuestionIndex]}
          onOptionSelect={handleOptionSelect}
        />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-md hover:bg-white/40 dark:hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>
        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-indigo-500/80 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-600/80 disabled:opacity-50 transition-all transform hover:scale-105"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-green-500/80 text-white font-bold rounded-xl shadow-lg hover:bg-green-600/80 transition-all animate-pulse transform hover:scale-105"
          >
            Terminer le Quiz
          </button>
        )}
      </div>
    </div>
  );
};