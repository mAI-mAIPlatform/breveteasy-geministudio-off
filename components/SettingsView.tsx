import React from 'react';
import type { SubscriptionPlan } from '../types';

interface SettingsViewProps {
  onBack: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  aiSystemInstruction: string;
  onAiSystemInstructionChange: (instruction: string) => void;
  subscriptionPlan: SubscriptionPlan;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, theme, onThemeChange, aiSystemInstruction, onAiSystemInstructionChange, subscriptionPlan }) => {
  const isCustomInstructionDisabled = subscriptionPlan === 'free';
  
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <header className="flex items-center justify-between pb-4 border-b border-white/20 dark:border-slate-700 mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Paramètres</h2>
            <button onClick={onBack} title="Fermer" className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-slate-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </header>
        
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Thème d'affichage</h3>
                <div className="flex space-x-2 rounded-xl bg-black/10 dark:bg-slate-800 p-1">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => onThemeChange(t)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        theme === t
                            ? 'bg-white dark:bg-slate-950 text-indigo-500 dark:text-sky-300 shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        {t === 'light' ? 'Clair' : t === 'dark' ? 'Sombre' : 'Système'}
                    </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Instructions pour BrevetAI</h3>
                <textarea
                    rows={4}
                    value={aiSystemInstruction}
                    onChange={(e) => onAiSystemInstructionChange(e.target.value)}
                    className={`w-full p-3 bg-white/20 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base placeholder-slate-600 dark:placeholder-slate-500 transition ${isCustomInstructionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Ex: 'Sois toujours très encourageant et utilise un langage simple.' ou 'Fais des blagues sur l'histoire de temps en temps.'"
                    disabled={isCustomInstructionDisabled}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Cette instruction sera appliquée à toutes les futures interactions avec BrevetAI (quiz, exercices et chat).
                </p>
                {isCustomInstructionDisabled && (
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl" title="Fonctionnalité Pro">
                        <span className="px-4 py-2 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full shadow-lg">
                            ⭐ Fonctionnalité Pro / Max
                        </span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;