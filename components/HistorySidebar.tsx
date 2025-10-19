// Fix: Provide the implementation for the HistorySidebar component.
import React, { useState, useRef, useEffect, useMemo } from 'react';
// FIX: Added 'ChatMessage' to imports to correctly type the 'onUpdateSession' prop.
import type { ChatSession, Folder, AiModel, CustomAiModel, SubscriptionPlan, ChatMessage } from '../types';
import { AVATAR_ICONS, AVATAR_ICON_KEYS } from '../constants';
import { PremiumBadge } from './PremiumBadge';

// --- Custom Model Creator Modal ---
interface CustomModelCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (modelData: Omit<CustomAiModel, 'id' | 'createdAt'>) => void;
}

const CustomModelCreator: React.FC<CustomModelCreatorProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('brain');
    const [version, setVersion] = useState('1.0');
    const [description, setDescription] = useState('');
    const [baseModel, setBaseModel] = useState<AiModel>('brevetai-pro');
    const [instructions, setInstructions] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    const resetForm = () => {
        setName('');
        setIcon('brain');
        setVersion('1.0');
        setDescription('');
        setBaseModel('brevetai-pro');
        setInstructions('');
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !instructions.trim()) {
            alert("Le nom et les instructions sont obligatoires.");
            return;
        }
        onSave({ name, icon, version, description, baseModel, instructions });
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
            <div ref={modalRef} className="relative w-full max-w-2xl bg-[#f0f2f5] dark:bg-slate-900/80 dark:backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8">
                <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-md z-10" aria-label="Fermer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">Créer un Modèle d'IA Personnalisé</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="model-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom du modèle</label>
                            <input id="model-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Assistant de Maths" required className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"/>
                        </div>
                        <div>
                             <label htmlFor="model-version" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Version</label>
                            <input id="model-version" type="text" value={version} onChange={e => setVersion(e.target.value)} placeholder="Ex: 1.0.0" className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"/>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="model-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea id="model-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Une brève description du rôle de ce modèle." className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg resize-y"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Icône</label>
                        <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
                             {AVATAR_ICON_KEYS.map(key => (
                                <button type="button" key={key} onClick={() => setIcon(key)} className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 aspect-square border-2 ${icon === key ? 'bg-indigo-500/80 border-indigo-500 text-white scale-110' : 'bg-white/10 dark:bg-slate-800/60 border-transparent hover:border-indigo-400 text-slate-700 dark:text-slate-300'}`} aria-label={`Select icon ${key}`}>
                                    {React.cloneElement(AVATAR_ICONS[key], { className: "w-6 h-6" })}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="model-base" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modèle de base</label>
                        <select id="model-base" value={baseModel} onChange={e => setBaseModel(e.target.value as AiModel)} className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg">
                            <option value="brevetai">BrevetAI (Rapide)</option>
                            <option value="brevetai-pro">BrevetAI Pro (Intelligent)</option>
                            <option value="brevetai-max">BrevetAI Max (Le plus puissant)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="model-instructions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions personnalisées</label>
                        <textarea id="model-instructions" value={instructions} onChange={e => setInstructions(e.target.value)} rows={5} placeholder="Ex: Tu es un expert en histoire-géographie. Tes réponses sont toujours structurées avec une introduction, un développement en deux parties et une conclusion." required className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg resize-y"/>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700">Annuler</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50" disabled={!name.trim() || !instructions.trim()}>Créer le modèle</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- History Sidebar ---
interface HistorySidebarProps {
  sessions: ChatSession[];
  folders: Folder[];
  activeSessionId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onDownloadChat: (chatId: string) => void;
  onNewChat: () => void;
  onStartGhostChat: () => void;
  onUpdateSession: (sessionId: string, updates: {
    messages?: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]);
    title?: string;
    aiModel?: AiModel;
    folderId?: string | null;
  }) => void;
  onNewFolder: (name: string, emoji: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onUpdateFolder: (folderId: string, updates: Partial<Folder>) => void;
  onExitChat: () => void;
  subscriptionPlan: SubscriptionPlan;
  onNewCustomModel: (modelData: Omit<CustomAiModel, 'id' | 'createdAt'>) => void;
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
  const { sessions, folders, activeSessionId, onSelectChat, onDeleteChat, onDownloadChat, onNewChat, onStartGhostChat, onUpdateSession, onNewFolder, onDeleteFolder, onUpdateFolder, onExitChat, subscriptionPlan, onNewCustomModel } = props;
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingEmoji, setEditingEmoji] = useState('folder');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderEmoji, setNewFolderEmoji] = useState('folder');
  const [searchQuery, setSearchQuery] = useState('');

  const [openFolderIds, setOpenFolderIds] = useState<Set<string>>(new Set());
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverUngrouped, setDragOverUngrouped] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

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
    if ('name' in item) { // Folder
        setEditingTitle(item.name);
        setEditingEmoji(item.emoji || 'folder');
    } else { // Session
        setEditingTitle(item.title);
    }
  };

  const handleSaveTitle = () => {
    if (!editingId || !editingTitle.trim()) {
        handleCancelEditing();
        return;
    }
    const isFolder = editingId.startsWith('folder_');
    if (isFolder) {
        onUpdateFolder(editingId, { name: editingTitle.trim(), emoji: editingEmoji });
    } else {
        onUpdateSession(editingId, { title: editingTitle.trim() });
    }
    handleCancelEditing();
  };
  
  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingEmoji('folder');
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
    <>
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
        <div className="flex flex-col items-stretch gap-2">
            <div className="flex items-stretch gap-2">
                <button
                    onClick={onNewChat}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-600 transition-colors"
                    title="Nouvelle discussion"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>
                    <span>Discussion</span>
                </button>
                <button
                    onClick={onStartGhostChat}
                    className="flex-shrink-0 flex items-center justify-center w-11 h-11 bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    title="Nouvelle discussion fantôme (non sauvegardée)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-9.8 11.33c.05.39.3.73.65.88l1.43.62c.35.15.75.05 1.01-.24l.11-.12a7 7 0 0 1 10.33-4.14 7 7 0 0 1 .48 8.16l-.11.12a.85.85 0 0 0 1.01.24l1.43-.62a1.05 1.05 0 0 0 .65-.88A10 10 0 0 0 12 2zm-3.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
                </button>
            </div>
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <button
                        onClick={() => { if (subscriptionPlan === 'max') setIsCreatorOpen(true) }}
                        disabled={subscriptionPlan !== 'max'}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Créer un modèle personnalisé (Forfait Max)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM12 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>
                        + Modèle
                    </button>
                    {subscriptionPlan !== 'max' && <PremiumBadge requiredPlan="max" size="small" />}
                </div>
                <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-xs"
                    title="Nouveau dossier"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                    + Dossier
                </button>
            </div>
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
                                     {React.cloneElement(AVATAR_ICONS[newFolderEmoji], { className: 'w-6 h-6' })}
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
                                {AVATAR_ICON_KEYS.map(key => (
                                    <button 
                                        key={key} 
                                        onClick={() => setNewFolderEmoji(key)}
                                        className={`flex items-center justify-center p-1 rounded-lg transition-all duration-200 aspect-square ${newFolderEmoji === key ? 'bg-indigo-500/80 scale-110 text-white' : 'hover:bg-slate-500/20 text-slate-700 dark:text-slate-300'}`}
                                        aria-label={`Select icon ${key}`}
                                    >
                                        {React.cloneElement(AVATAR_ICONS[key], { className: "w-6 h-6" })}
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
                                {editingId === folder.id ? (
                                    <div className="p-3 bg-black/5 dark:bg-slate-800 rounded-lg shadow-inner">
                                        <input
                                            ref={inputRef} type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') handleCancelEditing(); }}
                                            className="w-full text-sm font-medium bg-white/20 dark:bg-slate-700/60 focus:outline-none p-2 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 mb-3"
                                        />
                                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 mb-3">
                                            {AVATAR_ICON_KEYS.map(key => (
                                                <button key={key} onClick={() => setEditingEmoji(key)}
                                                    className={`flex items-center justify-center p-1 rounded-lg transition-all duration-200 aspect-square ${editingEmoji === key ? 'bg-indigo-500/80 scale-110 text-white' : 'hover:bg-slate-500/20 text-slate-700 dark:text-slate-300'}`}
                                                    aria-label={`Select icon ${key}`}>
                                                    {React.cloneElement(AVATAR_ICONS[key], { className: "w-6 h-6" })}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={handleCancelEditing} className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Annuler</button>
                                            <button onClick={handleSaveTitle} className="px-3 py-1.5 text-xs font-semibold bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50" disabled={!editingTitle.trim()}>Enregistrer</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="group w-full flex items-center justify-between text-left p-3 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-slate-800/60"
                                        onClick={() => toggleFolder(folder.id)}
                                    >
                                        <div className="flex items-center gap-2 flex-grow truncate">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-300">
                                                {React.cloneElement(AVATAR_ICONS[folder.emoji || 'folder'], { className: "w-5 h-5" })}
                                            </span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{folder.name}</span>
                                        </div>
                                        <div className="flex flex-shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); handleStartEditing(folder); }} className="ml-2 p-1 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100" title="Renommer"><EditIcon className="h-4 w-4"/></button>
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="ml-1 p-1 rounded-full text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 opacity-0 group-hover:opacity-100" title="Supprimer"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                    </div>
                                )}
                                {isOpen && !editingId && (
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
    <CustomModelCreator isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} onSave={onNewCustomModel} />
    </>
  );
};