import React from 'react';

export const WelcomeView: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-sky-400 flex items-center justify-center shadow-2xl mb-6">
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-200">
            Bienvenue sur BrevetAI !
        </h2>
        <p className="text-slate-700 dark:text-slate-400 mt-2">
           Sélectionnez une discussion ou commencez-en une nouvelle.
        </p>
    </div>
);
