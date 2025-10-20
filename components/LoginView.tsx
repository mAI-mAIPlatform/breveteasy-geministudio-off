import React from 'react';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const handleGuestLogin = () => {
      onLogin('guest@breveteasy.com');
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-center text-slate-900 dark:text-white mb-8">Bienvenue</h2>
        <div className="space-y-5 text-center">
            <p className="text-slate-700 dark:text-slate-300">
                La fonctionnalité de connexion avec compte utilisateur est en cours de développement.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                En attendant, vous pouvez continuer en tant qu'invité pour tester l'application. Vos données seront sauvegardées sur cet appareil.
            </p>
          <div className="!pt-4">
            <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Continuer en tant qu'invité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};