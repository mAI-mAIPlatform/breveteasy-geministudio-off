
import React, { useState, useEffect } from 'react';

interface LoadingViewProps {
  subject: string;
}

const LoadingSpinner: React.FC = () => (
  <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
);

const LOADING_MESSAGES = [
  "Brevet AI prépare vos questions...",
  "Recherche des notions clés dans les annales...",
  "Formulation des options de réponse...",
  "Presque prêt ! Finalisation du quiz...",
  "Le quiz est en cours de préparation, merci de patienter."
];

export const LoadingView: React.FC<LoadingViewProps> = ({ subject }) => {
  const [message, setMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = LOADING_MESSAGES.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % (LOADING_MESSAGES.length -1) ; // Don't cycle to the last one which is a generic wait message
        return LOADING_MESSAGES[nextIndex];
      });
    }, 3000);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setMessage(LOADING_MESSAGES[LOADING_MESSAGES.length-1]);
    }, (LOADING_MESSAGES.length - 1) * 3000);


    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center h-full space-y-8">
      <LoadingSpinner />
      <h2 className="text-2xl font-bold text-gray-800">Génération du quiz de <span className="text-blue-600">{subject}</span></h2>
      <p className="text-lg text-gray-600 animate-pulse">{message}</p>
    </div>
  );
};
