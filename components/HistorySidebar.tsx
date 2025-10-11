import React from 'react';
import type { ChatSession } from '../types';

interface HistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ sessions, activeSessionId, onSelectChat, onDeleteChat, onNewChat }) => {
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <aside className="w-80 h-full flex-shrink-0 bg-white/5 dark:bg-slate-900/40 p-4 flex flex-col gap-4 border-r border-white/10 dark:border-slate-800">
        <button 
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all text-center"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Nouvelle Discussion
        </button>

        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2 mt-2">Historique</h3>
        
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2">
             {sortedSessions.length > 0 ? (
                <ul className="space-y-2">
                  {sortedSessions.map((session) => (
                    <li key={session.id}>
                        <button 
                            onClick={() => onSelectChat(session.id)} 
                            className={`group w-full flex items-center justify-between text-left p-3 rounded-lg transition-colors ${
                                activeSessionId === session.id 
                                ? 'bg-indigo-500/20' 
                                : 'hover:bg-black/5 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <p className={`flex-grow font-medium text-sm truncate ${
                                activeSessionId === session.id
                                ? 'text-indigo-700 dark:text-sky-300'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}>{session.title}</p>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }} 
                                className="ml-2 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                title="Supprimer la discussion"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </button>
                    </li>
                  ))}
                </ul>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Aucune conversation passée.</p>
                </div>
            )}
        </div>
    </aside>
  );
};
