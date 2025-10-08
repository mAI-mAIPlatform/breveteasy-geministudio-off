import React, { useState, useEffect } from 'react';

interface LoadingViewProps {
  subject: string;
  task: 'quiz' | 'exercises';
}

const LoadingSpinner: React.FC = () => (
  <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
);

const QUIZ_LOADING_MESSAGES = [
  "Brevet AI prépare vos questions...",
  "Recherche des notions clés...",
  "Formulation des options de réponse...",
  "Finalisation du quiz...",
  "Le quiz est prêt !"
];

const EXERCISES_LOADING_MESSAGES = [
    "Brevet AI conçoit vos exercices...",
    "Sélection des thèmes pertinents...",
    "Rédaction des énoncés et corrigés...",
    "Mise en page du document...",
    "Le document est presque prêt..."
];


export const LoadingView: React.FC<LoadingViewProps> = ({ subject, task }) => {
  const MESSAGES = task === 'quiz' ? QUIZ_LOADING_MESSAGES : EXERCISES_LOADING_MESSAGES;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    // Stop the interval once we've reached the last message
    if (currentIndex >= MESSAGES.length - 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }, 1500); // Speed up the interval slightly for a better feel

    return () => clearInterval(intervalId);
  }, [currentIndex, MESSAGES.length]);

  const progressPoints = [10, 30, 55, 80, 98];
  const progress = progressPoints[currentIndex] || 0;
  const message = MESSAGES[currentIndex] || '...';
  const titleText = task === 'quiz' ? 'du quiz' : 'des exercices';

  return (
    <div className="flex flex-col items-center justify-center text-center h-full space-y-8 w-full">
      <LoadingSpinner />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Génération {titleText} de <span className="text-blue-600 dark:text-blue-400">{subject}</span></h2>
      
      <div className="w-full max-w-md px-4">
          <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-blue-700 dark:text-blue-400 animate-pulse">{message}</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{width: `${progress}%`}}></div>
          </div>
      </div>
    </div>
  );
};
