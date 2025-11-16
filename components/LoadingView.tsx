import React, { useState, useEffect } from 'react';

interface LoadingViewProps {
  subject: string;
  task: 'quiz' | 'exercises' | 'cours' | 'fiche-revisions' | 'canvas' | 'flashAI' | 'planning' | 'conseils' | 'game' | 'gamesAI';
  onCancel: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-24 h-24 relative">
        <svg className="w-full h-full animate-spin" style={{ animationDuration: '1.5s' }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(129, 140, 248)" />
                    <stop offset="100%" stopColor="rgb(56, 189, 248)" />
                </linearGradient>
            </defs>
            <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="rgba(129, 140, 248, 0.15)" 
                strokeWidth="8" 
            />
            <path
                d="M 50,5 A 45,45 0 1 1 5,50"
                fill="none"
                stroke="url(#spinner-gradient)"
                strokeWidth="8"
                strokeLinecap="round"
            />
        </svg>
         <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-twinkle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M18 8 L19.25 5.25 L22 4 L19.25 2.75 L18 0 L16.75 2.75 L14 4 L16.75 5.25 Z M10 22 L11.25 19.25 L14 18 L11.25 16.75 L10 14 L8.75 16.75 L6 18 L8.75 19.25 Z M18 22 L16.75 19.25 L14 18 L16.75 16.75 L18 14 L19.25 16.75 L22 18 L19.25 19.25 Z M4 8 L2.75 5.25 L0 4 L2.75 2.75 L4 0 L5.25 2.75 L8 4 L5.25 5.25 Z" />
            </svg>
        </div>
    </div>
);


const loadingTips = {
    quiz: [
        "L'IA sélectionne les questions les plus pertinentes...",
        "Création de distracteurs plausibles pour les QCM...",
        "On prépare un quiz sur mesure pour vous !",
        "Vérification du niveau de difficulté...",
        "On y est presque !"
    ],
    exercises: [
        "Recherche des concepts clés à aborder...",
        "Formulation des énoncés d'exercices...",
        "Rédaction d'un corrigé détaillé...",
        "Construction de votre fiche d'exercices...",
        "Finalisation en cours..."
    ],
    cours: [
        "Analyse des points essentiels du programme...",
        "Structuration du plan de la fiche de cours...",
        "Rédaction des définitions et des exemples...",
        "Synthèse des informations importantes...",
        "Mise en page pour une lecture facile..."
    ],
    'fiche-revisions': [
        "Synthèse des notions fondamentales...",
        "Identification des points à ne pas oublier...",
        "Organisation des idées de manière logique...",
        "Mise en évidence des mots-clés...",
        "Votre fiche de révisions est bientôt prête !"
    ],
    canvas: [
        "L'IA prépare votre toile numérique...",
        "Génération du code HTML, CSS, et JavaScript...",
        "Création d'une page interactive...",
        "Votre page web est presque prête !",
    ],
    flashAI: [
        "Recherche d'une question pertinente...",
        "Génération d'un défi rapide...",
        "Préparation de votre question flash...",
        "C'est presque prêt !",
    ],
    planning: [
        "Analyse de votre tâche et de l'échéance...",
        "Décomposition du travail en étapes...",
        "Organisation de votre calendrier...",
        "Votre planning de révision est en cours de création...",
    ],
    conseils: [
        "Consultation de stratégies d'experts...",
        "Synthèse des meilleures techniques...",
        "Rédaction de conseils personnalisés...",
        "Vos conseils sur mesure arrivent !",
    ],
    game: [
        "Invention des règles du jeu...",
        "L'IA code un mini-jeu pour vous...",
        "Préparation d'une expérience ludique...",
        "Votre jeu est presque prêt !",
    ],
    gamesAI: [
        "L'IA imagine un concept de jeu original...",
        "Écriture du code du jeu en HTML, CSS et JS...",
        "Test et débogage du gameplay...",
        "Création des graphismes en pur CSS...",
        "Votre jeu personnalisé arrive !",
    ],
};

export const LoadingView: React.FC<LoadingViewProps> = ({ subject, task, onCancel }) => {
  const safeSubject = subject || 'ce sujet';
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const titleTextMap = {
    quiz: 'du quiz',
    exercises: 'des exercices',
    cours: 'du cours',
    'fiche-revisions': 'de la fiche de révisions',
    canvas: 'de la page interactive',
    flashAI: 'de la question flash',
    planning: 'du planning',
    conseils: 'des conseils',
    game: 'du jeu',
    gamesAI: 'du jeu personnalisé',
  };
  const titleText = titleTextMap[task] || 'du contenu';

  const loadingMessage = `Génération ${titleText} de <span class="text-indigo-500 dark:text-sky-300">${safeSubject}</span>`;
  const tipsForTask = loadingTips[task] || loadingTips.quiz;

  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentTipIndex(prevIndex => (prevIndex + 1) % tipsForTask.length);
    }, 3000); // Change tip every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [tipsForTask.length]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center text-center bg-[#f0f2f5] dark:bg-black p-4">
      <button
        onClick={onCancel}
        title="Annuler"
        aria-label="Annuler la génération"
        className="absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 z-[210] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-slate-800 shadow-lg backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:bg-white/20 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800/60 border border-white/20 dark:border-slate-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <LoadingSpinner />
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100" dangerouslySetInnerHTML={{ __html: loadingMessage }}></h2>
        <p key={currentTipIndex} className="text-lg text-slate-600 dark:text-slate-400 mt-4 animate-fade-in">
            <span className="reflection-text">{tipsForTask[currentTipIndex]}</span>
        </p>
      </div>
    </div>
  );
};
