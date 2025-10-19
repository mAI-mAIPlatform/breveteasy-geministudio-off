import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ChatSession, ChatMessage, ChatPart, SubscriptionPlan, AiModel } from '../types';
import { PremiumBadge } from './PremiumBadge';
import { useLocalization } from '../hooks/useLocalization';
import { marked } from 'marked';

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
    generateContentWithSearch: (history: ChatMessage[], currentParts: ChatPart[]) => Promise<any>;
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
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const modelDisplayNames: Record<AiModel, string> = {
        brevetai: t('home_brevetai'),
        'brevetai-pro': t('subscription_plan_pro'),
        'brevetai-max': t('subscription_plan_max'),
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
    const { t } = useLocalization();
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
                                title={t('chat_header_rename_title')}
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
    onRegenerate: (index: number, modification?: 'longer' | 'shorter') => void;
    onEdit: (index: number) => void;
}> = ({ message, index, copiedIndex, onCopy, onRegenerate, onEdit }) => {
    const { t } = useLocalization();
    const isModel = message.role === 'model';
    
    const actionBarClass = "flex items-center self-center gap-1 p-1 bg-white/60 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200";
    const actionButtonClass = "p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors";

    return (
        <div className={`group flex items-start gap-3 ${isModel ? 'justify-start' : 'flex-row-reverse'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 shadow-md ${isModel ? 'bg-white/30 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-t-2xl rounded-br-2xl' : 'bg-indigo-500/80 backdrop-blur-md text-white rounded-t-2xl rounded-bl-2xl'}`}>
                {message.isGenerating && (!message.parts || message.parts.length === 0 || !message.parts.some(p => p.text?.trim())) ? (
                    <div className="flex items-center">
                        <span className="reflection-text font-semibold text-slate-600 dark:text-slate-400">Réflexion...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {message.parts.map((part, partIndex) => {
                            if (part.image) {
                                return <img key={partIndex} src={`data:${part.image.mimeType};base64,${part.image.data}`} alt="User upload" className="rounded-lg max-w-xs" />;
                            }
                            if (part.text) {
                                const html = marked.parse(part.text);
                                const streamingHtml = html + (message.isGenerating ? '<span class="blinking-cursor"></span>' : '');
                                return <div key={partIndex} className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2" dangerouslySetInnerHTML={{ __html: streamingHtml as string }}></div>;
                            }
                            return null;
                        })}
                        {message.groundingMetadata?.groundingChunks && (
                            <div className="mt-4 pt-3 border-t border-slate-300/50 dark:border-slate-600/50">
                                <h4 className="text-xs font-bold mb-2">Sources Web :</h4>
                                <div className="flex flex-wrap gap-2">
                                    {message.groundingMetadata.groundingChunks.map((chunk, i) => (
                                        <a href={chunk.web.uri} key={i} target="_blank" rel="noopener noreferrer" className="text-xs bg-black/10 dark:bg-slate-700 px-2 py-1 rounded-md hover:bg-black/20 dark:hover:bg-slate-600 transition-colors truncate">
                                            {chunk.web.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
             <div className={actionBarClass}>
                <button onClick={() => onCopy(message.parts, index)} title={t('copy')} className={actionButtonClass}>
                    {copiedIndex === index ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </button>
                {isModel && !message.isGenerating && (
                    <button onClick={() => onRegenerate(index)} title="Regénérer" className={actionButtonClass}>
                        <RegenerateIcon className="h-4 w-4" />
                    </button>
                )}
                {!isModel && (
                    <button onClick={() => onEdit(index)} title={t('edit')} className={actionButtonClass}>
                        <EditIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const ChatView: React.FC<ChatViewProps> = ({ session, onUpdateSession, systemInstruction, subscriptionPlan, userName, onNavigateToImageGeneration, onNavigateToCanvas, onNavigateToFlashAI, onNavigateToPlanning, onNavigateToConseils, generateContentWithSearch }) => {
    const { t } = useLocalization();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [attachment, setAttachment] = useState<{ file: File, previewUrl: string } | null>(null);
    const [useWebSearch, setUseWebSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const modelDisplayNames: Record<AiModel, string> = {
        brevetai: t('home_brevetai'),
        'brevetai-pro': t('subscription_plan_pro'),
        'brevetai-max': t('subscription_plan_max'),
    };
    
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
    
    const generateTitle = useCallback(async (initialPrompt: string) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generateTitle', payload: { prompt: initialPrompt } }),
            });
            if (!response.ok) throw new Error('Failed to generate title');
            const { title } = await response.json();
            onUpdateSession(session.id, { title: title.trim().replace(/"/g, '') });
        } catch (error) {
            console.error("Error generating title:", error);
        }
    }, [onUpdateSession, session.id]);

     const processStream = useCallback(async (response: Response) => {
        if (!response.ok || !response.body) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullResponse += decoder.decode(value, { stream: true });
            onUpdateSession(session.id, {
                messages: (prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: fullResponse }], isGenerating: true };
                    return newMessages;
                }
            });
        }
        onUpdateSession(session.id, {
            messages: (prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: fullResponse }], isGenerating: false };
                return newMessages;
            }
        });
    }, [onUpdateSession, session.id]);

    const handleSendMessage = useCallback(async () => {
        const textInput = input.trim();
        if ((!textInput && !attachment) || isLoading) return;

        setIsLoading(true);
        const userParts: ChatPart[] = [];
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

        const currentHistory = session.messages;
        const userInputMessage: ChatMessage = { role: 'user', parts: userParts };
        
        onUpdateSession(session.id, {
          messages: (prev) => [...prev, userInputMessage, { role: 'model', parts: [], isGenerating: true }],
        });

        const isFirstUserMessage = currentHistory.filter(m => m.role === 'user').length === 0;
        
        setInput('');
        setAttachment(null);
        
        try {
          if (useWebSearch) {
            const response = await generateContentWithSearch(currentHistory, userParts) as any;
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            onUpdateSession(session.id, {
              messages: (prev) => {
                const newMessages = [...prev.slice(0, -1)];
                newMessages.push({ role: 'model', parts: [{ text: response.text }], groundingMetadata });
                return newMessages;
              },
            });
          } else {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sendMessage',
                    payload: {
                        history: currentHistory,
                        message: { parts: userParts },
                        config: { aiModel: session.aiModel, systemInstruction, userName, subscriptionPlan }
                    }
                }),
            });
            await processStream(response);
          }

          if (isFirstUserMessage && (textInput || attachment)) {
            await generateTitle(textInput || "Discussion avec image");
          }
        } catch (error) {
          console.error("Error sending message:", error);
          onUpdateSession(session.id, {
            messages: (prev) => {
              const newMessages = [...prev.slice(0, -1)];
              newMessages.push({ role: 'model', parts: [{ text: "Désolé, une erreur est survenue. Veuillez réessayer." }] });
              return newMessages;
            },
          });
        } finally {
          setIsLoading(false);
        }
    }, [input, attachment, isLoading, onUpdateSession, session.id, session.messages, generateTitle, useWebSearch, systemInstruction, userName, subscriptionPlan, session.aiModel, processStream, generateContentWithSearch]);


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
        textareaRef.current?.focus();
    };

    const handleRegenerateResponse = useCallback(async (index: number, modification?: 'longer' | 'shorter') => {
        if (isLoading || session.messages[index]?.role !== 'model') return;

        setIsLoading(true);
        const historyForRegen = session.messages.slice(0, index);
        const userMessageIndex = historyForRegen.findLastIndex(m => m.role === 'user');

        if (userMessageIndex === -1) {
            setIsLoading(false);
            return;
        }

        const lastUserMessage = JSON.parse(JSON.stringify(historyForRegen[userMessageIndex])); // Deep copy
        const historyBeforeUserMessage = historyForRegen.slice(0, userMessageIndex);

        if (modification) {
            const instruction = modification === 'longer' 
                ? "\n\n(Instruction: Fais une version plus longue et plus détaillée de ta réponse précédente.)" 
                : "\n\n(Instruction: Fais une version plus courte et plus concise de ta réponse précédente.)";
            
            let textPart = lastUserMessage.parts.find((p: ChatPart) => p.text);
            if (textPart) {
                // Clean up previous modification instructions before adding a new one
                textPart.text = textPart.text.replace(/\n\n\(Instruction: .*\)/, '');
                textPart.text += instruction;
            } else {
                lastUserMessage.parts.push({ text: instruction });
            }
        }
        
        onUpdateSession(session.id, { messages: [...historyForRegen, { role: 'model', parts: [], isGenerating: true }] });

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sendMessage',
                    payload: {
                        history: historyBeforeUserMessage,
                        message: lastUserMessage,
                        config: { aiModel: session.aiModel, systemInstruction, userName, subscriptionPlan }
                    }
                }),
            });
            await processStream(response);
        } catch (error) {
            console.error("Error regenerating response:", error);
            onUpdateSession(session.id, {
                messages: (prev) => [...prev.slice(0, -1), { role: 'model', parts: [{ text: "Désolé, la regénération a échoué." }] }],
            });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, session.messages, onUpdateSession, session.id, systemInstruction, userName, subscriptionPlan, session.aiModel, processStream]);
    
    const handleRegenerateLast = (modification: 'longer' | 'shorter') => {
        const lastModelIndex = session.messages.findLastIndex(m => m.role === 'model' && !m.isGenerating);
        if (lastModelIndex !== -1) {
            handleRegenerateResponse(lastModelIndex, modification);
        }
    };

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
    const canRegenerate = !isLoading && session.messages.some(m => m.role === 'model' && !m.isGenerating);

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
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-sky-400 shadow-lg flex items-center justify-center mb-4">
                           <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200">
                           {modelDisplayNames[session.aiModel]}
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
                        placeholder={t('chat_input_placeholder')}
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
                 <div className="flex justify-center items-center gap-2 pt-1">
                    <div className="relative">
                      <button onClick={() => setUseWebSearch(s => !s)} disabled={subscriptionPlan !== 'max'} className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors flex items-center gap-1.5 ${useWebSearch ? 'bg-indigo-500 text-white border-transparent' : 'bg-transparent border-slate-400/50 text-slate-600 dark:text-slate-400'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        {t('chat_message_with_web')}
                      </button>
                       {subscriptionPlan !== 'max' && <PremiumBadge requiredPlan="max" size="small" />}
                    </div>
                     <div className="flex items-center gap-1 p-0.5 border border-slate-400/50 rounded-full">
                        <button 
                            onClick={() => handleRegenerateLast('shorter')} 
                            disabled={!canRegenerate}
                            className="px-3 py-0.5 text-xs font-semibold rounded-full transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('chat_regenerate_shorter_tooltip')}
                        >
                            {t('chat_regenerate_shorter')}
                        </button>
                        <button 
                            onClick={() => handleRegenerateLast('longer')} 
                            disabled={!canRegenerate}
                            className="px-3 py-0.5 text-xs font-semibold rounded-full transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('chat_regenerate_longer_tooltip')}
                        >
                            {t('chat_regenerate_longer')}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};