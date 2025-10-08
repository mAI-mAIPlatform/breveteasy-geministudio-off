import React from 'react';

interface ExercisesViewProps {
  onDownloadPdf: () => void;
  onBack: () => void;
  isGeneratingPdf: boolean;
}

const DownloadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const HomeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

export const ExercisesView: React.FC<ExercisesViewProps> = ({ onDownloadPdf, onBack, isGeneratingPdf }) => {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
        <div className="flex flex-col items-center mb-8">
            <div className="p-5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Exercices Générés !</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Votre document est prêt à être téléchargé au format PDF.</p>
        </div>
        
        <div className="flex flex-col gap-4">
            <button
                onClick={onDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all disabled:opacity-75 disabled:cursor-not-allowed disabled:scale-100"
            >
                {isGeneratingPdf ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Génération du PDF...
                    </>
                ) : (
                    <>
                        <DownloadIcon />
                        Télécharger en PDF
                    </>
                )}
            </button>
             <button
                onClick={onBack}
                className="w-full flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors mt-2"
            >
                <HomeIcon />
                Retour à l'accueil
            </button>
        </div>
      </div>
    </div>
  );
};