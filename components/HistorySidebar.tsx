import React, { useState, useRef, useEffect } from 'react';
import type { ChatSession } from '../types';

interface HistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
  onUpdateSession: (sessionId: string, updates: { title: string }) => void;
}

const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ sessions, activeSessionId, onSelectChat, onDeleteChat, onNewChat, onUpdateSession }) => {
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSessionId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingSessionId]);

  const handleStartEditing = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveTitle = () => {
    if (editingSessionId && editingTitle.trim()) {
      onUpdateSession(editingSessionId, { title: editingTitle.trim() });
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };
  
  const handleCancelEditing = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  }

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
                        <div 
                            onClick={() => !editingSessionId && onSelectChat(session.id)} 
                            className={`group w-full flex items-center justify-between text-left p-3 rounded-lg transition-colors ${
                                editingSessionId === session.id ? 'bg-indigo-500/20' :
                                activeSessionId === session.id 
                                ? 'bg-indigo-500/20' 
                                : 'hover:bg-black/5 dark:hover:bg-slate-800/60 cursor-pointer'
                            }`}
                        >
                            {editingSessionId === session.id ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={handleSaveTitle}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTitle();
                                        if (e.key === 'Escape') handleCancelEditing();
                                    }}
                                    className="text-sm font-medium bg-transparent focus:outline-none w-full text-indigo-700 dark:text-sky-300"
                                />
                            ) : (
                                <>
                                <p className={`flex-grow font-medium text-sm truncate ${
                                    activeSessionId === session.id
                                    ? 'text-indigo-700 dark:text-sky-300'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}>{session.title}</p>
                                <div className="flex flex-shrink-0">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleStartEditing(session); }}
                                        className="ml-2 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-500/20 hover:text-slate-800 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Renommer la discussion"
                                    >
                                        <EditIcon className="h-4 w-4"/>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }} 
                                        className="ml-1 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Supprimer la discussion"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                                </>
                            )}
                        </div>
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