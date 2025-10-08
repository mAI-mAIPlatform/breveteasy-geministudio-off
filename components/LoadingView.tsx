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
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Effect for cycling through messages
  useEffect(() => {
    if (messageIndex >= MESSAGES.length - 1) {
      return;
    }
    const messageInterval = setInterval(() => {
      setMessageIndex(prevIndex => prevIndex + 1);
    }, 1500); 

    return () => clearInterval(messageInterval);
  }, [messageIndex, MESSAGES.length]);

  // Effect for smooth progress bar animation
  useEffect(() => {
    const totalDuration = (MESSAGES.length - 1) * 1500; // Total time should align with messages
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const calculatedProgress = Math.min(Math.round((elapsedTime / totalDuration) * 100), 99);
      setProgress(calculatedProgress);

      if (calculatedProgress >= 99) {
        clearInterval(progressInterval);
      }
    }, 50); // Update every 50ms for smoothness

    return () => clearInterval(progressInterval);
  }, [MESSAGES.length]);


  const message = MESSAGES[messageIndex] || '...';
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
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-150 ease-linear" style={{width: `${progress}%`}}></div>
          </div>
      </div>
    </div>
  );
};