import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ChatSession, Folder } from '../types';

interface HistorySidebarProps {
  sessions: ChatSession[];
  folders: Folder[];
  activeSessionId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onDownloadChat: (chatId: string) => void;
  onNewChat: () => void;
  onUpdateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  onNewFolder: (name: string, emoji: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onUpdateFolder: (folderId: string, updates: Partial<Folder>) => void;
  onExitChat: () => void;
}

const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;


const SessionItem: React.FC<{
    session: ChatSession;
    isActive: boolean;
    isEditing: boolean;
    editingTitle: string;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSaveTitle: () => void;
    onCancelEditing: () => void;
    onSelect: () => void;
    onStartEditing: () => void;
    onDelete: () => void;
    onDownload: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
}> = ({ session, isActive, isEditing, editingTitle, onTitleChange, onSaveTitle, onCancelEditing, onSelect, onStartEditing, onDelete, onDownload, inputRef }) => {

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('sessionId', session.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div 
            onClick={onSelect}
            draggable={!isEditing}
            onDragStart={handleDragStart}
            className={`group w-full flex items-center justify-between text-left p-3 rounded-lg transition-colors ${
                isEditing ? 'bg-indigo-500/20' :
                isActive 
                ? 'bg-indigo-500/20' 
                : 'hover:bg-black/5 dark:hover:bg-slate-800/60 cursor-pointer'
            }`}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editingTitle}
                    onChange={onTitleChange}
                    onBlur={onSaveTitle}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onSaveTitle();
                        if (e.key === 'Escape') onCancelEditing();
                    }}
                    className="text-sm font-medium bg-transparent focus:outline-none w-full text-indigo-700 dark:text-sky-300"
                />
            ) : (
                <>
                <p className={`flex-grow font-medium text-sm truncate ${
                    isActive
                    ? 'text-indigo-700 dark:text-sky-300'
                    : 'text-slate-800 dark:text-slate-200'
                }`}>{session.title}</p>
                <div className="flex flex-shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onStartEditing(); }}
                        className="ml-2 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-500/20 hover:text-slate-800 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Renommer la discussion"
                    >
                        <EditIcon className="h-4 w-4"/>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDownload(); }} 
                        className="ml-1 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-500/20 hover:text-slate-800 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Télécharger la discussion"
                    >
                        <DownloadIcon className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                        className="ml-1 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer la discussion"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
                </>
            )}
        </div>
    );
};

