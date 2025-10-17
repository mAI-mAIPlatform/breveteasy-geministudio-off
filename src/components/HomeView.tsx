import React, { useState, useRef, useEffect } from 'react';
import { SUBJECTS } from '@/lib/constants';
import type { Subject } from '@/lib/types';

const Header: React.FC = () => (
  <header className="text-center mb-12">
    <h1 className="text-6xl font-extrabold text-slate-900 dark:text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">Brevet' Easy</h1>
    <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">
      Révisez avec nos outils IA de génération.
    </p>
  </header>
);

const SubjectCard: React.FC<{ subject: Subject; onSelect: () => void }> = ({ subject, onSelect }) => (
  <button
    onClick={onSelect}
    className="group flex flex-col items-center justify-center p-6 bg-white/10 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out w-full space-y-4"
  >
    <div className={`p-4 rounded-full ${subject.bgColor} transition-colors duration-300`}>
      {React.cloneElement(subject.icon, { className: `h-12 w-12 ${subject.color}`})}
    </div>
    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 dark:group-hover:text-sky-300 transition-colors duration-300">
      {subject.name}
    </h3>
  </button>
);

const BrevetAICard: React.FC<{
    onClick: () => void;
}> = ({ onClick }) => {
    return (
        <div className="w-full bg-white/10 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-lg p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center text-left w-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-sky-400 flex-shrink-0 mr-5 sm:mr-6 shadow-lg flex items-center justify-center">
                   <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        BrevetAI
                    </h2>
                    <p className="text-md text-slate-800 dark:text-slate-300 mt-1">
                        Obtenez de l'aide pour vos révisions.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
                <button onClick={onClick} className="w-full md:flex-grow-0 p-3 px-6 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all text-center">
                    Démarrer
                </button>
            </div>
        </div>
    );
};

const ImageGenerationCard: React.FC<{
    onClick: () => void;
    remaining: number;
}> = ({ onClick, remaining }) => {
    return (
        <div className="w-full bg-white/10 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-lg p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center text-left w-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-red-400 flex-shrink-0 mr-5 sm:mr-6 shadow-lg flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        FaceAI
                    </h2>
                    <p className="text-md text-slate-800 dark:text-slate-300 mt-1">
                       Créez une image à partir d'une description.
                    </p>
                </div>
            </div>
             <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
                <button onClick={onClick} className="w-full md:w-auto p-3 px-6 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all text-center">
                    Démarrer
                </button>
            </div>
        </div>
    );
};

interface HomeViewProps {
  onSubjectSelect: (subject: Subject) => void;
  onStartChat: () => void;
  onStartImageGeneration: () => void;
  remainingGenerations: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSubjectSelect, onStartChat, onStartImageGeneration, remainingGenerations }) => (
  <div className="w-full">
    <Header />
    <main>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         <BrevetAICard onClick={onStartChat} />
         <ImageGenerationCard onClick={onStartImageGeneration} remaining={remainingGenerations} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {SUBJECTS.map((subject) => (
          <SubjectCard key={subject.name} subject={subject} onSelect={() => onSubjectSelect(subject)} />
        ))}
      </div>
    </main>
    <footer className="text-center text-xs text-slate-500 dark:text-slate-400 mt-16 pb-4">
      26-3.0 &copy; All rights reserved | Brevet' Easy | Official App and Website
    </footer>
  </div>
);