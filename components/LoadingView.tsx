import React from 'react';

interface LoadingViewProps {
  subject: string;
  task: 'quiz' | 'exercises' | 'cours' | 'fiche-revisions';
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

export const LoadingView: React.FC<LoadingViewProps> = ({ subject, task }) => {
  const safeSubject = subject || 'ce sujet';
  
  const titleTextMap = {
    quiz: 'du quiz',
    exercises: 'des exercices',
    cours: 'du cours',
    'fiche-revisions': 'de la fiche de révisions',
  };
  const titleText = titleTextMap[task] || 'du contenu';

  const loadingMessage = `Génération ${titleText} de <span class="text-indigo-500 dark:text-sky-300">${safeSubject}</span>`;


  return (
    <div className="flex flex-col items-center justify-center text-center h-full space-y-8 w-full p-4 bg-black/10 dark:bg-slate-900/60 backdrop-filter backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl">
      <LoadingSpinner />
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100" dangerouslySetInnerHTML={{ __html: loadingMessage }}></h2>
    </div>
  );
};
