import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatSession, ChatMessage } from '../types';
import { ai } from '../services/geminiService';
import type { Chat } from '@google/genai';

interface ChatViewProps {
    session: ChatSession;
    // FIX: Allow `messages` to be a function to enable safe state updates.
    onUpdateSession: (sessionId: string, messages: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]), newTitle?: string) => void;
    onBack: () => void;
    onNavigateHistory: () => void;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const RegenerateIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201-4.441 5.5 5.5 0 0111.162 1.316l.07-.425a.75.75 0 011.44.24l-1.003 6.02a.75.75 0 01-1.393-.232l.07-.425a4 4 0 00-7.443-2.025 4 4 0 006.653 3.32.75.75 0 01.982.727l.035 1.05a.75.75 0 01-1.498.05l-.035-1.05a2.5 2.5 0 01-4.158-2.075 2.5 2.5 0 014.576-1.032l-.07.425a.75.75 0 01-1.44-.24l1.003-6.02a.75.75 0 011.393.232l-.07.425z" clipRule="evenodd" /></svg>;


const ChatHeader: React.FC<{ title: string; onBack: () => void; onNavigateHistory: () => void; }> = ({ title, onBack, onNavigateHistory }) => (
    <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-center truncate px-4">{title}</h2>
        <button onClick={onNavigateHistory} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
    </header>
);

const Message: React.FC<{
    message: ChatMessage;
    index: number;
    isLastMessage: boolean;
    copiedIndex: number | null;
    onCopy: (text: string, index: number) => void;
    onRegenerate: (index: number) => void;
    onEdit: (index: number) => void;
}> = ({ message, index, isLastMessage, copiedIndex, onCopy, onRegenerate, onEdit }) => {
    const isModel = message.role === 'model';

    const actionButtonClass = "p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors";

    return (
        <div className={`group flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
            {/* User Message Actions (Left) */}
            {!isModel && (
                <div className={`flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isLastMessage ? 'opacity-100' : ''}`}>
                    <button onClick={() => onEdit(index)} title="Modifier" className={actionButtonClass}>
                        <EditIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => onCopy(message.content, index)} title="Copier" className={actionButtonClass}>
                        {copiedIndex === index ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                </div>
            )}
            
            {/* Message Bubble */}
            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl ${isModel ? 'bg-white dark:bg-gray-700' : 'bg-blue-600 text-white'}`}>
                {message.isGenerating ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                )}
            </div>

             {/* AI Message Actions (Right) */}
            {isModel && !message.isGenerating && (
                 <div className={`flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isLastMessage ? 'opacity-100' : ''}`}>
                    <button onClick={() => onCopy(message.content, index)} title="Copier" className={actionButtonClass}>
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

export const ChatView: React.FC<ChatViewProps> = ({ session, onUpdateSession, onBack, onNavigateHistory }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [session.messages]);

    const createChatInstance = (history: ChatMessage[]): Chat => {
         return ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history.filter(m => !m.isGenerating).map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            })),
            config: {
                systemInstruction: "Tu es BrevetAI, un tuteur IA spécialisé dans l'aide aux révisions pour le Brevet des collèges en France. Tes réponses doivent être pédagogiques, encourageantes et adaptées au niveau d'un élève de 3ème. Sois concis et clair. Tu peux utiliser des listes à puces ou des exemples pour faciliter la compréhension. N'hésite pas à poser des questions pour vérifier la compréhension de l'élève.",
            },
        });
    }

    const generateTitle = useCallback(async (initialPrompt: string) => {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Génère un titre court et concis (4-5 mots maximum) pour une discussion qui commence par cette question : "${initialPrompt}". Réponds uniquement avec le titre.`,
            });
            // Use a functional update to ensure we have the latest messages
            onUpdateSession(session.id, (prevMessages) => prevMessages, response.text.trim().replace(/"/g, ''));
        } catch (error) {
            console.error("Error generating title:", error);
        }
    }, [onUpdateSession, session.id]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        
        const userInput: ChatMessage = { role: 'user', content: input.trim() };
        const currentInput = input;
        
        let updatedMessages: ChatMessage[] = [...session.messages, userInput];
        onUpdateSession(session.id, updatedMessages);
        setInput('');
        setIsLoading(true);

        const chat = createChatInstance(session.messages);
        
        updatedMessages = [...updatedMessages, { role: 'model', content: '', isGenerating: true }];
        onUpdateSession(session.id, updatedMessages);
        
        try {
            const result = await chat.sendMessageStream({ message: currentInput.trim() });
            
            let fullResponse = '';
            // Remove placeholder before streaming
            let baseMessages = [...session.messages, userInput];

            for await (const chunk of result) {
                fullResponse += chunk.text;
                const modelMessage: ChatMessage = { role: 'model', content: fullResponse };
                onUpdateSession(session.id, [...baseMessages, modelMessage]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Désolé, une erreur est survenue. Veuillez réessayer." };
            onUpdateSession(session.id, prev => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setIsLoading(false);
        }
        
        if (session.messages.filter(m => m.role === 'user').length === 0) { // Check if it's the first user message
            await generateTitle(currentInput.trim());
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const handleEditMessage = (index: number) => {
        const messageToEdit = session.messages[index];
        if (messageToEdit.role !== 'user' || isLoading) return;
        
        const newMessages = session.messages.slice(0, index);
        onUpdateSession(session.id, newMessages);
        setInput(messageToEdit.content);
    };

    const handleRegenerateResponse = async (index: number) => {
        if (isLoading || session.messages[index]?.role !== 'model') return;

        setIsLoading(true);
        const historyForRegen = session.messages.slice(0, index);
        const userPrompt = historyForRegen[historyForRegen.length - 1];

        if(userPrompt?.role !== 'user') {
            setIsLoading(false);
            return;
        }
        
        let updatedMessages = [...session.messages];
        updatedMessages[index] = { role: 'model', content: '', isGenerating: true };
        onUpdateSession(session.id, updatedMessages);
        
        const chat = createChatInstance(historyForRegen.slice(0, -1));

        try {
            const result = await chat.sendMessageStream({ message: userPrompt.content });
            let fullResponse = '';
            for await (const chunk of result) {
                fullResponse += chunk.text;
                updatedMessages[index] = { role: 'model', content: fullResponse };
                onUpdateSession(session.id, [...updatedMessages]);
            }
        } catch (error) {
            console.error("Error regenerating response:", error);
            updatedMessages[index] = { role: 'model', content: "Désolé, une erreur est survenue lors de la regénération." };
            onUpdateSession(session.id, updatedMessages);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-4 sm:p-6">
                <ChatHeader title={session.title} onBack={onBack} onNavigateHistory={onNavigateHistory} />
            </div>

            <main className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
                {session.messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-white dark:bg-gray-700 p-5 rounded-full mb-4">
                            <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">BrevetAI</h2>
                        <p className="text-gray-600 dark:text-gray-400">Comment puis-je vous aider à réviser ?</p>
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
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center bg-white dark:bg-gray-700 rounded-full p-1 shadow-inner pr-2">
                    <button className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100">
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
                        placeholder="Poser une question..."
                        className="flex-grow bg-transparent p-2 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none leading-tight"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="ml-2 w-10 h-10 flex items-center justify-center bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};
