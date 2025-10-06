
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
    <p className="text-sm font-semibold text-gray-500 mb-2">Question {questionNumber} / {totalQuestions}</p>
    <h3 className="text-2xl font-bold text-gray-800 mb-6">{question.questionText}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options.map((option, index) => {
        const isSelected = selectedOption === option;
        return (
          <button
            key={index}
            onClick={() => onOptionSelect(option)}
            className={`p-4 rounded-lg text-left text-lg transition-all duration-200 border-2 ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-700 shadow-lg scale-105'
                : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300'
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
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = () => {
    onSubmit(answers);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Quiz: {quiz.subject}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-2xl shadow-inner flex-grow flex items-center justify-center">
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
          className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>
        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-colors animate-pulse"
          >
            Terminer le Quiz
          </button>
        )}
      </div>
    </div>
  );
};
