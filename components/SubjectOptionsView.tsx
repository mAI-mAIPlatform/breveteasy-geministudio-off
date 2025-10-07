
import React from 'react';
import type { Subject } from '../types';

interface SubjectOptionsViewProps {
  subject: Subject;
  onStartQuiz: (subjectName: string) => void;
  onBack: () => void;
}

export const SubjectOptionsView: React.FC<SubjectOptionsViewProps> = ({ subject, onStartQuiz, onBack }) => {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className={`p-5 rounded-full ${subject.bgColor} ${subject.color} mb-4`}>
            {React.cloneElement(subject.icon, { className: "h-16 w-16" })}
          </div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{subject.name}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Préparez-vous pour le quiz !</p>
        </div>
        
        <div className="space-y-4 mb-8">
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Niveau : Brevet des collèges</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Nombre de questions : 15</p>
            </div>
        </div>

        <div className="flex flex-col gap-4">
            <button
                onClick={() => onStartQuiz(subject.name)}
                className="w-full px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
            >
                Commencer le Quiz
            </button>
             <button
                onClick={onBack}
                className="w-full px-6 py-3 bg-transparent text-gray-600 dark:text-gray-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                Changer de matière
            </button>
        </div>
      </div>
    </div>
  );
};
