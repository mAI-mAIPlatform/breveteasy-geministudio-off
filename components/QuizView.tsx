import React, { useState } from 'react';
import type { Quiz, Question } from '../types';

interface QuizViewProps {
  quiz: Quiz;
  onSubmit: (answers: (string | null)[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
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
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-[0_0_20px_rgba(167,139,250,0.5)] scale-105'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-sky-300 dark:hover:border-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

export const QuizView: React.FC<QuizViewProps> = ({ quiz, onSubmit, currentQuestionIndex, setCurrentQuestionIndex }) => {
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(quiz.questions.length).fill(null));
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  
  const totalQuestions = quiz.questions.length;

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setAnimationClass('animate-slide-out-left');
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnimationClass('animate-slide-in-right');
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setAnimationClass('animate-slide-out-right');
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
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
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-lg flex-grow flex items-center justify-center ${animationClass} mt-6`}>
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
          className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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