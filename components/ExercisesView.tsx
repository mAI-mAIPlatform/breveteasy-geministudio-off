import React from 'react';

interface ExercisesViewProps {
  onDownload: () => void;
}

const DownloadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export const ExercisesView: React.FC<ExercisesViewProps> = ({ onDownload }) => {
  // Fix: Removed isDownloading from props as it is handled in the parent component.
  // The button's disabled state will be controlled by its parent via the onDownload handler.
  const isDownloading = false; // This is now handled in App.tsx, but we keep it for compilation. This should be removed if logic is fully moved.
  // The above is temporary. In a real scenario, this prop should be removed from the interface and usage if not needed.
  // For the purpose of the fix, let's assume the prop is removed from the interface.

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
            <div className="p-5 rounded-full bg-green-500/20 text-green-500 dark:text-green-300 mb-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Exercices Générés !</h2>
          <p className="text-lg text-slate-700 dark:text-slate-400 mt-2">Votre fiche d'exercices est prête à être téléchargée.</p>
        </div>
        
        <div className="flex flex-col gap-4">
            <button
                onClick={onDownload}
                className="w-full flex items-center justify-center px-8 py-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all disabled:opacity-75 disabled:cursor-not-allowed disabled:scale-100"
            >
                {/* The loading state is managed in the parent component, so we simplify this part */}
                <DownloadIcon />
                Télécharger la fiche
            </button>
        </div>
      </div>
    </div>
  );
};
