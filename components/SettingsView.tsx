import React, { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'brevet-easy-theme';

const ThemeSelector: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'system';
  });

  useEffect(() => {
    const applyTheme = (t: Theme) => {
        localStorage.setItem(THEME_KEY, t);
        if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };
    
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme(theme);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Clair' },
    { value: 'dark', label: 'Sombre' },
    { value: 'system', label: 'Système' },
  ];

  return (
    <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Thème</h3>
        <div className="flex bg-gray-200 dark:bg-gray-700/50 rounded-lg p-1">
            {themes.map(({ value, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        theme === value
                            ? 'bg-white dark:bg-gray-900/50 text-blue-600 dark:text-blue-400 shadow'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600/50'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    </div>
  );
};

export const SettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Paramètres</h2>
        </header>
        <main className="space-y-8">
            <section>
                <ThemeSelector />
            </section>
            <section>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Compte</h3>
                <div className="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        La connexion à un compte et la synchronisation des données seront bientôt disponibles.
                    </p>
                </div>
            </section>
        </main>
    </div>
  );
};