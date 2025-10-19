import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ChatSession, ChatMessage, ChatPart, SubscriptionPlan, AiModel } from '../types';
import { ai, Type } from '../services/geminiService';
import type { Chat, Part, GenerateContentResponse } from '@google/genai';
import { PremiumBadge } from './PremiumBadge';

type PromptModifier = 'long' | 'short' | 'web';

interface ChatViewProps {
    session: ChatSession;
    onUpdateSession: (sessionId: string, updates: {
        messages?: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]);
        title?: string;
        aiModel?: AiModel;
    }) => void;
    systemInstruction: string;
    subscriptionPlan: SubscriptionPlan;
    userName: string;
    onNavigateToImageGeneration: () => void;
    onNavigateToCanvas: () => void;
    onNavigateToFlashAI: () => void;
    onNavigateToPlanning: () => void;
    onNavigateToConseils: () => void;
    generateContentWithSearch: (history: ChatMessage[], currentParts: ChatPart[]) => Promise<GenerateContentResponse>;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const RegenerateIcon: React.FC<{ className?: string }> = ({ className }) => 
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>;
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
const TwitterIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FacebookIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" /></svg>;
const WhatsAppIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.54 2 2.08 6.46 2.08 11.96c0 1.77.46 3.49 1.32 5l-1.4 5.2 5.3-1.4c1.47.8 3.12 1.24 4.88 1.24h.02c5.5 0 9.96-4.46 9.96-9.96c0-5.5-4.46-9.96-9.96-9.96zM17.1 13.5c-.28-.14-1.65-.81-1.9-.9c-.25-.1-.43-.15-.61.15c-.18.3-.72.9-.88 1.08c-.16.18-.32.2-.6.06c-.28-.14-1.18-.43-2.25-1.39c-.83-.75-1.39-1.66-1.55-1.94c-.16-.28-.02-.43.12-.57c.13-.13.28-.34.42-.51c.14-.17.18-.28.28-.47s.05-.36-.02-.51c-.08-.15-.61-1.47-.83-2.02c-.22-.55-.45-.48-.61-.48c-.16 0-.34-.05-.53-.05c-.18 0-.48.07-.72.37c-.25.3-.95.92-1.22 2.22c-.28 1.3.62 2.72.71 2.92c.1.2 1.2 1.8 2.9 2.54c1.7.74 2.22.95 2.9.83c.68-.12 1.65-.68 1.88-1.32c.23-.64.23-1.18.16-1.32c-.07-.14-.25-.22-.53-.36z"/></svg>;
const LinkedInIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zm-11 5H5v10h3V8zm-1.5-2.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18 18h-3v-4.5c0-1.04-.02-2.37-1.45-2.37-1.45 0-1.67 1.13-1.67 2.29V18h-3V8h2.88v1.31h.04c.4-.76 1.38-1.55 2.84-1.55 3.03 0 3.59 1.99 3.59 4.58V18z"/></svg>;
const RedditIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5,12.01c0-1.48-0.78-2.76-1.94-3.48c-0.2-1.3-0.81-2.48-1.72-3.39c-0.91-0.91-2.09-1.52-3.39-1.72 C14.77,2.78,13.48,2,12.01,2c-1.48,0-2.76,0.78-3.48,1.94c-1.3,0.2-2.48,0.81-3.39,1.72c-0.91-0.91-1.52,2.09-1.72,3.39 C2.78,9.25,2,10.53,2,12.01c0,1.48,0.78,2.76,1.94,3.48c0.2,1.3,0.81,2.48,1.72,3.39c0.91,0.91,2.09,1.52,3.39,1.72 c0.72,1.16,2,1.94,3.48,1.94c1.48,0,2.76-0.78,3.48-1.94c1.3-0.2,2.48-0.81,3.39-1.72c0.91-0.91,1.52-2.09,1.72-3.39 C21.72,14.77,22.5,13.48,22.5,12.01z M7.76,12.72c0-0.83,0.67-1.5,1.5-1.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5 C8.42,14.22,7.76,13.55,7.76,12.72z M12.01,17.48c-1.89,0-3.48-1.01-4.22-2.45c-0.12-0.23-0.03-0.53,0.2-0.65 c0.23-0.12,0.53-0.03,0.65,0.2c0.6,1.19,1.9,2,3.37,2c1.47,0,2.77-0.81,3.37-2c0.12-0.23,0.42-0.32,0.65-0.2 c0.23,0.12,0.32,0.42,0.2,0.65C15.49,16.47,13.9,17.48,12.01,17.48z M14.75,14.22c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5 c0.83,0,1.5,0.67,1.5,1.5S15.58,14.22,14.75,14.22z"/></svg>;
const CheckIconSmall: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

