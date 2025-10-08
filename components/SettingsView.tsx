
import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';

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
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Thème</h3>
        <div className="flex bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 space-x-1">
            {themes.map(({ value, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                        theme === value
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/50'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    </div>
  );
};

interface SettingsViewProps {
    onBack: () => void;
    currentUser: UserProfile | null;
    onNavigateToLogin: () => void;
    onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, currentUser, onNavigateToLogin, onLogout }) => {
    
    const xpForNextLevel = currentUser ? currentUser.level * 100 : 100;
    const xpProgress = currentUser ? (currentUser.xp / xpForNextLevel) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
        <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Paramètres</h2>
            <button onClick={onBack} title="Fermer" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </header>
        <main className="space-y-8">
            <section>
                <ThemeSelector />
            </section>
            <section>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Compte</h3>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700">
                    {currentUser ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Connecté en tant que :</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{currentUser.email}</p>
                                </div>
                                <button 
                                    onClick={onLogout}
                                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors"
                                >
                                    Déconnexion
                                </button>
                            </div>
                            <div className="mt-6">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="font-bold text-xl text-blue-600 dark:text-blue-400">Niveau {currentUser.level}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.xp} / {xpForNextLevel} XP</p>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Connectez-vous pour sauvegarder votre progression et monter de niveau !
                            </p>
                            <button 
                                onClick={onNavigateToLogin}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                            >
                                Se connecter / S'inscrire
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    </div>
  );
};
