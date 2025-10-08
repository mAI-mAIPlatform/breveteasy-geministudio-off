
import React from 'react';
import type { Subject } from '../types';

interface SubjectOptionsViewProps {
  subject: Subject;
  onStartQuiz: (subjectName: string) => void;
  onGenerateExercises: (subjectName: string) => void;
  onBack: () => void;
}

const DownloadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const QuizIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export const SubjectOptionsView: React.FC<SubjectOptionsViewProps> = ({ subject, onStartQuiz, onGenerateExercises, onBack }) => {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className={`p-5 rounded-full ${subject.bgColor} ${subject.color} mb-4`}>
            {React.cloneElement(subject.icon, { className: "h-16 w-16" })}
          </div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{subject.name}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Que souhaitez-vous faire ?</p>
        </div>
        
        <div className="space-y-4 mb-8">
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-left">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Quiz : 15 questions à choix multiples pour tester vos connaissances.</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-left">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Exercices : 5 exercices de type Brevet avec corrigés détaillés (téléchargeable).</p>
            </div>
        </div>

        <div className="flex flex-col gap-4">
            <button
                onClick={() => onStartQuiz(subject.name)}
                className="w-full flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
            >
                <QuizIcon />
                Commencer le Quiz
            </button>
            <button
                onClick={() => onGenerateExercises(subject.name)}
                className="w-full flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all"
            >
                <DownloadIcon />
                Générer les Exercices
            </button>
             <button
                onClick={onBack}
                className="w-full px-6 py-3 bg-transparent text-gray-600 dark:text-gray-400 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-4"
            >
                Changer de matière
            </button>
        </div>
      </div>
    </div>
  );
};
