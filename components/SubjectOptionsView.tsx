// Fix: Provide the implementation for the SubjectOptionsView component.
import React, { useState } from 'react';
import type { Subject } from '../types';

interface SubjectOptionsViewProps {
  subject: Subject;
  onGenerateQuiz: (customPrompt: string, count: number) => void;
  onGenerateExercises: (customPrompt: string, count: number) => void;
  onBack: () => void;
}

const OptionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full text-left p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out dark:border dark:border-gray-700 flex items-center space-x-5"
    >
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
    </button>
);


export const SubjectOptionsView: React.FC<SubjectOptionsViewProps> = ({ subject, onGenerateQuiz, onGenerateExercises, onBack }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [itemCount, setItemCount] = useState<number>(5);
  
  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="relative text-center mb-10">
            <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                {subject.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">Que souhaitez-vous faire ?</p>
        </div>

        <div className="mb-6 px-4 sm:px-0">
            <label htmlFor="custom-prompt" className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Instructions spécifiques (facultatif)
            </label>
            <textarea
                id="custom-prompt"
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder={`ex: "Concentre-toi sur la Première Guerre mondiale" ou "Crée un quiz sur les fonctions affines"`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laissez vide pour un contenu général sur le sujet.</p>
        </div>
        
        <div className="mb-8 px-4 sm:px-0">
            <h3 className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre de questions / exercices</h3>
            <div className="flex space-x-2 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
                {[5, 10, 15].map((count) => (
                    <button
                        key={count}
                        onClick={() => setItemCount(count)}
                        className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            itemCount === count
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        {count}
                    </button>
                ))}
            </div>
        </div>

        <main className="space-y-6">
            <OptionCard
                title="Générer un Quiz"
                description={`Testez vos connaissances avec un quiz de ${itemCount} questions.`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                onClick={() => onGenerateQuiz(customPrompt, itemCount)}
            />
             <OptionCard
                title="Générer des Exercices"
                description={`Recevez une fiche de ${itemCount} exercices avec corrigés.`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                onClick={() => onGenerateExercises(customPrompt, itemCount)}
            />
        </main>
    </div>
  );
};