const ShareMessageModal: React.FC<{ isOpen: boolean; onClose: () => void; parts: ChatPart[]; }> = ({ isOpen, onClose, parts }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    
    const messageText = parts.map(p => p.text).filter(Boolean).join('\n\n');
    const shareText = `Message de Brevet' Easy 🚀:\n\n"${messageText}"\n\n#Brevet2025 #Révisions #IA`;
    const encodedShareText = encodeURIComponent(shareText);
    const shareUrl = "https://gemini.google.com/studio";
    const encodedUrl = encodeURIComponent(shareUrl);
    const shareTitle = `Message de Brevet' Easy`;
    const encodedTitle = encodeURIComponent(shareTitle);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedShareText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShareText}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedShareText}`,
        reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedShareText}`,
    };
    
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        const handleClickOutside = (event: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div ref={modalRef} className="relative w-full max-w-md bg-[#f0f2f5] dark:bg-slate-900/80 dark:backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8">
                <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-md z-10" aria-label="Fermer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">Partager le message</h2>
                
                <div className="p-4 bg-white/50 dark:bg-slate-800/60 rounded-xl mb-6 max-h-40 overflow-y-auto">
                    <p className="text-slate-800 dark:text-slate-300 text-sm whitespace-pre-wrap">{messageText}</p>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleCopy} className="w-full flex items-center justify-center p-3 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-700/60 transition-colors">
                        {copied ? <CheckIconSmall className="w-5 h-5 text-green-500 mr-2"/> : <CopyIcon className="w-5 h-5 mr-2"/>}
                        {copied ? 'Copié !' : 'Copier'}
                    </button>
                </div>
                
                <div className="flex justify-center items-center gap-4">
                     <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-black/80 text-white rounded-full hover:bg-black/100 transition-colors" title="Partager sur X"><TwitterIcon /></a>
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:bg-[#166fe5] transition-colors" title="Partager sur Facebook"><FacebookIcon /></a>
                    <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#0A66C2] text-white rounded-full hover:bg-[#0077B5] transition-colors" title="Partager sur LinkedIn"><LinkedInIcon /></a>
                    <a href={shareLinks.reddit} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#FF4500] text-white rounded-full hover:bg-[#ff5700] transition-colors" title="Partager sur Reddit"><RedditIcon /></a>
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#25D366] text-white rounded-full hover:bg-[#1ebe59] transition-colors" title="Partager sur WhatsApp"><WhatsAppIcon /></a>
                </div>
            </div>
        </div>
    );
};


