import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, any non-empty email/password is valid for demonstration
    if (email.trim() && password.trim()) {
      onLogin(email.trim());
    }
  };

  const handleGuestLogin = () => {
    onLogin('guest@breveteasy.com');
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-center text-slate-900 dark:text-white mb-8">
          {t('login_welcome')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('login_email_label')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('login_email_placeholder')}
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('login_password_label')}
              </label>
              <button type="button" onClick={() => alert(t('feature_in_development'))} className="text-sm text-indigo-500 dark:text-sky-400 hover:underline">
                {t('login_forgot_password')}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('login_password_placeholder')}
            />
          </div>

          <div className="!pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {t('login_button')}
            </button>
          </div>
        </form>
        
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-slate-300/50 dark:border-slate-700/50"></div>
          <span className="flex-shrink mx-4 text-slate-500 dark:text-slate-400 text-sm">{t('login_or_separator')}</span>
          <div className="flex-grow border-t border-slate-300/50 dark:border-slate-700/50"></div>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full flex justify-center py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm text-base font-semibold text-slate-800 dark:text-slate-200 bg-white/30 dark:bg-slate-800/70 hover:bg-white/50 dark:hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          {t('login_guest_button')}
        </button>

      </div>
    </div>
  );
};