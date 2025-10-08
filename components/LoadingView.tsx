
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
  "Recherche des notions clés dans les annales...",
  "Formulation des options de réponse...",
  "Presque prêt ! Finalisation du quiz...",
  "Le quiz est en cours de préparation, merci de patienter."
];

const EXERCISES_LOADING_MESSAGES = [
    "Brevet AI conçoit vos exercices...",
    "Sélection des thèmes pertinents...",
    "Rédaction des énoncés et des corrigés...",
    "Mise en page du document PDF...",
    "Le document est presque prêt..."
];


export const LoadingView: React.FC<LoadingViewProps> = ({ subject, task }) => {
  const MESSAGES = task === 'quiz' ? QUIZ_LOADING_MESSAGES : EXERCISES_LOADING_MESSAGES;
  const [message, setMessage] = useState(MESSAGES[0]);

  useEffect(() => {
    const intervalDuration = 2000;
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = MESSAGES.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % (MESSAGES.length -1) ; // Don't cycle to the last one which is a generic wait message
        return MESSAGES[nextIndex];
      });
    }, intervalDuration);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setMessage(MESSAGES[MESSAGES.length-1]);
    }, (MESSAGES.length - 1) * intervalDuration);


    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [MESSAGES]);

  const titleText = task === 'quiz' ? 'du quiz' : 'des exercices';

  return (
    <div className="flex flex-col items-center justify-center text-center h-full space-y-8">
      <LoadingSpinner />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Génération {titleText} de <span className="text-blue-600 dark:text-blue-400">{subject}</span></h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">{message}</p>
    </div>
  );
};
