import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (email: string) => void;
  onBack: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-6">Connexion</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-800 dark:text-slate-300">
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-600 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:text-sm"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-800 dark:text-slate-300">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-600 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:text-sm"
              placeholder="********"
            />
          </div>
          
          <p className="text-xs text-center text-slate-700 dark:text-slate-400">
            Connectez-vous pour retrouver vos conversations avec BrevetAI
          </p>

          <div className="flex flex-col gap-4 pt-2">
            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
            >
              Se connecter
            </button>
            <button
                type="button"
                onClick={onBack}
                className="w-full flex justify-center py-3 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 bg-black/10 dark:bg-slate-800 hover:bg-black/20 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};