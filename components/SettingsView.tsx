import React from 'react';

interface SettingsViewProps {
  onBack: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, theme, onThemeChange }) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-xl">
        <header className="flex items-center justify-between pb-4 border-b border-white/20 dark:border-white/10 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Paramètres</h2>
            <button onClick={onBack} title="Fermer" className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </header>
        
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Thème d'affichage</h3>
                <div className="flex space-x-2 rounded-xl bg-black/10 dark:bg-white/10 p-1">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => onThemeChange(t)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        theme === t
                            ? 'bg-white dark:bg-gray-700 text-indigo-500 dark:text-sky-300 shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        {t === 'light' ? 'Clair' : t === 'dark' ? 'Sombre' : 'Système'}
                    </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;