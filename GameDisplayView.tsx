import React from 'react';
import type { Subject } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface GameDisplayViewProps {
  htmlContent: string | null;
  onGenerateAnother: (subject: Subject) => void;
  subject: Subject | null;
}

export const GameDisplayView: React.FC<GameDisplayViewProps> = ({ htmlContent, onGenerateAnother, subject }) => {
  const { t } = useLocalization();

  if (!htmlContent || !subject) {
    return (
      <div className="w-full text-center p-8">
        <h2 className="text-2xl font-bold">Erreur de génération</h2>
        <p className="text-slate-600 dark:text-slate-400">Le jeu n'a pas pu être généré. Veuillez réessayer.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Jeu sur : {t(subject.nameKey)}</h1>
      </div>
      <div className="aspect-[16/10] bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <iframe
          title={`Jeu - ${t(subject.nameKey)}`}
          srcDoc={htmlContent}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
       <div className="flex justify-center">
        <button
            onClick={() => onGenerateAnother(subject)}
            className="px-8 py-3 bg-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-600 transition-all transform hover:scale-105"
        >
            Générer un autre jeu
        </button>
      </div>
    </div>
  );
};