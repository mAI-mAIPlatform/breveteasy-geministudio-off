
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Correct import path for GoogleGenAI SDK
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage, ChatMessagePart } from '../types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const WelcomeBanner: React.FC = () => (
    <div className="m-auto flex flex-col items-center justify-center text-center p-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 rounded-full mb-6 shadow-lg">
             <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.5,12,6.3,21.8a1,1,0,0,1-1.5-.8V3a1,1,0,0,1,1.5-.8L17.5,12Z" fill="currentColor"/></svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-800">BrevetAI</h2>
        <p className="text-xl text-gray-500 mt-2">
            L'IA spécialisée pour les révisions du Brevet. Je suis là pour t'aider.
        </p>
    </div>
);

const CHAT_HISTORY_KEY = 'brevet-ai-chat-history';

export const ChatView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any | null>(null); // Using 'any' for SpeechRecognition

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let initialMessages: ChatMessage[] = [];
    let historyForGemini: any[] = [];
    
    try {
        const savedMessagesJSON = localStorage.getItem(CHAT_HISTORY_KEY);
        if (savedMessagesJSON) {
            const savedMessages = JSON.parse(savedMessagesJSON);
            if (Array.isArray(savedMessages) && savedMessages.length > 0) {
                initialMessages = savedMessages;
                historyForGemini = savedMessages.slice(1).map((msg: ChatMessage) => ({
                    role: msg.sender,
                    parts: msg.parts.map(part => {
                        if (part.text) return { text: part.text };
                        if (part.file) return { inlineData: { data: part.file.data, mimeType: part.file.mimeType } };
                        return null;
                    }).filter(p => p !== null)
                }));
            }
        }
    } catch (error) {
        console.error("Failed to load chat history:", error);
        localStorage.removeItem(CHAT_HISTORY_KEY);
    }


    const newChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: historyForGemini,
      config: {
        systemInstruction: "Tu es Brevet AI, un tuteur IA amical et expert. Ton but est d'aider les élèves de 3ème à réviser pour le Brevet des collèges en France. Réponds à leurs questions, explique des concepts complexes simplement, et aide-les avec leurs exercices, y compris ceux envoyés en photo. Sois encourageant, patient et pédagogique.",
      },
    });
    setChat(newChat);

    if (initialMessages.length === 0) {
        setMessages([{
            id: Date.now(),
            sender: 'model',
            parts: [{ text: "Bonjour ! Je suis Brevet AI. Comment puis-je t'aider à réviser aujourd'hui ? Pose-moi une question ou envoie-moi un exercice en photo."}]
        }]);
    } else {
        setMessages(initialMessages);
    }


    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'fr-FR';
        recognition.interimResults = true;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            setInput(prev => prev + finalTranscript);
        };
        recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    // Save messages to localStorage, but not just the initial greeting.
    if (messages.length > 1) {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save chat history:", error);
        }
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAttachedFile(event.target.files[0]);
    }
  };
  
  const handleMicClick = () => {
    if (recognitionRef.current) {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    } else {
        alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
    }
  };

  const sendMessage = useCallback(async () => {
    if ((!input.trim() && !attachedFile) || isLoading || !chat) return;

    setIsLoading(true);
    const userParts: ChatMessagePart[] = [];
    
    if (attachedFile) {
        try {
            const { data, mimeType } = await fileToBase64(attachedFile);
            userParts.push({ file: { data, mimeType, name: attachedFile.name } });
        } catch (error) {
            console.error("Error converting file:", error);
            setIsLoading(false);
            return;
        }
    }
    if (input.trim()) userParts.push({ text: input });

    const userMessage: ChatMessage = { id: Date.now(), sender: 'user', parts: userParts };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFile(null);

    try {
        const geminiParts = userParts.map(p => p.file ? { inlineData: { data: p.file.data, mimeType: p.file.mimeType } } : { text: p.text || '' });
        const stream = await chat.sendMessageStream({ message: geminiParts });
      
        let modelResponseText = '';
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'model', parts: [{ text: '' }] }]);

        for await (const chunk of stream) {
            modelResponseText += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.sender === 'model') {
                    lastMessage.parts = [{ text: modelResponseText }];
                }
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.sender === 'model' && lastMessage.parts[0]?.text === '') {
                lastMessage.parts = [{ text: "Désolé, une erreur est survenue." }];
            }
            return newMessages;
        });
    } finally {
        setIsLoading(false);
    }
  }, [chat, input, attachedFile, isLoading]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <header className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Discussion avec Brevet AI</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>
      
      <main className="flex-grow overflow-y-auto pr-2 flex flex-col">
        {messages.length <= 1 ? (
          <WelcomeBanner />
        ) : (
          <div className="space-y-4">
            {messages.slice(1).map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-fit max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  {msg.parts.map((part, index) => (
                    <div key={index}>
                      {part.file && part.file.mimeType.startsWith('image/') && (
                        <img src={`data:${part.file.mimeType};base64,${part.file.data}`} alt={part.file.name} className="max-w-xs rounded-lg mb-2" />
                      )}
                      {part.text && <p className="whitespace-pre-wrap">{part.text}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length-1].sender === 'user' && (
                <div className="flex gap-3 justify-start">
                  <div className="w-fit max-w-lg p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="pt-4 mt-2">
        {attachedFile && (
            <div className="mb-2 flex items-center justify-between bg-blue-50 text-blue-800 text-sm p-2 rounded-lg">
                <span>Fichier joint : {attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="font-bold text-xl">&times;</button>
            </div>
        )}
        <div className="flex items-center gap-2 p-2 rounded-full border border-gray-300 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="grid place-items-center h-10 w-10 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>
            </button>
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Poser une question..."
                rows={1}
                className="flex-grow bg-transparent focus:outline-none resize-none text-base text-gray-800 placeholder-gray-500 max-h-32"
                disabled={isLoading}
            />
            <button onClick={handleMicClick} disabled={isLoading} className={`grid place-items-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-blue-600'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
            </button>
            <button onClick={sendMessage} disabled={isLoading || (!input.trim() && !attachedFile)} className="grid place-items-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-blue-200 transition-colors flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/></svg>
            </button>
        </div>
      </footer>
    </div>
  );
};
