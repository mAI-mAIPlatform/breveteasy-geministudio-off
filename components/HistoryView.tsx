import React from 'react';
import type { ChatSession } from '../types';

interface HistoryViewProps {
  sessions: ChatSession[];
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onSelectChat, onDeleteChat, onBack }) => {
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-lg p-6 sm:p-8">
      <header className="flex items-center justify-between pb-4 border-b border-white/20 dark:border-slate-700 mb-6 flex-shrink-0">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Historique</h2>
        <button onClick={onBack} title="Fermer" className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>
      <main className="flex-grow overflow-y-auto pr-2 -mr-2">
        {sortedSessions.length > 0 ? (
            <ul className="space-y-4">
              {sortedSessions.map((session) => (
                <li key={session.id} className="group flex items-center justify-between bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700 p-4 rounded-2xl shadow-md hover:shadow-lg hover:border-white/40 dark:hover:border-slate-600 transition-all">
                  <button onClick={() => onSelectChat(session.id)} className="flex-grow text-left mr-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-500 dark:group-hover:text-sky-300 transition-colors">{session.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{new Date(session.createdAt).toLocaleString('fr-FR')}</p>
                  </button>
                  <button onClick={() => onDeleteChat(session.id)} className="ml-4 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-500 transition-colors flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </li>
              ))}
            </ul>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-300">Aucun historique</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Commencez une nouvelle conversation avec BrevetAI.</p>
          </div>
        )}
      </main>
    </div>
  );
};