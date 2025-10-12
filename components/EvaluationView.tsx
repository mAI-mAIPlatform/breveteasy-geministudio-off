import React, { useState } from 'react';
import type { Evaluation, EvaluationQuestion, EvaluationAnswers } from '../types';

const QuestionRenderer: React.FC<{
    question: EvaluationQuestion;
    index: number;
    answer: string | string[];
    onAnswerChange: (index: number, value: string | string[]) => void;
}> = ({ question, index, answer, onAnswerChange }) => {
    
    const baseInputClasses = "w-full p-3 bg-white/20 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base text-slate-900 dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-500 transition";

    switch (question.type) {
        case 'qcm':
            return (
                <div className="space-y-3">
                    {question.options.map((option, optIndex) => (
                        <button
                            key={optIndex}
                            onClick={() => onAnswerChange(index, option)}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                                answer === option 
                                ? 'bg-indigo-500 text-white border-transparent shadow-lg scale-105' 
                                : 'bg-white/10 dark:bg-slate-800/60 border-white/20 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            );
        
        case 'fill-in-the-blank':
            const parts = question.questionTextWithBlanks.split('{{BLANK}}');
            const answers = Array.isArray(answer) ? answer : [];
            
            const handleBlankChange = (blankIndex: number, value: string) => {
                const newAnswers = [...answers];
                newAnswers[blankIndex] = value;
                onAnswerChange(index, newAnswers);
            };

            return (
                <p className="text-lg leading-relaxed">
                    {parts.map((part, partIndex) => (
                        <React.Fragment key={partIndex}>
                            {part}
                            {partIndex < parts.length - 1 && (
                                <input
                                    type="text"
                                    value={answers[partIndex] || ''}
                                    onChange={(e) => handleBlankChange(partIndex, e.target.value)}
                                    className="inline-block w-40 mx-2 p-1 text-center bg-white/20 dark:bg-slate-800 border-b-2 border-indigo-400 focus:outline-none focus:ring-0 focus:border-sky-400"
                                />
                            )}
                        </React.Fragment>
                    ))}
                </p>
            );

        case 'short-text':
            return (
                <input
                    type="text"
                    value={answer as string || ''}
                    onChange={(e) => onAnswerChange(index, e.target.value)}
                    className={baseInputClasses}
                    placeholder="Votre réponse..."
                />
            );
        
        case 'long-text':
             return (
                <textarea
                    rows={5}
                    value={answer as string || ''}
                    onChange={(e) => onAnswerChange(index, e.target.value)}
                    className={baseInputClasses}
                    placeholder="Rédigez votre réponse ici..."
                />
            );

        default:
            return <p>Type de question non supporté.</p>;
    }
};

export const EvaluationView: React.FC<{
  evaluation: Evaluation;
  onSubmit: (answers: EvaluationAnswers) => void;
}> = ({ evaluation, onSubmit }) => {
  const [answers, setAnswers] = useState<EvaluationAnswers>({});

  const handleAnswerChange = (index: number, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    if (confirm("Êtes-vous sûr de vouloir terminer l'évaluation ? Vous ne pourrez plus modifier vos réponses.")) {
        onSubmit(answers);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100">{evaluation.title}</h1>
            <p className="text-xl text-slate-700 dark:text-slate-400 mt-2">{evaluation.subject}</p>
        </header>

        <div className="space-y-10">
            {evaluation.questions.map((question, index) => (
                <div key={index} className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex-1 pr-4">
                            Question {index + 1}
                        </h3>
                        <span className="text-sm font-semibold bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full">
                            {question.points} {question.points > 1 ? 'points' : 'point'}
                        </span>
                    </div>
                    <p className="text-lg text-slate-800 dark:text-slate-200 mb-6" dangerouslySetInnerHTML={{ __html: question.questionText }}></p>
                    <QuestionRenderer 
                        question={question}
                        index={index}
                        answer={answers[index]}
                        onAnswerChange={handleAnswerChange}
                    />
                </div>
            ))}
        </div>

        <div className="mt-12 flex justify-center">
            <button
                onClick={handleSubmit}
                className="px-12 py-4 bg-green-500/80 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-green-600/80 transition-all transform hover:scale-105"
            >
                Terminer l'évaluation
            </button>
        </div>
    </div>
  );
};
