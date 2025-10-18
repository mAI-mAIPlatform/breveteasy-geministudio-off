import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ChatSession, ChatMessage, ChatPart, SubscriptionPlan, AiModel } from '../types';
import { ai, Type } from '../services/geminiService';
import type { Chat, Part } from '@google/genai';
import { PremiumBadge } from './PremiumBadge';

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
    // Fix: Add missing navigation properties to the interface to match props passed in App.tsx.
    onNavigateToImageGeneration: () => void;
    onNavigateToCanvas: () => void;
    onNavigateToFlashAI: () => void;
    onNavigateToPlanning: () => void;
    onNavigateToConseils: () => void;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const RegenerateIcon: React.FC<{ className?: string }> = ({ className }) => 
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>;


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
    onRegenerate: (index: number, modification: 'longer' | 'shorter' | 'change_model', newModel?: AiModel) => void;
    onEdit: (index: number) => void;
    regenMenuIndex: number | null;
    setRegenMenuIndex: (index: number | null) => void;
    subscriptionPlan: SubscriptionPlan;
}> = ({ message, index, copiedIndex, onCopy, onRegenerate, onEdit, regenMenuIndex, setRegenMenuIndex, subscriptionPlan }) => {
    const isModel = message.role === 'model';
    const isRegenMenuOpen = regenMenuIndex === index;
    const regenMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (regenMenuRef.current && !regenMenuRef.current.contains(event.target as Node)) {
                setRegenMenuIndex(null);
            }
        };
        if (isRegenMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isRegenMenuOpen, setRegenMenuIndex]);

    const handleRegenOptionClick = (mod: 'longer' | 'shorter' | 'change_model', model?: AiModel) => {
        onRegenerate(index, mod, model);
        setRegenMenuIndex(null);
    };
    
    const actionBarClass = "flex items-center self-center gap-1 p-1 bg-white/60 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200";
    const actionButtonClass = "p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors";
    const menuItemClass = "w-full text-left px-3 py-1.5 text-sm rounded-md text-slate-800 dark:text-slate-200 hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";

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
                    <div className="relative" ref={regenMenuRef}>
                        <button onClick={() => setRegenMenuIndex(isRegenMenuOpen ? null : index)} title="Regénérer" className={actionButtonClass}>
                            <RegenerateIcon className="h-4 w-4" />
                        </button>
                        {isRegenMenuOpen && (
                            <div className="absolute bottom-full right-0 mb-2 w-64 rounded-xl bg-white dark:bg-slate-800/90 backdrop-blur-lg shadow-2xl border border-white/20 dark:border-slate-700 z-20 p-2 space-y-1">
                                <button className={menuItemClass} onClick={() => handleRegenOptionClick('longer')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                    <span>Plus long</span>
                                </button>
                                <button className={menuItemClass} onClick={() => handleRegenOptionClick('shorter')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h4" /></svg>
                                    <span>Plus court</span>
                                </button>
                                <div className="my-1 border-t border-slate-200 dark:border-slate-700"></div>
                                <button className={menuItemClass} onClick={() => handleRegenOptionClick('change_model', 'brevetai')}>
                                    <span>Régénérer avec BrevetAI</span>
                                </button>
                                <button className={menuItemClass} onClick={() => handleRegenOptionClick('change_model', 'brevetai-pro')} disabled={subscriptionPlan === 'free'}>
                                    <span>Régénérer avec BrevetAI Pro</span>
                                </button>
                                <button className={menuItemClass} onClick={() => handleRegenOptionClick('change_model', 'brevetai-max')} disabled={subscriptionPlan !== 'max'}>
                                    <span>Régénérer avec BrevetAI Max</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ChatView: React.FC<ChatViewProps> = ({ session, onUpdateSession, systemInstruction, subscriptionPlan, userName, onNavigateToImageGeneration, onNavigateToCanvas, onNavigateToFlashAI, onNavigateToPlanning, onNavigateToConseils }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [attachment, setAttachment] = useState<{ file: File, previewUrl: string } | null>(null);
    const [regenMenuIndex, setRegenMenuIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset to calculate new scrollHeight
            const maxHeight = 192; // 12rem
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;
            textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }, [input]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const messageLimit = useMemo(() => {
        if (session.aiModel === 'brevetai' || session.aiModel === 'brevetai-max') {
            return Infinity;
        }
        if (session.aiModel === 'brevetai-pro') {
            if (subscriptionPlan === 'pro') return 100;
            if (subscriptionPlan === 'max') return Infinity;
        }
        return 0; // Not accessible for free plan
    }, [subscriptionPlan, session.aiModel]);
    
    const isChatLimitReached = session.messages.length >= messageLimit;
    const isConversationStarted = session.messages.length > 0;

    useEffect(scrollToBottom, [session.messages]);

    const createChatInstance = (history: ChatMessage[], modelOverride?: AiModel): Chat => {
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
        
        const modelToUse = modelOverride || session.aiModel;

        const config: { systemInstruction: string; thinkingConfig?: { thinkingBudget: number } } = {
             systemInstruction: finalInstruction,
        };

        let geminiModelName: 'gemini-2.5-flash' | 'gemini-2.5-pro' = 'gemini-2.5-flash';

        if (modelToUse === 'brevetai') {
            config.thinkingConfig = { thinkingBudget: 0 };
        } else if (modelToUse === 'brevetai-max') {
            geminiModelName = 'gemini-2.5-pro';
        }
        
        return ai.chats.create({
            model: geminiModelName,
            history: geminiHistory,
            config,
        });
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

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

    const handleSendMessage = async () => {
        const textInput = input.trim();
        if (!textInput && !attachment || isLoading || isChatLimitReached) return;
        
        const userParts: ChatPart[] = [];
        setIsLoading(true);

        if (attachment) {
            try {
                const base64Data = await fileToBase64(attachment.file);
                userParts.push({ image: { data: base64Data, mimeType: attachment.file.type } });
            } catch(error) {
                console.error("Error converting file to base64", error);
                setIsLoading(false);
                return;
            }
        }
        if (textInput) {
            userParts.push({ text: textInput });
        }

        const userInputMessage: ChatMessage = { role: 'user', parts: userParts };
        const baseMessages = [...session.messages, userInputMessage];
        onUpdateSession(session.id, { messages: baseMessages });
        
        setInput('');
        setAttachment(null);

        const modelThinkingMessage: ChatMessage = { role: 'model', parts: [], isGenerating: true };
        onUpdateSession(session.id, { messages: [...baseMessages, modelThinkingMessage] });
        
        try {
            const chat = createChatInstance(session.messages);
            const result = await chat.sendMessageStream({ message: userParts.map(p => p.image ? { inlineData: { data: p.image.data, mimeType: p.image.mimeType } } : { text: p.text || '' }) });
            
            let fullResponse = '';
            for await (const chunk of result) {
                fullResponse += chunk.text;
                const modelMessage: ChatMessage = { role: 'model', parts: [{ text: fullResponse }] };
                onUpdateSession(session.id, { messages: [...baseMessages, modelMessage] });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Désolé, une erreur est survenue. Veuillez réessayer." }] };
            onUpdateSession(session.id, { messages: prev => [...prev.slice(0, -1), errorMessage] });
        } finally {
            setIsLoading(false);
        }
        
        if (session.messages.filter(m => m.role === 'user').length === 0) {
            await generateTitle(textInput || "Discussion avec image");
        }
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

        // Remove the message and subsequent messages
        const newMessages = session.messages.slice(0, index);
        onUpdateSession(session.id, { messages: newMessages });
    };

    const handleRegenerateResponse = async (index: number, modification: 'longer' | 'shorter' | 'change_model', newModel?: AiModel) => {
        if (isLoading || session.messages[index]?.role !== 'model') return;

        setIsLoading(true);
        const historyForRegen = session.messages.slice(0, index);
        const userPromptMessage = historyForRegen[historyForRegen.length - 1];

        if(userPromptMessage?.role !== 'user') {
            setIsLoading(false);
            return;
        }
        
        let messagesForUpdate = [...session.messages];
        messagesForUpdate[index] = { role: 'model', parts: [], isGenerating: true };
        onUpdateSession(session.id, { messages: messagesForUpdate });

        const chatHistoryForAi = historyForRegen.slice(0, -1);
        const modelForRegen = modification === 'change_model' && newModel ? newModel : session.aiModel;
        const chat = createChatInstance(chatHistoryForAi, modelForRegen);
        
        const originalUserParts: ChatPart[] = JSON.parse(JSON.stringify(userPromptMessage.parts)); // Deep copy

        if (modification === 'longer' || modification === 'shorter') {
            const instruction = modification === 'longer' 
                ? "\n\n(Instruction pour l'IA : Régénère ta réponse précédente, mais en la rendant plus longue et plus détaillée.)"
                : "\n\n(Instruction pour l'IA : Régénère ta réponse précédente, mais en la rendant plus courte et plus concise.)";
            
            let textPartFound = false;
            for (const part of originalUserParts) {
                if (part.text) {
                    part.text += instruction;
                    textPartFound = true;
                    break;
                }
            }
            if (!textPartFound) {
                originalUserParts.push({ text: instruction });
            }
        }
        
        const promptForRegenParts: Part[] = originalUserParts.map(p => p.image ? { inlineData: { data: p.image.data, mimeType: p.image.mimeType } } : { text: p.text || '' });

        try {
            const result = await chat.sendMessageStream({ message: promptForRegenParts });
            let fullResponse = '';
            for await (const chunk of result) {
                fullResponse += chunk.text;
                messagesForUpdate[index] = { role: 'model', parts: [{ text: fullResponse }] };
                onUpdateSession(session.id, { messages: [...messagesForUpdate] });
            }
        } catch (error) {
            console.error("Error regenerating response:", error);
            messagesForUpdate[index] = { role: 'model', parts: [{ text: "Désolé, une erreur est survenue lors de la regénération." }] };
            onUpdateSession(session.id, { messages: messagesForUpdate });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAttachment({ file, previewUrl: URL.createObjectURL(file) });
        }
    };
    
    const handleTitleChange = (newTitle: string) => {
        onUpdateSession(session.id, { title: newTitle });
    };

    const modelDisplayNames: Record<AiModel, string> = {
        brevetai: 'BrevetAI',
        'brevetai-pro': 'BrevetAI Pro',
        'brevetai-max': 'BrevetAI Max',
    };

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
                           {modelDisplayNames[session.aiModel] || 'BrevetAI'}
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
                        regenMenuIndex={regenMenuIndex}
                        setRegenMenuIndex={setRegenMenuIndex}
                        subscriptionPlan={subscriptionPlan}
                    />
                ))}
                 {isChatLimitReached && (
                    <div className="text-center p-4 bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30 rounded-xl">
                        Vous avez atteint la limite de {messageLimit} messages pour ce modèle avec votre forfait. Passez à un forfait supérieur pour continuer.
                    </div>
                )}
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
                <div className="flex items-end bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl p-1 shadow-inner pr-2 border border-white/20 dark:border-slate-700">
                    <button onClick={() => fileInputRef.current?.click()} disabled={isChatLimitReached} className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-1">
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
                        placeholder={isChatLimitReached ? "Limite de messages atteinte." : "Poser une question à BrevetAI..."}
                        className="flex-grow bg-transparent p-2 text-slate-900 dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-500 focus:outline-none resize-none leading-tight"
                        rows={1}
                        disabled={isLoading || isChatLimitReached}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || isChatLimitReached || (!input.trim() && !attachment)} className="ml-2 w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex-shrink-0 mb-1">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
                       </svg>
                    </button>
                </div>
                {session.aiModel === 'brevetai-pro' && (
                    <p className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
                        {isFinite(messageLimit) ? `${Math.max(0, messageLimit - session.messages.length)} messages restants avec votre forfait.` : 'Messages illimités.'}
                    </p>
                )}
            </footer>
        </div>
    );
};
