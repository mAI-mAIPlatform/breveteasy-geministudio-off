import React, { useState, useEffect } from 'react';

interface LoadingViewProps {
  subject: string;
  task: 'quiz' | 'exercises';
}

const LoadingSpinner: React.FC = () => (
  <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
);

const QUIZ_LOADING_MESSAGES = [
  "BrevetAI prépare vos questions...",
  "Recherche des notions clés...",
  "Formulation des options de réponse...",
  "Finalisation du quiz...",
  "Le quiz est prêt !"
];

const EXERCISES_LOADING_MESSAGES = [
    "BrevetAI conçoit vos exercices...",
    "Sélection des thèmes pertinents...",
    "Rédaction des énoncés et corrigés...",
    "Mise en page du document...",
    "Le document est presque prêt..."
];


export const LoadingView: React.FC<LoadingViewProps> = ({ subject, task }) => {
  const MESSAGES = task === 'quiz' ? QUIZ_LOADING_MESSAGES : EXERCISES_LOADING_MESSAGES;
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [progress, setProgress] = useState(0);
  
  const MESSAGE_CHANGE_INTERVAL = 2500; // ms between each full message
  const WORD_APPEAR_INTERVAL = 200; // ms between each word

  // Effect for cycling through messages
  useEffect(() => {
    if (messageIndex >= MESSAGES.length - 1) {
      return;
    }
    const messageInterval = setInterval(() => {
      setMessageIndex(prevIndex => prevIndex + 1);
    }, MESSAGE_CHANGE_INTERVAL); 

    return () => clearInterval(messageInterval);
  }, [messageIndex, MESSAGES.length]);

  // Effect for progressive word-by-word display
  useEffect(() => {
    const currentMessage = MESSAGES[messageIndex];
    // Prevent error if index is out of bounds or message is falsy (undefined, '')
    if (!currentMessage) {
        setDisplayedMessage('');
        return;
    }

    const words = currentMessage.split(' ');
    let currentWordIndex = 0;
    setDisplayedMessage(''); // Reset for the new message

    const wordInterval = setInterval(() => {
      if (currentWordIndex < words.length) {
        setDisplayedMessage(prev => prev ? `${prev} ${words[currentWordIndex]}` : words[currentWordIndex]);
        currentWordIndex++;
      } else {
        clearInterval(wordInterval);
      }
    }, WORD_APPEAR_INTERVAL);

    return () => clearInterval(wordInterval);
  }, [messageIndex, MESSAGES]);


  // Effect for smooth progress bar animation
  useEffect(() => {
    const totalDuration = (MESSAGES.length - 1) * MESSAGE_CHANGE_INTERVAL;
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const calculatedProgress = Math.min(Math.round((elapsedTime / totalDuration) * 100), 99);
      setProgress(calculatedProgress);

      if (calculatedProgress >= 99) {
        clearInterval(progressInterval);
      }
    }, 50);

    return () => clearInterval(progressInterval);
  }, [MESSAGES.length]);


  const titleText = task === 'quiz' ? 'du quiz' : 'des exercices';

  return (
    <div className="flex flex-col items-center justify-center text-center h-full space-y-8 w-full">
      <LoadingSpinner />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Génération {titleText} de <span className="text-blue-600 dark:text-blue-400">{subject}</span></h2>
      
      <div className="w-full max-w-md px-4">
          <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-blue-700 dark:text-blue-400 min-h-[24px]">{displayedMessage}</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-150 ease-linear" style={{width: `${progress}%`}}></div>
          </div>
      </div>
    </div>
  );
};