export const HistorySidebar: React.FC<HistorySidebarProps> = (props) => {
  const { sessions, folders, activeSessionId, onSelectChat, onDeleteChat, onDownloadChat, onNewChat, onUpdateSession, onNewFolder, onDeleteFolder, onUpdateFolder, onExitChat } = props;
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderEmoji, setNewFolderEmoji] = useState('📁');
  const [searchQuery, setSearchQuery] = useState('');

  const [openFolderIds, setOpenFolderIds] = useState<Set<string>>(new Set());
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverUngrouped, setDragOverUngrouped] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  const EMOJI_OPTIONS = useMemo(() => ['📁', '📚', '💡', '🧪', '🌍', '🇫🇷', '🇬🇧', '🇪🇸', '➕', '⚙️', '⭐', '🧠'], []);

  const sortedFolders = useMemo(() => [...folders].sort((a, b) => b.createdAt - a.createdAt), [folders]);
  
  const { visibleFolders, sessionsByFolder, ungroupedSessions } = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    if (!lowercasedQuery) {
        // No search query, return everything as before
        const grouped: Record<string, ChatSession[]> = {};
        const ungrouped: ChatSession[] = [];
        sessions.forEach(session => {
            if (session.folderId) {
                if (!grouped[session.folderId]) grouped[session.folderId] = [];
                grouped[session.folderId].push(session);
            } else {
                ungrouped.push(session);
            }
        });
        Object.values(grouped).forEach(folderSessions => folderSessions.sort((a, b) => b.createdAt - a.createdAt));
        ungrouped.sort((a, b) => b.createdAt - a.createdAt);
        return { visibleFolders: sortedFolders, sessionsByFolder: grouped, ungroupedSessions: ungrouped };
    }

    const matchingSessionIds = new Set(
        sessions.filter(s => s.title.toLowerCase().includes(lowercasedQuery)).map(s => s.id)
    );

    const matchingFolderIds = new Set(
        sortedFolders.filter(f => f.name.toLowerCase().includes(lowercasedQuery)).map(f => f.id)
    );

    const folderIdsWithMatchingSessions = new Set<string>();
    sessions.forEach(s => {
        if (s.folderId && matchingSessionIds.has(s.id)) {
            folderIdsWithMatchingSessions.add(s.folderId);
        }
    });

    const visibleFolders = sortedFolders.filter(f => 
        matchingFolderIds.has(f.id) || folderIdsWithMatchingSessions.has(f.id)
    );

    const sessionsByFolder: Record<string, ChatSession[]> = {};
    visibleFolders.forEach(folder => {
        const folderSessions = sessions.filter(s => s.folderId === folder.id);
        if (matchingFolderIds.has(folder.id)) {
            sessionsByFolder[folder.id] = folderSessions;
        } else {
            sessionsByFolder[folder.id] = folderSessions.filter(s => matchingSessionIds.has(s.id));
        }
        sessionsByFolder[folder.id].sort((a, b) => b.createdAt - a.createdAt);
    });

    const ungroupedSessions = sessions.filter(s => !s.folderId && matchingSessionIds.has(s.id))
        .sort((a, b) => b.createdAt - a.createdAt);

    return { visibleFolders, sessionsByFolder, ungroupedSessions };
  }, [searchQuery, sessions, sortedFolders]);

  useEffect(() => {
    if (editingId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (isCreatingFolder) {
        newFolderInputRef.current?.focus();
    }
  }, [isCreatingFolder]);

  const handleStartEditing = (item: ChatSession | Folder) => {
    setEditingId(item.id);
    setEditingTitle('title' in item ? item.title : item.name);
  };

  const handleSaveTitle = () => {
    if (!editingId || !editingTitle.trim()) {
        handleCancelEditing();
        return;
    }
    const isFolder = editingId.startsWith('folder_');
    if (isFolder) {
        onUpdateFolder(editingId, { name: editingTitle.trim() });
    } else {
        onUpdateSession(editingId, { title: editingTitle.trim() });
    }
    handleCancelEditing();
  };
  
  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };
  
  const toggleFolder = (folderId: string) => {
    setOpenFolderIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(folderId)) {
            newSet.delete(folderId);
        } else {
            newSet.add(folderId);
        }
        return newSet;
    });
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData('sessionId');
    if (sessionId) {
        const session = sessions.find(s => s.id === sessionId);
        if (session && session.folderId !== folderId) {
            onUpdateSession(sessionId, { folderId });
        }
    }
    setDragOverFolderId(null);
    setDragOverUngrouped(false);
  };
  
  const handleConfirmNewFolder = () => {
      if (newFolderName.trim()) {
          onNewFolder(newFolderName.trim(), newFolderEmoji);
      }
      setIsCreatingFolder(false);
      setNewFolderName('');
      setNewFolderEmoji('📁');
  };

  const handleCancelNewFolder = () => {
    setIsCreatingFolder(false);
    setNewFolderName('');
    setNewFolderEmoji('📁');
  };

  const dragFeedbackClass = 'bg-indigo-500/20 border-2 border-dashed border-indigo-400';

  return (
    <aside className="w-80 h-full flex-shrink-0 bg-white/5 dark:bg-slate-900/40 p-4 flex flex-col gap-2 border-r border-white/10 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2">
            <button 
                onClick={onExitChat}
                className="flex items-center justify-center w-10 h-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-full shadow-lg hover:bg-white/20 dark:hover:bg-slate-800/60 transform hover:scale-105 transition-all duration-300"
                title="Retour à l'accueil"
                aria-label="Retourner à l'accueil"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="flex items-stretch gap-3">
            <button
                onClick={onNewChat}
                className="flex-grow flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>
                Discussion
            </button>
            <button
                onClick={() => setIsCreatingFolder(true)}
                className="flex-shrink-0 w-12 flex items-center justify-center bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Nouveau dossier"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>
            </button>
        </div>
        
        <div className="relative my-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/5 dark:bg-slate-800/60 py-2.5 pl-10 pr-4 rounded-lg border border-transparent focus:bg-white/10 dark:focus:bg-slate-800/80 focus:border-indigo-500/50 focus:outline-none transition-colors text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-500"
            />
        </div>

        <div 
            className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-1"
            onDragOver={(e) => { e.preventDefault(); setDragOverUngrouped(true); }}
            onDragLeave={() => setDragOverUngrouped(false)}
            onDrop={(e) => handleDrop(e, null)}
        >
             <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-2 my-2">Historique</h3>
             {(visibleFolders.length > 0 || ungroupedSessions.length > 0 || isCreatingFolder) ? (
                <ul className={`space-y-1 rounded-lg transition-colors p-1 ${dragOverUngrouped ? dragFeedbackClass : ''}`}>
                    {isCreatingFolder && (
                        <li className="p-3 bg-black/5 dark:bg-slate-800 rounded-lg shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl p-1 bg-white/10 dark:bg-black/20 rounded-md">{newFolderEmoji}</span>
                                <input
                                    ref={newFolderInputRef}
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleConfirmNewFolder();
                                        if (e.key === 'Escape') handleCancelNewFolder();
                                    }}
                                    className="flex-grow text-sm font-medium bg-white/20 dark:bg-slate-700/60 focus:outline-none w-full p-2 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500"
                                    placeholder="Nom du dossier..."
                                />
                            </div>
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 mb-3">
                                {EMOJI_OPTIONS.map(emoji => (
                                    <button 
                                        key={emoji} 
                                        onClick={() => setNewFolderEmoji(emoji)}
                                        className={`flex items-center justify-center p-1 rounded-lg text-xl transition-all duration-200 aspect-square ${newFolderEmoji === emoji ? 'bg-indigo-500/80 scale-110' : 'hover:bg-slate-500/20'}`}
                                        aria-label={`Select emoji ${emoji}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                             <div className="flex justify-end gap-2">
                                <button onClick={handleCancelNewFolder} className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                                    Annuler
                                </button>
                                <button onClick={handleConfirmNewFolder} className="px-3 py-1.5 text-xs font-semibold bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50" disabled={!newFolderName.trim()}>
                                    Créer
                                </button>
                            </div>
                        </li>
                    )}
                    {visibleFolders.map(folder => {
                        const folderSessions = sessionsByFolder[folder.id] || [];
                        const isOpen = openFolderIds.has(folder.id);
                        return (
                            <li key={folder.id} 
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(folder.id); setDragOverUngrouped(false); }}
                                onDragLeave={() => setDragOverFolderId(null)}
                                onDrop={(e) => { e.stopPropagation(); handleDrop(e, folder.id); }}
                                className={`rounded-lg transition-colors ${dragOverFolderId === folder.id ? dragFeedbackClass : ''}`}
                            >
                                <div 
                                    className="group w-full flex items-center justify-between text-left p-3 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-slate-800/60"
                                    onClick={() => toggleFolder(folder.id)}
                                >
                                    {editingId === folder.id ? (
                                        <input
                                            ref={inputRef} type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onBlur={handleSaveTitle}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') handleCancelEditing(); }}
                                            className="text-sm font-medium bg-transparent focus:outline-none w-full text-indigo-700 dark:text-sky-300"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 flex-grow truncate">
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                <span className="text-xl w-6 h-6 flex items-center justify-center flex-shrink-0">{folder.emoji || '📁'}</span>
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{folder.name}</span>
                                            </div>
                                            <div className="flex flex-shrink-0">
                                                <button onClick={(e) => { e.stopPropagation(); handleStartEditing(folder); }} className="ml-2 p-1 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100" title="Renommer"><EditIcon className="h-4 w-4"/></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="ml-1 p-1 rounded-full text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 opacity-0 group-hover:opacity-100" title="Supprimer"><TrashIcon className="h-4 w-4"/></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {isOpen && (
                                    <ul className="pl-6 pr-2 py-1 space-y-1">
                                        {folderSessions.length > 0 ? (
                                            folderSessions.map(session => (
                                                <li key={session.id}>
                                                    <SessionItem 
                                                        session={session} isActive={activeSessionId === session.id}
                                                        isEditing={editingId === session.id} editingTitle={editingTitle} onTitleChange={(e) => setEditingTitle(e.target.value)}
                                                        onSaveTitle={handleSaveTitle} onCancelEditing={handleCancelEditing}
                                                        onSelect={() => !editingId && onSelectChat(session.id)}
                                                        onStartEditing={() => handleStartEditing(session)}
                                                        onDelete={() => onDeleteChat(session.id)}
                                                        onDownload={() => onDownloadChat(session.id)}
                                                        inputRef={inputRef}
                                                    />
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-xs text-slate-500 dark:text-slate-400 px-3 py-2 italic">Ce dossier est vide.</li>
                                        )}
                                    </ul>
                                )}
                            </li>
                        )
                    })}
                    {ungroupedSessions.map((session) => (
                        <li key={session.id}>
                           <SessionItem 
                                session={session} isActive={activeSessionId === session.id}
                                isEditing={editingId === session.id} editingTitle={editingTitle} onTitleChange={(e) => setEditingTitle(e.target.value)}
                                onSaveTitle={handleSaveTitle} onCancelEditing={handleCancelEditing}
                                onSelect={() => !editingId && onSelectChat(session.id)}
                                onStartEditing={() => handleStartEditing(session)}
                                onDelete={() => onDeleteChat(session.id)}
                                onDownload={() => onDownloadChat(session.id)}
                                inputRef={inputRef}
                           />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{searchQuery ? 'Aucun résultat trouvé.' : 'Aucune conversation passée.'}</p>
                </div>
            )}
        </div>
    </aside>
  );
};