import React from 'react';
import { SUBJECTS } from '../constants';
import type { Subject } from '../types';

const Header: React.FC = () => (
  <header className="text-center mb-12">
    <h1 className="text-6xl font-extrabold text-gray-900 dark:text-gray-50 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">Brevet' Easy</h1>
    <p className="text-xl text-gray-700 dark:text-gray-300 mt-2">
      Révisez intelligemment avec Brevet AI
    </p>
  </header>
);

const SubjectCard: React.FC<{ subject: Subject; onSelect: () => void }> = ({ subject, onSelect }) => (
  <button
    onClick={onSelect}
    className="group flex flex-col items-center justify-center p-6 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out w-full space-y-4"
  >
    <div className={`p-4 rounded-full ${subject.bgColor} transition-colors duration-300`}>
      {React.cloneElement(subject.icon, { className: `h-12 w-12 ${subject.color}`})}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-sky-300 transition-colors duration-300">
      {subject.name}
    </h3>
  </button>
);

const BrevetAICard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 text-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-[1.03] transition-all p-8 text-left"
    >
        <div className="flex items-center">
            <div className="bg-white/20 p-4 rounded-full mr-6 shadow-inner">
                <svg className="w-10 h-10 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
            </div>
            <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-50">
                    BrevetAI
                </h2>
                <p className="text-lg text-gray-800 dark:text-gray-200 mt-1">
                    L'IA spécialisée pour les révisions du Brevet.
                </p>
            </div>
        </div>
    </button>
);


interface HomeViewProps {
  onSubjectSelect: (subject: Subject) => void;
  onStartChat: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSubjectSelect, onStartChat }) => (
  <div className="w-full">
    <Header />
    <main>
       <div className="mb-12">
         <BrevetAICard onClick={onStartChat} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {SUBJECTS.map((subject) => (
          <SubjectCard key={subject.name} subject={subject} onSelect={() => onSubjectSelect(subject)} />
        ))}
      </div>
    </main>
  </div>
);