const ModelSelectorDropdown: React.FC<{
    aiModel: AiModel;
    onAiModelChange: (model: AiModel) => void;
    isConversationStarted: boolean;
    subscriptionPlan: SubscriptionPlan;
}> = ({ aiModel, onAiModelChange, isConversationStarted, subscriptionPlan }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const modelDisplayNames: Record<AiModel, string> = {
        brevetai: 'BrevetAI',
        'brevetai-pro': 'BrevetAI Pro',
        'brevetai-max': 'BrevetAI Max',
    };
    
    const allModels = useMemo(() => [
        { id: 'brevetai', requiredPlan: 'free' as const },
        { id: 'brevetai-pro', requiredPlan: 'pro' as const },
        { id: 'brevetai-max', requiredPlan: 'max' as const },
    ], []);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => !isConversationStarted && setIsOpen(!isOpen)}
                disabled={isConversationStarted}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-lg font-bold transition-colors ${
                    isConversationStarted
                        ? 'cursor-default text-slate-800 dark:text-slate-200'
                        : 'bg-white/10 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 hover:bg-white/20 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                }`}
                style={{minWidth: '145px'}}
            >
                <span className="flex-grow text-left">{modelDisplayNames[aiModel]}</span>
                {!isConversationStarted && (
                    <svg
                        className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                )}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full rounded-xl bg-white dark:bg-slate-800/90 backdrop-blur-lg shadow-2xl border border-white/20 dark:border-slate-700 z-10 p-1">
                    {allModels.map((model) => {
                         const isLocked = 
                            (model.requiredPlan === 'pro' && subscriptionPlan === 'free') ||
                            (model.requiredPlan === 'max' && subscriptionPlan !== 'max');

                        return (
                            <div key={model.id} className="relative">
                                <button
                                    onClick={() => {
                                        if (isLocked) return;
                                        onAiModelChange(model.id as AiModel);
                                        setIsOpen(false);
                                    }}
                                    disabled={isLocked}
                                    className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-800 dark:text-slate-200 hover:bg-indigo-500/80 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {modelDisplayNames[model.id as AiModel]}
                                </button>
                                {isLocked && <PremiumBadge requiredPlan={model.requiredPlan} className="rounded-lg" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ChatHeader: React.FC<{
    title: string;
    onTitleChange: (newTitle: string) => void;
    aiModel: AiModel;
    onAiModelChange: (model: AiModel) => void;
    isConversationStarted: boolean;
    subscriptionPlan: SubscriptionPlan;
}> = ({ title, onTitleChange, aiModel, onAiModelChange, isConversationStarted, subscriptionPlan }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingTitle, setEditingTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingTitle) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditingTitle]);

    const handleTitleSave = () => {
        if (editingTitle.trim() && editingTitle.trim() !== title) {
            onTitleChange(editingTitle.trim());
        }
        setIsEditingTitle(false);
    };

    return (
        <header className="pb-4 border-b border-white/20 dark:border-slate-800">
            <div className="relative flex items-center justify-center min-h-[44px]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <ModelSelectorDropdown
                        aiModel={aiModel}
                        onAiModelChange={onAiModelChange}
                        isConversationStarted={isConversationStarted}
                        subscriptionPlan={subscriptionPlan}
                    />
                </div>
                <div className="flex items-center gap-2 group min-w-0">
                    {isEditingTitle ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setIsEditingTitle(false); }}
                            className="text-xl font-bold text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-md w-full max-w-xs"
                        />
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-center truncate">{title}</h2>
                            <button 
                                onClick={() => { setIsEditingTitle(true); setEditingTitle(title); }} 
                                className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700"
                                title="Renommer la discussion"
                            >
                                <EditIcon className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

const Message: React.FC<{
    message: ChatMessage;
    index: number;
    copiedIndex: number | null;
    onCopy: (parts: ChatPart[], index: number) => void;
    onRegenerate: (index: number) => void;
    onEdit: (index: number) => void;
}> = ({ message, index, copiedIndex, onCopy, onRegenerate, onEdit }) => {
    const isModel = message.role === 'model';
    
    const actionBarClass = "flex items-center self-center gap-1 p-1 bg-white/60 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200";
    const actionButtonClass = "p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors";

    return (
        <div className={`group flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
            {!isModel && (
                <div className={actionBarClass}>
                    <button onClick={() => onEdit(index)} title="Modifier" className={actionButtonClass}>
                        <EditIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => onCopy(message.parts, index)} title="Copier" className={actionButtonClass}>
                        {copiedIndex === index ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                </div>
            )}
            
            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 shadow-md ${isModel ? 'bg-white/30 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-t-2xl rounded-br-2xl' : 'bg-indigo-500/80 backdrop-blur-md text-white rounded-t-2xl rounded-bl-2xl'}`}>
                {message.isGenerating ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {message.parts.map((part, partIndex) => {
                            if (part.image) {
                                return <img key={partIndex} src={`data:${part.image.mimeType};base64,${part.image.data}`} alt="User upload" className="rounded-lg max-w-xs" />;
                            }
                            if (part.text) {
                                return <p key={partIndex} className="whitespace-pre-wrap">{part.text}</p>;
                            }
                            return null;
                        })}
                    </div>
                )}
            </div>

            {isModel && !message.isGenerating && (
                 <div className={actionBarClass}>
                    <button onClick={() => onCopy(message.parts, index)} title="Copier" className={actionButtonClass}>
                        {copiedIndex === index ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={() => onRegenerate(index)} title="Regénérer" className={actionButtonClass}>
                        <RegenerateIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export const ChatView: React.FC<ChatViewProps> = ({ session, onUpdateSession, systemInstruction, subscriptionPlan, userName, onNavigateToImageGeneration, onNavigateToCanvas, onNavigateToFlashAI, onNavigateToPlanning, onNavigateToConseils, generateContentWithSearch }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [attachment, setAttachment] = useState<{ file: File, previewUrl: string } | null>(null);
    const [useWebSearch, setUseWebSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const maxHeight = 192; // 12rem
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;
            textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }, [input]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [session.messages]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };
    
    const createChatInstance = useCallback((history: ChatMessage[]) => {
        const geminiHistory: { role: 'user' | 'model'; parts: Part[] }[] = history
            .filter(m => !m.isGenerating)
            .map(m => ({
                role: m.role,
                parts: m.parts.map(part => {
                    if (part.image) {
                        return { inlineData: { data: part.image.data, mimeType: part.image.mimeType } };
                    }
                    return { text: part.text || "" };
                }).filter(p => p.text || p.inlineData)
            }));

        const baseInstruction = "Tu es BrevetAI, un tuteur IA spécialisé dans l'aide aux révisions pour le Brevet des collèges en France. Tes réponses doivent être pédagogiques, encourageantes et adaptées au niveau d'un élève de 3ème. Sois concis et clair. Tu peux utiliser des listes à puces ou des exemples pour faciliter la compréhension. N'hésite pas à poser des questions pour vérifier la compréhension de l'élève.";
        
        let finalInstruction = baseInstruction;
        if (subscriptionPlan !== 'free' && systemInstruction.trim()) {
            finalInstruction = `${systemInstruction.trim()}\n\n---\n\n${baseInstruction}`;
        }
        if (userName.trim()) {
            finalInstruction += `\n\nL'utilisateur s'appelle ${userName.trim()}. Adresse-toi à lui par son prénom de manière amicale.`;
        }
        
        let geminiModelName: 'gemini-2.5-flash' | 'gemini-2.5-pro' = 'gemini-2.5-flash';
        if (session.aiModel === 'brevetai-max') {
            geminiModelName = 'gemini-2.5-pro';
        }
        
        return ai.chats.create({
            model: geminiModelName,
            history: geminiHistory,
            config: { systemInstruction: finalInstruction },
        });
    }, [session.aiModel, systemInstruction, userName, subscriptionPlan]);
    
    const generateTitle = useCallback(async (initialPrompt: string) => {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Génère un titre court et concis (4-5 mots maximum) pour une discussion qui commence par cette question : "${initialPrompt}". Réponds uniquement avec le titre.`,
            });
            onUpdateSession(session.id, { title: response.text.trim().replace(/"/g, '') });
        } catch (error) {
            console.error("Error generating title:", error);
        }
    }, [onUpdateSession, session.id]);

    const handleSendMessage = useCallback(async (modifiedParts?: ChatPart[], historyOverride?: ChatMessage[]) => {
        const textInput = input.trim();
        if ((!textInput && !attachment && !modifiedParts) || isLoading) return;
    
        setIsLoading(true);
        let userParts: ChatPart[] = [];
        let isRegeneration = !!modifiedParts;
    
        if (modifiedParts) {
            userParts = modifiedParts;
        } else {
            if (attachment) {
                try {
                    const base64Data = await fileToBase64(attachment.file);
                    userParts.push({ image: { data: base64Data, mimeType: attachment.file.type } });
                } catch (error) {
                    console.error("Error converting file to base64", error);
                    alert("Erreur lors du traitement de l'image.");
                    setIsLoading(false);
                    return;
                }
            }
            if (textInput) {
                userParts.push({ text: textInput });
            }
        }
    
        const currentHistory = historyOverride || session.messages;
        const userInputMessage: ChatMessage = { role: 'user', parts: userParts };
    
        if (!isRegeneration) {
            onUpdateSession(session.id, {
                messages: (prev) => [...prev, userInputMessage, { role: 'model', parts: [], isGenerating: true }],
            });
        } else {
            onUpdateSession(session.id, {
                messages: (prev) => [...currentHistory, { role: 'model', parts: [], isGenerating: true }],
            });
        }
    
        const isFirstUserMessage = currentHistory.filter(m => m.role === 'user').length === 0;
    
        setInput('');
        setAttachment(null);
    
        try {
            if (useWebSearch) {
                const response = await generateContentWithSearch(currentHistory, userParts);
                const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
                onUpdateSession(session.id, {
                    messages: (prev) => {
                        const newMessages = prev.slice(0, -1);
                        newMessages.push({ role: 'model', parts: [{ text: response.text }], groundingMetadata });
                        return newMessages;
                    },
                });
            } else {
                const chat = createChatInstance(currentHistory);
                const result = await chat.sendMessageStream({ message: userParts.map(p => p.text ? ({ text: p.text }) : ({ inlineData: { data: p.image!.data, mimeType: p.image!.mimeType } })) });
    
                let accumulatedText = "";
                for await (const chunk of result) {
                    accumulatedText += chunk.text;
                    onUpdateSession(session.id, {
                        messages: (prev) => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: accumulatedText }], isGenerating: true };
                            return newMessages;
                        }
                    });
                }
                 onUpdateSession(session.id, {
                    messages: (prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: accumulatedText }], isGenerating: false };
                        return newMessages;
                    }
                });
            }
    
            if (isFirstUserMessage && !isRegeneration) {
                await generateTitle(textInput || "Discussion avec image");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            onUpdateSession(session.id, {
                messages: (prev) => {
                    const newMessages = prev.slice(0, -1);
                    newMessages.push({ role: 'model', parts: [{ text: "Désolé, une erreur est survenue. Veuillez réessayer." }] });
                    return newMessages;
                },
            });
        } finally {
            setIsLoading(false);
        }
    }, [input, attachment, isLoading, session.id, session.messages, generateTitle, useWebSearch, generateContentWithSearch, createChatInstance, onUpdateSession]);
    
    const handleRegenerateWithModifier = (modifier: 'long' | 'short') => {
        if (isLoading || session.messages.length === 0) return;
    
        let lastModelIndex = -1;
        for (let i = session.messages.length - 1; i >= 0; i--) {
            if (session.messages[i].role === 'model' && !session.messages[i].isGenerating) {
                lastModelIndex = i;
                break;
            }
        }
    
        if (lastModelIndex === -1 || lastModelIndex === 0) return;
    
        const lastUserMessageIndex = lastModelIndex - 1;
        const lastUserMessage = session.messages[lastUserMessageIndex];
    
        if (lastUserMessage.role !== 'user') return;
    
        const historyOverride = session.messages.slice(0, lastUserMessageIndex + 1);
    
        const instruction = modifier === 'long' 
            ? "\n\n(Instruction : Rends ta réponse plus longue et plus détaillée.)"
            : "\n\n(Instruction : Rends ta réponse plus courte et plus concise.)";
        
        const modifiedParts = JSON.parse(JSON.stringify(lastUserMessage.parts));
        const textPart = modifiedParts.find((p: ChatPart) => p.text);
    
        if (textPart) {
            textPart.text += instruction;
        } else {
            modifiedParts.push({ text: instruction });
        }
    
        handleSendMessage(modifiedParts, historyOverride);
    };

    const handleCopy = (parts: ChatPart[], index: number) => {
        const textToCopy = parts.map(p => p.text).filter(Boolean).join('\n');
        navigator.clipboard.writeText(textToCopy);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const handleEditMessage = (index: number) => {
        const messageToEdit = session.messages[index];
        if (messageToEdit.role !== 'user' || isLoading) return;
        
        const textToEdit = messageToEdit.parts.find(p => p.text)?.text || '';
        setInput(textToEdit);

        onUpdateSession(session.id, { messages: (prev) => prev.slice(0, index) });
    };

    const handleRegenerateResponse = useCallback(async (index: number) => {
        if (isLoading || session.messages[index]?.role !== 'model') return;

        setIsLoading(true);
        const historyForRegen = session.messages.slice(0, index);
        
        onUpdateSession(session.id, { messages: [...historyForRegen, { role: 'model', parts: [], isGenerating: true }] });

        try {
            const chat = createChatInstance(historyForRegen);
            const lastUserMessage = historyForRegen[historyForRegen.length - 1];
            const result = await chat.sendMessageStream({ message: lastUserMessage.parts.map(p => p.text ? ({text: p.text}) : ({inlineData: {data: p.image!.data, mimeType: p.image!.mimeType}})) });
            
            let accumulatedText = "";
            for await (const chunk of result) {
                accumulatedText += chunk.text;
                onUpdateSession(session.id, {
                    messages: (prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: accumulatedText }], isGenerating: true };
                        return newMessages;
                    }
                });
            }
             onUpdateSession(session.id, {
                    messages: (prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: accumulatedText }], isGenerating: false };
                        return newMessages;
                    }
                });
        } catch (error) {
            console.error("Error regenerating response:", error);
            onUpdateSession(session.id, {
                messages: (prev) => [...prev.slice(0, -1), { role: 'model', parts: [{ text: "Désolé, la regénération a échoué." }] }],
            });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, session.messages, onUpdateSession, session.id, createChatInstance]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAttachment({ file, previewUrl: URL.createObjectURL(file) });
        }
        event.target.value = ''; // Reset input
    };
    
    const handleTitleChange = (newTitle: string) => {
        onUpdateSession(session.id, { title: newTitle });
    };

    const isConversationStarted = session.messages.length > 0;
    const canRegenerate = isConversationStarted && !isLoading && session.messages[session.messages.length-1].role === 'model';

    return (
        <div className="w-full h-full flex flex-col bg-white/10 dark:bg-slate-900/60">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            <div className="p-4 sm:p-6">
                <ChatHeader
                    title={session.title}
                    onTitleChange={handleTitleChange}
                    aiModel={session.aiModel}
                    onAiModelChange={(model) => onUpdateSession(session.id, { aiModel: model })}
                    isConversationStarted={isConversationStarted}
                    subscriptionPlan={subscriptionPlan}
                />
            </div>

            <main className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
                {session.messages.length === 0 && !attachment && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-sky-400 shadow-lg flex items-center justify-center mb-4">
                           <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200">
                           {session.aiModel === 'brevetai' ? 'BrevetAI' : session.aiModel === 'brevetai-pro' ? 'BrevetAI Pro' : 'BrevetAI Max' }
                        </h2>
                        <p className="text-slate-700 dark:text-slate-400">Comment puis-je vous aider à réviser ?</p>
                    </div>
                )}
                {session.messages.map((msg, index) => (
                    <Message
                        key={index}
                        index={index}
                        message={msg}
                        copiedIndex={copiedIndex}
                        onCopy={handleCopy}
                        onRegenerate={handleRegenerateResponse}
                        onEdit={handleEditMessage}
                    />
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 sm:p-6 border-t border-white/20 dark:border-slate-800 space-y-2">
                {attachment && (
                    <div className="relative w-24 h-24 p-1 border-2 border-indigo-400 rounded-lg bg-black/10">
                        <img src={attachment.previewUrl} alt="Preview" className="w-full h-full object-cover rounded" />
                        <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}
                 <div className="flex justify-center items-center gap-2">
                    <button onClick={() => handleRegenerateWithModifier('long')} disabled={!canRegenerate} className={`px-2 py-0.5 text-xs font-semibold rounded-full border transition-colors bg-transparent border-slate-400/50 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed`}>Plus long</button>
                    <button onClick={() => handleRegenerateWithModifier('short')} disabled={!canRegenerate} className={`px-2 py-0.5 text-xs font-semibold rounded-full border transition-colors bg-transparent border-slate-400/50 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed`}>Plus court</button>
                    <div className="relative">
                      <button onClick={() => setUseWebSearch(s => !s)} disabled={subscriptionPlan !== 'max'} className={`px-2 py-0.5 text-xs font-semibold rounded-full border transition-colors flex items-center gap-1 ${useWebSearch ? 'bg-indigo-500 text-white border-transparent' : 'bg-transparent border-slate-400/50 text-slate-600 dark:text-slate-400'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        Avec le Web
                      </button>
                       {subscriptionPlan !== 'max' && <PremiumBadge requiredPlan="max" size="small" />}
                    </div>
                </div>
                <div className="flex items-end bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl p-1 shadow-inner pr-2 border border-white/20 dark:border-slate-700">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={"Poser une question à BrevetAI..."}
                        className="flex-grow bg-transparent p-2 text-slate-900 dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-500 focus:outline-none resize-none leading-tight"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSendMessage()} disabled={isLoading || (!input.trim() && !attachment)} className="ml-2 w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex-shrink-0 mb-1">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
                       </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};
