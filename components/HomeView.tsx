import React from 'react';
import { SUBJECTS } from '../constants';
import type { Subject } from '../types';

const Header: React.FC = () => (
  <header className="text-center mb-12">
    <h1 className="text-5xl font-bold text-gray-800">Brevet' Easy</h1>
    <p className="text-xl text-gray-600 mt-2">
      Révisez intelligemment avec <span className="font-semibold text-blue-600">Brevet AI</span>
    </p>
  </header>
);

const SubjectCard: React.FC<{ subject: Subject; onSelect: () => void }> = ({ subject, onSelect }) => (
  <button
    onClick={onSelect}
    className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out w-full space-y-4"
  >
    <div className={`p-4 rounded-full ${subject.bgColor} ${subject.color} transition-colors duration-300`}>
      {subject.icon}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
      {subject.name}
    </h3>
    <p className="text-gray-500">Générer un quiz</p>
  </button>
);

const BrevetAICard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all p-6 text-left"
    >
        <div className="flex items-center">
            <div className="bg-white/90 p-3 rounded-full mr-5">
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <div>
                <h2 className="text-3xl font-bold flex items-center">
                    <svg className="w-8 h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.5,12,6.3,21.8a1,1,0,0,1-1.5-.8V3a1,1,0,0,1,1.5-.8L17.5,12Z" fill="currentColor"/></svg>
                    BrevetAI
                </h2>
                <p className="text-lg text-indigo-100 mt-1">
                    L'IA spécialisée pour les révisions du Brevet. Je suis là pour t'aider.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {SUBJECTS.map((subject) => (
          <SubjectCard key={subject.name} subject={subject} onSelect={() => onSubjectSelect(subject)} />
        ))}
      </div>

      <div className="mt-16 border-t-2 border-gray-100 pt-10">
         <BrevetAICard onClick={onStartChat} />
      </div>
    </main>
  </div>
);