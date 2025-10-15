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

const FOLDER_ICONS: Record<string, React.ReactElement> = {
    'folder': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5a2 2 0 0 1 2-2h5l2 2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9"/></svg>,
    'book': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    'lightbulb': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a5 5 0 0 1 5 5c0 2-2 4-2 4H9s-2-2-2-4a5 5 0 0 1 5-5z"/></svg>,
    'flask': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M12 3v7l-3 7h12l-3-7V3M6 17h16"/></svg>,
    'globe': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 1 1 0 20 15 15 0 0 1 0-20"/></svg>,
    'graduation-cap': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>,
    'terminal': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6M12 19h8"/></svg>,
    'brain': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5zM12 12a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0v-1a5 5 0 0 0-5-5zM4 12a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1M20 12a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1"/></svg>,
    'atom': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.4-2.4 2.4-6.3 0-8.7s-6.3-2.4-8.7 0-2.4 6.3 0 8.7 6.3 2.4 8.7 0z"/><path d="M3.8 3.8c-2.4 2.4-2.4 6.3 0 8.7s6.3 2.4 8.7 0 2.4-6.3 0-8.7-6.3-2.4-8.7 0z"/></svg>,
    'dna': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4c0 4 4 4 4 8s-4 4-4 8M20 4c0 4-4 4-4 8s4 4 4 8M8 8h8M8 16h8"/></svg>,
    'scroll': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8a2 2 0 0 0 2-2v-2H6v2a2 2 0 0 0 2 2z"/><path d="M4 3h12a2 2 0 0 1 2 2v12H4V5a2 2 0 0 1 2-2zM16 3v18"/></svg>,
    'map': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z"/><path d="M8 2v16M16 6v16"/></svg>,
    'palette': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M7 7c2-2 5-2 7 0M7 17c2 2 5 2 7 0"/></svg>,
    'music': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    'chart-bar': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 12h4m-4 4h9m-9-8h2"/></svg>,
    'check': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
    'pin': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    'flame': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z"/></svg>,
    'target': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    'rocket': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 11.5L12 2l7.5 9.5-7.5 9.5zM12 22V2"/></svg>,
    'sparkles': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6l1.4 1.4M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4l1.4-1.4"/></svg>,
    'pencil': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3l4 4L7 21H3v-4zM15 5l4 4"/></svg>,
    'wrench': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    'heart': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    'briefcase': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    'scales': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 6l9 4 9-4M3 6h18"/></svg>,
    'plus': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>,
    'settings': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    'star': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    'plant': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v10M2 10v10h20M2 10a8 8 0 1 1 16 0M10 2a8 8 0 1 1 0 16"/></svg>,
};
const EMOJI_OPTIONS = Object.keys(FOLDER_ICONS);


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
  const [newFolderEmoji, setNewFolderEmoji] = useState('folder');
  const [searchQuery, setSearchQuery] = useState('');

  const [openFolderIds, setOpenFolderIds] = useState<Set<string>>(new Set());
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverUngrouped, setDragOverUngrouped] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);

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
      setNewFolderEmoji('folder');
  };

  const handleCancelNewFolder = () => {
    setIsCreatingFolder(false);
    setNewFolderName('');
    setNewFolderEmoji('folder');
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
                                <span className="p-1 bg-white/10 dark:bg-black/20 rounded-md text-slate-800 dark:text-slate-200">
                                     {React.cloneElement(FOLDER_ICONS[newFolderEmoji], { className: 'w-6 h-6' })}
                                </span>
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
                                {EMOJI_OPTIONS.map(key => (
                                    <button 
                                        key={key} 
                                        onClick={() => setNewFolderEmoji(key)}
                                        className={`flex items-center justify-center p-1 rounded-lg transition-all duration-200 aspect-square ${newFolderEmoji === key ? 'bg-indigo-500/80 scale-110 text-white' : 'hover:bg-slate-500/20 text-slate-700 dark:text-slate-300'}`}
                                        aria-label={`Select icon ${key}`}
                                    >
                                        {React.cloneElement(FOLDER_ICONS[key], { className: "w-6 h-6" })}
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
                                                <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300">
                                                    {React.cloneElement(FOLDER_ICONS[folder.emoji || 'folder'], { className: "w-5 h-5" })}
                                                </span>
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