
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatSession, ChatMessage } from '../types';
import { ai } from '../services/geminiService';
import type { Chat } from '@google/genai';

interface ChatViewProps {
    session: ChatSession;
    onUpdateSession: (sessionId: string, messages: ChatMessage[], newTitle?: string) => void;
    onBack: () => void;
    onNavigateHistory: () => void;
}

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

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
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
        </div>
    );
};

export const ChatView: React.FC<ChatViewProps> = ({ session, onUpdateSession, onBack, onNavigateHistory }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [session.messages]);

    useEffect(() => {
        const geminiChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: session.messages.filter(m => !m.isGenerating).map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            })),
            config: {
                systemInstruction: "Tu es BrevetAI, un tuteur IA spécialisé dans l'aide aux révisions pour le Brevet des collèges en France. Tes réponses doivent être pédagogiques, encourageantes et adaptées au niveau d'un élève de 3ème. Sois concis et clair. Tu peux utiliser des listes à puces ou des exemples pour faciliter la compréhension. N'hésite pas à poser des questions pour vérifier la compréhension de l'élève.",
            },
        });
        chatRef.current = geminiChat;
    }, [session.id]); // Re-initialize chat when session changes

    const generateTitle = useCallback(async (initialPrompt: string) => {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Génère un titre court et concis (4-5 mots maximum) pour une discussion qui commence par cette question : "${initialPrompt}". Réponds uniquement avec le titre.`,
            });
            onUpdateSession(session.id, session.messages, response.text.trim().replace(/"/g, ''));
        } catch (error) {
            console.error("Error generating title:", error);
        }
    }, [onUpdateSession, session.id, session.messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !chatRef.current) return;
        
        const userInput: ChatMessage = { role: 'user', content: input.trim() };
        let updatedMessages: ChatMessage[] = [...session.messages, userInput];
        
        onUpdateSession(session.id, updatedMessages);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        updatedMessages = [...updatedMessages, { role: 'model', content: '', isGenerating: true }];
        onUpdateSession(session.id, updatedMessages);

        try {
            const result = await chatRef.current.sendMessageStream({ message: currentInput.trim() });
            
            let fullResponse = '';
            updatedMessages.pop(); // Remove the "generating" placeholder
            onUpdateSession(session.id, updatedMessages);

            for await (const chunk of result) {
                fullResponse += chunk.text;
                const modelMessage: ChatMessage = { role: 'model', content: fullResponse };
                onUpdateSession(session.id, [...updatedMessages.filter(m => m.role === 'user' || (m.role === 'model' && !m.isGenerating)), modelMessage]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Désolé, une erreur est survenue. Veuillez réessayer." };
            updatedMessages.pop();
            onUpdateSession(session.id, [...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
        
        if (session.messages.filter(m => m.role === 'user').length === 1) {
            await generateTitle(currentInput.trim());
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-4 sm:p-6">
                <ChatHeader title={session.title} onBack={onBack} onNavigateHistory={onNavigateHistory} />
            </div>

            <main className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
                {session.messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center bg-white dark:bg-gray-700 rounded-xl p-2 shadow-inner">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Posez votre question à BrevetAI..."
                        className="flex-grow bg-transparent p-2 text-gray-800 dark:text-gray-100 focus:outline-none resize-none"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="ml-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};
