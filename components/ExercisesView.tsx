import React, { useState } from 'react';

interface ExercisesViewProps {
  onDownload: () => void;
  onCopy: () => void;
  title: string;
  description: string;
  buttonText: string;
}

const DownloadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;


export const ExercisesView: React.FC<ExercisesViewProps> = ({ onDownload, onCopy, title, description, buttonText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
            <div className="p-5 rounded-full bg-green-500/20 text-green-500 dark:text-green-300 mb-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="text-lg text-slate-700 dark:text-slate-400 mt-2">{description}</p>
        </div>
        
        <div className="flex flex-col gap-4">
            <button
                onClick={onDownload}
                className="w-full flex items-center justify-center px-8 py-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all disabled:opacity-75 disabled:cursor-not-allowed disabled:scale-100"
            >
                <DownloadIcon />
                {buttonText}
            </button>
             <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center px-8 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-md hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors"
            >
                {copied ? <CheckIcon className="h-5 w-5 mr-2 text-green-500"/> : <CopyIcon className="h-5 w-5 mr-2"/>}
                {copied ? 'Copié !' : 'Copier le HTML'}
            </button>
        </div>
      </div>
    </div>
  );
};