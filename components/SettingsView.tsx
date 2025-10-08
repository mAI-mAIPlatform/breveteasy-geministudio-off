import React from 'react';

interface SettingsViewProps {
  onBack: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, theme, onThemeChange }) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Paramètres</h2>
            <button onClick={onBack} title="Fermer" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </header>
        
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Thème d'affichage</h3>
                <div className="flex space-x-2 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => onThemeChange(t)}
                        className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        theme === t
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
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
