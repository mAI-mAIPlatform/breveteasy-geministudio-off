// Fix: Provide the implementation for the main App component.
import React, { useState, useEffect, useCallback } from 'react';
import { HomeView } from './components/HomeView';
import { SubjectOptionsView } from './components/SubjectOptionsView';
import { LoadingView } from './components/LoadingView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { ChatView } from './components/ChatView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { ai, Type } from './services/geminiService';
import type { Subject, Quiz, ChatSession, ChatMessage } from './types';

type View = 'home' | 'subjectOptions' | 'loading' | 'quiz' | 'results' | 'chat' | 'history' | 'settings' | 'login';

const App: React.FC = () => {
    // App State
    const [view, setView] = useState<View>('home');
    const [loadingTask, setLoadingTask] = useState<'quiz' | 'exercises'>('quiz');
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as any) || 'system';
    });

    // User/Profile State
    const [user, setUser] = useState<{email: string} | null>(null);
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [lastXpGained, setLastXpGained] = useState(0);
    const [leveledUp, setLeveledUp] = useState(false);
    
    // Quiz State
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>([]);
    const [score, setScore] = useState(0);

    // Chat State
    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
        const savedSessions = localStorage.getItem('chatSessions');
        return savedSessions ? JSON.parse(savedSessions) : [];
    });
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);

    // Theme Management Effect
    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', systemPrefersDark);
        } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }, [theme]);

    // Chat Session Persistence Effect
     useEffect(() => {
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }, [chatSessions]);

    // XP & Leveling Logic
    const addXp = (amount: number) => {
        const newXp = xp + amount;
        const xpToNextLevel = level * 100;
        setLastXpGained(amount);
        if (newXp >= xpToNextLevel) {
            setLevel(level + 1);
            setXp(newXp - xpToNextLevel);
            setLeveledUp(true);
        } else {
            setXp(newXp);
            setLeveledUp(false);
        }
    };

    // Navigation Handlers
    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        setView('subjectOptions');
    };

    const handleBackToHome = () => {
        setSelectedSubject(null);
        setQuiz(null);
        setQuizAnswers([]);
        setScore(0);
        setView('home');
    };

    // Quiz Flow Handlers
    const handleGenerateQuiz = useCallback(async (customPrompt: string, count: number) => {
        if (!selectedSubject) return;
        setView('loading');
        setLoadingTask('quiz');
        
        const quizSchema = {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            questionText: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        },
                        required: ['questionText', 'options', 'correctAnswer', 'explanation']
                    }
                }
            },
            required: ['subject', 'questions']
        };

        try {
            let prompt = `Génère un quiz de ${count} questions à choix multiples sur le sujet "${selectedSubject.name}" pour un élève de 3ème en France se préparant pour le Brevet. Chaque question doit avoir 4 options de réponse. Fournis une explication pour chaque bonne réponse. Assure-toi que la correctAnswer est l'une des chaînes de caractères dans options.`;
            
            if (customPrompt.trim()) {
                prompt += `\n\nInstructions supplémentaires de l'utilisateur : focalise le quiz sur les points suivants : "${customPrompt.trim()}".`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: quizSchema,
                },
            });
            
            const quizData = JSON.parse(response.text);
            setQuiz(quizData);
            setView('quiz');
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            alert("Désolé, une erreur est survenue lors de la génération du quiz. Veuillez réessayer.");
            handleBackToHome();
        }
    }, [selectedSubject]);
    
    const handleQuizSubmit = (answers: (string | null)[]) => {
        if (!quiz) return;
        let newScore = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                newScore++;
            }
        });
        setScore(newScore);
        setQuizAnswers(answers);
        addXp(newScore * 10);
        setView('results');
    };

    // Exercises Flow Handlers
    const handleGenerateExercises = useCallback(async (customPrompt: string, count: number) => {
        if (!selectedSubject) return;
        setView('loading');
        setLoadingTask('exercises');
        try {
            let prompt = `Crée une fiche d'exercices complète et bien structurée sur le thème "${selectedSubject.name}" pour un élève de 3ème se préparant pour le Brevet. La réponse DOIT être un document HTML complet et autonome (self-contained).
- Inclus une balise <!DOCTYPE html>, <html>, <head>, et <body>.
- Dans le <head>, inclus un <title> pertinent et un lien vers la police "Poppins" de Google Fonts.
- Inclus aussi une balise <style> avec du CSS pour une présentation claire, professionnelle et lisible. Utilise la police 'Poppins', sans-serif. Style les titres (h1, h2, h3), les paragraphes, et crée des classes pour les sections d'exercices et les sections de corrigés. Le corrigé doit être clairement séparé et facile à identifier. Ajoute un style sobre pour le mode sombre (dark mode).
- Le <body> doit contenir un titre principal (h1) et ${count} exercices variés avec des énoncés clairs (utilise des h2 pour chaque exercice).
- Fournis un corrigé détaillé pour chaque exercice dans une section séparée à la fin du document (commençant par un h1 "Corrigé").
- La structure doit être sémantique (utilise des balises comme <section>, <article>, etc.).`;

            if (customPrompt.trim()) {
                prompt += `\n\nInstructions supplémentaires de l'utilisateur : base les exercices sur les points suivants : "${customPrompt.trim()}".`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedHtml = response.text;
            if (!generatedHtml || !generatedHtml.toLowerCase().includes('</html>')) {
                throw new Error("Le contenu généré n'est pas un document HTML valide.");
            }
            
            const blob = new Blob([generatedHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url); 

            handleBackToHome();

        } catch (error) {
            console.error("Failed to generate exercises:", error);
            alert("Désolé, une erreur est survenue lors de la génération des exercices. Veuillez réessayer.");
            handleBackToHome();
        }
    }, [selectedSubject]);

    // Chat Flow Handlers
    const handleStartChat = () => {
        const newSession: ChatSession = {
            id: `chat_${Date.now()}`,
            title: 'Nouvelle Discussion',
            createdAt: Date.now(),
            messages: []
        };
        setChatSessions(prev => [newSession, ...prev]);
        setActiveChatSessionId(newSession.id);
        setView('chat');
    };
    
    const handleUpdateSession = useCallback((sessionId: string, messages: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]), newTitle?: string) => {
        setChatSessions(prevSessions =>
            prevSessions.map(session => {
                if (session.id === sessionId) {
                    const updatedMessages = typeof messages === 'function' ? messages(session.messages) : messages;
                    return {
                        ...session,
                        title: newTitle ?? session.title,
                        messages: updatedMessages,
                    };
                }
                return session;
            })
        );
    }, []);
    
    const handleDeleteChat = (sessionId: string) => {
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeChatSessionId === sessionId) {
            setActiveChatSessionId(null);
            setView('home'); // or go to history view if it's open
        }
    };
    
    const handleSelectChat = (sessionId: string) => {
        setActiveChatSessionId(sessionId);
        setView('chat');
    };

    // Render Logic
    const renderView = () => {
        const activeSession = chatSessions.find(s => s.id === activeChatSessionId);
        
        switch (view) {
            case 'home':
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
            case 'subjectOptions':
                return selectedSubject && <SubjectOptionsView subject={selectedSubject} onGenerateQuiz={handleGenerateQuiz} onGenerateExercises={handleGenerateExercises} onBack={handleBackToHome} />;
            case 'loading':
                return selectedSubject && <LoadingView subject={selectedSubject.name} task={loadingTask} />;
            case 'quiz':
                return quiz && <QuizView quiz={quiz} onSubmit={handleQuizSubmit} />;
            case 'results':
                return <ResultsView score={score} totalQuestions={quiz?.questions.length || 0} onRestart={handleBackToHome} quiz={quiz} userAnswers={quizAnswers} xpGained={lastXpGained} leveledUp={leveledUp} />;
            case 'chat':
                return activeSession ? <ChatView session={activeSession} onUpdateSession={handleUpdateSession} onBack={() => setView('home')} onNavigateHistory={() => setView('history')} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
            case 'history':
                 return <HistoryView sessions={chatSessions} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onBack={() => activeChatSessionId ? setView('chat') : setView('home')} />;
            case 'settings':
                return <SettingsView onBack={() => setView('home')} theme={theme} onThemeChange={setTheme} />;
            case 'login':
                return <LoginView onLogin={(email) => { setUser({email}); setView('home'); }} onBack={() => setView('home')} />;
            default:
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
        }
    };

    const mainContainerClasses = `bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 w-full ${view === 'home' ? 'pb-12' : ''}`;

    return (
        <div className={mainContainerClasses}>
           {renderView()}
           {view === 'home' && (
                <footer className="fixed bottom-0 left-0 w-full bg-gray-100 dark:bg-gray-900 p-2 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
                    26-1.5 (Bêta) © All rights reserved | Brevet' Easy - BrevetAI | Official Website and IA
                </footer>
           )}
        </div>
    );
};

export default App;