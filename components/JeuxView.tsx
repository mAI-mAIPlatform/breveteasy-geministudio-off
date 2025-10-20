import React from 'react';
import { SUBJECTS } from '../constants';
import type { Subject } from '../types';
import { useLocalization } from '../hooks/useLocalization';

const SubjectCard: React.FC<{ subject: Subject; onSelect: () => void }> = ({ subject, onSelect }) => {
  const { t } = useLocalization();
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col items-center justify-center p-6 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl hover:border-sky-300/70 dark:hover:border-sky-400/70 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out w-full space-y-4"
    >
      <div className={`p-4 rounded-full ${subject.bgColor} transition-colors duration-300`}>
        {React.cloneElement(subject.icon, { className: `h-12 w-12 ${subject.color}` })}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 dark:group-hover:text-sky-300 transition-colors duration-300">
        {t(subject.nameKey)}
      </h3>
    </button>
  );
};

interface JeuxViewProps {
  onSelectSubject: (subject: Subject) => void;
}

export const JeuxView: React.FC<JeuxViewProps> = ({ onSelectSubject }) => {
  const { t } = useLocalization();
  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-slate-900 dark:text-slate-100">{t('games_title')}</h1>
        <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">
          {t('games_choose_subject')}
        </p>
      </header>
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SUBJECTS.filter(s => s.nameKey !== 'subject_games' && s.nameKey !== 'subject_arts').map((subject) => (
            <SubjectCard
              key={subject.nameKey}
              subject={subject}
              onSelect={() => onSelectSubject(subject)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};