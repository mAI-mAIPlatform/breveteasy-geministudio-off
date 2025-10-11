import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ChatSession, ChatMessage, ChatPart, SubscriptionPlan, AiModel } from '../types';
import { ai } from '../services/geminiService';
import type { Chat, Part } from '@google/genai';

interface ChatViewProps {
    session: ChatSession;
    onUpdateSession: (sessionId: string, updates: {
        messages?: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]);
        title?: string;
        aiModel?: 'brevetai' | 'brevetai-plus';
    }) => void;
    systemInstruction: string;
    subscriptionPlan: SubscriptionPlan;
    userName: string;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const RegenerateIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0M6.166 9.348L3 12.529m0 0l3.181-3.182m0 0-3.181 3.182" /></svg>;

const ModelSelectorDropdown: React.FC<{
    aiModel: AiModel;
    onAiModelChange: (model: AiModel) => void;
    isConversationStarted: boolean;
}> = ({ aiModel, onAiModelChange, isConversationStarted }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const modelDisplayNames = {
        brevetai: 'BrevetAI',
        'brevetai-plus': 'BrevetAI +',
    };

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
                    {(['brevetai', 'brevetai-plus'] as const).map((model) => (
                        <button
                            key={model}
                            onClick={() => {
                                onAiModelChange(model);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-800 dark:text-slate-200 hover:bg-indigo-500/80 hover:text-white transition-colors"
                        >
                            {modelDisplayNames[model]}
                        </button>
                    ))}
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
}> = ({ title, onTitleChange, aiModel, onAiModelChange, isConversationStarted }) => {
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
    isLastMessage: boolean;
    copiedIndex: number | null;
    onCopy: (parts: ChatPart[], index: number) => void;
    onRegenerate: (index: number) => void;
    onEdit: (index: number) => void;
}> = ({ message, index, isLastMessage, copiedIndex, onCopy, onRegenerate, onEdit }) => {
    const isModel = message.role === 'model';

    const actionButtonClass = "p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100";

    return (
        <div className={`group flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
            {!isModel && (
                <div className="flex items-center self-center">
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
                 <div className="flex items-center self-center">
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

export const ChatView: React.FC<ChatViewProps> = ({ session, onUpdateSession, systemInstruction, subscriptionPlan, userName }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [attachment, setAttachment] = useState<{ file: File, previewUrl: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const messageLimit = useMemo(() => {
        if (session.aiModel === 'brevetai') {
            return Infinity;
        }
        // Logic for 'brevetai-plus'
        if (subscriptionPlan === 'free') return 15;
        if (subscriptionPlan === 'pro') return 100;
        return Infinity; // for 'max' plan
    }, [subscriptionPlan, session.aiModel]);
    
    const isChatLimitReached = session.messages.length >= messageLimit;
    const isConversationStarted = session.messages.length > 0;

    useEffect(scrollToBottom, [session.messages]);

    const createChatInstance = (history: ChatMessage[]): Chat => {
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
        
        const config: { systemInstruction: string; thinkingConfig?: { thinkingBudget: number } } = {
             systemInstruction: finalInstruction,
        };

        if (session.aiModel === 'brevetai') {
            config.thinkingConfig = { thinkingBudget: 0 };
        }
        // For 'brevetai-plus', we omit thinkingConfig to use the default (enabled)
        
        return ai.chats.create({
            model: 'gemini-2.5-flash',
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

    const handleRegenerateResponse = async (index: number) => {
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
        
        const chat = createChatInstance(historyForRegen.slice(0, -1));

        try {
            const result = await chat.sendMessageStream({ message: userPromptMessage.parts.map(p => p.image ? { inlineData: { data: p.image.data, mimeType: p.image.mimeType } } : { text: p.text || '' }) });
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
                />
            </div>

            <main className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
                {session.messages.length === 0 && !attachment && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700 p-5 rounded-full mb-4">
                            <svg className="w-12 h-12 text-indigo-500 dark:text-sky-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200">
                           {session.aiModel === 'brevetai' ? 'BrevetAI' : 'BrevetAI +'}
                        </h2>
                        <p className="text-slate-700 dark:text-slate-400">Comment puis-je vous aider à réviser ?</p>
                    </div>
                )}
                {session.messages.map((msg, index) => (
                    <Message
                        key={index}
                        index={index}
                        message={msg}
                        isLastMessage={index === session.messages.length - 1}
                        copiedIndex={copiedIndex}
                        onCopy={handleCopy}
                        onRegenerate={handleRegenerateResponse}
                        onEdit={handleEditMessage}
                    />
                ))}
                 {isChatLimitReached && (
                    <div className="text-center p-4 bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30 rounded-xl">
                        Vous avez atteint la limite de {messageLimit} messages pour BrevetAI+ avec votre forfait. Passez à un forfait supérieur pour continuer.
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
                <div className="flex items-center bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg rounded-full p-1 shadow-inner pr-2 border border-white/20 dark:border-slate-700">
                    <button onClick={() => fileInputRef.current?.click()} disabled={isChatLimitReached} className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                    <textarea
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
                    <button onClick={handleSendMessage} disabled={isLoading || isChatLimitReached || (!input.trim() && !attachment)} className="ml-2 w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex-shrink-0">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
                       </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};
