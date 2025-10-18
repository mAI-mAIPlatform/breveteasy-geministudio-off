import React from 'react';
import { SUBJECTS } from '../constants';
import type { Subject, SubscriptionPlan } from '../types';

const Header: React.FC = () => (
  <header className="text-center mb-12">
    <h1 className="text-6xl font-extrabold text-slate-900 dark:text-slate-100 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">Brevet' Easy</h1>
    <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">
      Révisez et préparez-vous avec nos outils IA et quiz...
    </p>
  </header>
);

const SubjectCard: React.FC<{ subject: Subject; onSelect: () => void }> = ({ subject, onSelect }) => (
  <button
    onClick={onSelect}
    className="group flex flex-col items-center justify-center p-6 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl hover:border-sky-300/70 dark:hover:border-sky-400/70 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out w-full space-y-4"
  >
    <div className={`p-4 rounded-full ${subject.bgColor} transition-colors duration-300`}>
      {React.cloneElement(subject.icon, { className: `h-12 w-12 ${subject.color}`})}
    </div>
    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 dark:group-hover:text-sky-300 transition-colors duration-300">
      {subject.name}
    </h3>
  </button>
);

const CompactFeatureCard: React.FC<{
    onClick: () => void;
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
}> = ({ onClick, title, description, icon, gradient }) => (
    <button
        onClick={onClick}
        className="group relative w-full p-6 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl hover:border-sky-300/70 dark:hover:border-sky-400/70 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col items-center justify-center space-y-2 text-center"
    >
        <div className={`w-24 h-24 rounded-full ${gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 mb-3`}>
            {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-200">
            {description}
        </p>
    </button>
);

interface HomeViewProps {
  onSubjectSelect: (subject: Subject) => void;
  onStartDrawing: () => void;
  onStartChat: () => void;
  onStartImageGeneration: () => void;
  onStartCanvas: () => void;
  onStartFlashAI: () => void;
  onStartPlanning: () => void;
  onStartConseils: () => void;
  subscriptionPlan: SubscriptionPlan;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSubjectSelect, onStartDrawing, onStartChat, onStartImageGeneration, onStartCanvas, onStartFlashAI, onStartPlanning, onStartConseils }) => (
  <div className="w-full">
    <Header />
    <main>
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-8">
            <CompactFeatureCard 
                onClick={onStartChat}
                title="BrevetAI"
                description="IA du quotidien"
                icon={<svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>}
                gradient="bg-gradient-to-br from-purple-500 to-sky-400"
            />
            <CompactFeatureCard 
                onClick={onStartImageGeneration}
                title="FaceAI"
                description="Générez des images"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                gradient="bg-gradient-to-br from-sky-400 to-red-400"
            />
            <CompactFeatureCard 
                onClick={onStartCanvas}
                title="CanvasAI"
                description="Développez des pages"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                gradient="bg-gradient-to-br from-teal-400 to-blue-500"
            />
            <CompactFeatureCard 
                onClick={onStartFlashAI}
                title="FlashAI"
                description="Quiz instantanés"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                gradient="bg-gradient-to-br from-amber-400 to-orange-500"
            />
            <CompactFeatureCard 
                onClick={onStartPlanning}
                title="PlanningAI"
                description="Organisez vos révisions"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                gradient="bg-gradient-to-br from-indigo-400 to-purple-500"
            />
            <CompactFeatureCard 
                onClick={onStartConseils}
                title="ConseilsAI"
                description="Stratégies d'experts"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 18.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0zM3 12h1m16 0h1M5.636 6.364l.707.707m12.728 12.728l.707.707" /></svg>}
                gradient="bg-gradient-to-br from-sky-400 to-teal-300"
            />
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {SUBJECTS.map((subject) => (
          <SubjectCard 
            key={subject.name} 
            subject={subject} 
            onSelect={() => {
              if (subject.name === 'Arts') onStartDrawing();
              else onSubjectSelect(subject);
            }} />
        ))}
      </div>
    </main>
    <footer className="text-center text-xs text-slate-500 dark:text-slate-400 mt-16 pb-4">
      26-3.8 © 2025 - All rights reserved | Brevet' Easy | Propulsé par mAI
    </footer>
  </div>
);
