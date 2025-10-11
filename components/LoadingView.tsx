import React, { useState, useEffect, useMemo } from 'react';

interface LoadingViewProps {
  subject: string;
  task: 'quiz' | 'exercises';
}

const LoadingSpinner: React.FC = () => (
  <div className="w-16 h-16">
    <svg className="w-full h-full animate-spin" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgb(129, 140, 248)', stopOpacity: 1 }} /> 
          <stop offset="100%" style={{ stopColor: 'rgb(56, 189, 248)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke="url(#spinner-gradient)" 
        strokeWidth="5" 
        strokeLinecap="round"
        strokeDasharray="160"
        strokeDashoffset="100"
      />
    </svg>
  </div>
);


// This function now expects a valid subject string and capitalizes the messages.
const generateLoadingMessages = (subject: string, task: 'quiz' | 'exercises'): string[] => {
    // Helper to capitalize the first letter of a string.
    const capitalize = (s: string): string => {
        if (!s) return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const quizMessages = [
        `Analyse du programme de ${subject} pour le Brevet...`,
        `Identification des concepts clés en ${subject}...`,
        `Création de questions pertinentes sur le sujet...`
    ];
    
    const exerciseMessages = [
        `Recherche de thèmes d'exercices pour ${subject}...`,
        `Rédaction d'énoncés clairs et précis en ${subject}...`,
        `Préparation des corrigés détaillés pour chaque exercice...`
    ];
    
    const messages = task === 'quiz' ? quizMessages : exerciseMessages;
    
    return messages.map(capitalize);
};


export const LoadingView: React.FC<LoadingViewProps> = ({ subject, task }) => {
  // Define a safe subject name to prevent 'undefined' from appearing anywhere.
  const safeSubject = subject || 'ce sujet';
  
  // Use useMemo to generate messages only when subject or task change
  const MESSAGES = useMemo(() => generateLoadingMessages(safeSubject, task), [safeSubject, task]);
  
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [progress, setProgress] = useState(0);
  
  const MESSAGE_CHANGE_INTERVAL = 2500; // ms between each full message
  const WORD_APPEAR_INTERVAL = 100; // ms between each word

  // Effect for cycling through messages
  useEffect(() => {
    if (messageIndex >= MESSAGES.length - 1) {
      return;
    }
    const messageInterval = setInterval(() => {
      setMessageIndex(prevIndex => Math.min(prevIndex + 1, MESSAGES.length - 1));
    }, MESSAGE_CHANGE_INTERVAL); 

    return () => clearInterval(messageInterval);
  }, [messageIndex, MESSAGES.length]);

  // Effect for progressive word-by-word display
  useEffect(() => {
    const currentMessage = MESSAGES[messageIndex];
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
    const totalDuration = (MESSAGES.length) * MESSAGE_CHANGE_INTERVAL;
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const calculatedProgress = Math.min(Math.round((elapsedTime / totalDuration) * 100), 99);
      setProgress(calculatedProgress);

      if (calculatedProgress >= 99) {
        clearInterval(progressInterval);
      }
    }, 100);

    return () => clearInterval(progressInterval);
  }, [MESSAGES.length, MESSAGE_CHANGE_INTERVAL]);


  const titleText = task === 'quiz' ? 'du quiz' : 'des exercices';

  return (
    <div className="flex flex-col items-center justify-center text-center h-full space-y-8 w-full p-4 bg-black/10 dark:bg-black/20 backdrop-filter backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl">
      <LoadingSpinner />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Génération {titleText} de <span className="text-indigo-500 dark:text-sky-300">{safeSubject}</span></h2>
      
      <div className="w-full max-w-md px-4">
          <div className="flex justify-between items-end mb-2">
              <span className="text-base font-medium text-gray-800 dark:text-gray-300 text-left min-h-[48px] sm:min-h-[24px] flex items-center">{displayedMessage}</span>
              <span className="text-sm font-medium text-indigo-500 dark:text-sky-300">{progress}%</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-indigo-400 to-sky-400 h-2.5 rounded-full transition-all duration-150 ease-linear" style={{width: `${progress}%`, boxShadow: '0 0 10px theme(colors.sky.400)'}}></div>
          </div>
      </div>
    </div>
  );
};