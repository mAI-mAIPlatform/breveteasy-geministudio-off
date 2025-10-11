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
import { ExercisesView } from './components/ExercisesView';
import { SubscriptionView } from './components/SubscriptionView';
import { ai, Type } from './services/geminiService';
import type { Subject, Quiz, ChatSession, ChatMessage, SubscriptionPlan } from './types';

type View = 'home' | 'subjectOptions' | 'loading' | 'quiz' | 'results' | 'chat' | 'history' | 'settings' | 'login' | 'exercises' | 'subscription';

const FixedHeader: React.FC<{ onNavigateLogin: () => void; onNavigateSettings: () => void; onNavigateSubscription: () => void; }> = ({ onNavigateLogin, onNavigateSettings, onNavigateSubscription }) => (
    <div className="fixed top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 z-50 flex items-center space-x-3">
       <button 
        onClick={onNavigateSubscription} 
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 shadow-lg hover:bg-white/20 dark:hover:bg-slate-800/60 transform hover:scale-110 transition-all duration-300"
        title="Forfaits"
        aria-label="Voir les forfaits d'abonnement"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
      </button>
       <button 
        onClick={onNavigateSettings} 
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 shadow-lg hover:bg-white/20 dark:hover:bg-slate-800/60 transform hover:scale-110 transition-all duration-300"
        title="Paramètres"
        aria-label="Ouvrir les paramètres"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <button 
        onClick={onNavigateLogin} 
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 shadow-lg hover:bg-white/20 dark:hover:bg-slate-800/60 transform hover:scale-110 transition-all duration-300"
        title="Profil"
        aria-label="Ouvrir la page de profil"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </button>
    </div>
);

const App: React.FC = () => {
    // App State
    const [view, setView] = useState<View>('home');
    const [loadingTask, setLoadingTask] = useState<'quiz' | 'exercises'>('quiz');
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
        const savedTheme = localStorage.getItem('brevet-easy-theme');
        return (savedTheme as any) || 'system';
    });
    const [aiSystemInstruction, setAiSystemInstruction] = useState<string>(() => {
        return localStorage.getItem('brevet-easy-ai-instruction') || '';
    });
    const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(() => {
        const savedPlan = localStorage.getItem('brevet-easy-plan');
        return (savedPlan as SubscriptionPlan) || 'free';
    });

    // User/Profile State
    const [user, setUser] = useState<{email: string} | null>(null);
    
    // Quiz State
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>([]);
    const [score, setScore] = useState(0);

    // Exercises State
    const [generatedExercisesHtml, setGeneratedExercisesHtml] = useState<string | null>(null);

    // Chat State
    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
        const savedSessions = localStorage.getItem('chatSessions');
        return savedSessions ? JSON.parse(savedSessions) : [];
    });
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);

    // Theme Management Effect
    useEffect(() => {
        localStorage.setItem('brevet-easy-theme', theme);
        if (theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', systemPrefersDark);
            
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = (e: MediaQueryListEvent) => {
                 document.documentElement.classList.toggle('dark', e.matches);
            }
            mql.addEventListener('change', listener);
            return () => mql.removeEventListener('change', listener);

        } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }, [theme]);
    
    // AI Instruction Persistence Effect
    useEffect(() => {
        localStorage.setItem('brevet-easy-ai-instruction', aiSystemInstruction);
    }, [aiSystemInstruction]);
    
    // Subscription Plan Persistence Effect
    useEffect(() => {
        localStorage.setItem('brevet-easy-plan', subscriptionPlan);
    }, [subscriptionPlan]);

    // Chat Session Persistence Effect
     useEffect(() => {
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }, [chatSessions]);

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
        setGeneratedExercisesHtml(null);
        setView('home');
    };
    
    const handleGoToSettings = () => setView('settings');
    const handleGoToLogin = () => setView('login');
    const handleGoToSubscription = () => setView('subscription');

    // Subscription Handler
    const handleUpgradePlan = (code: string) => {
        const upperCaseCode = code.toUpperCase();
        if (upperCaseCode === 'BVTPRO') {
            setSubscriptionPlan('pro');
            alert('Félicitations ! Vous avez activé le forfait Brevet Pro.');
            return true;
        }
        if (upperCaseCode === 'BVTMAX') {
            setSubscriptionPlan('max');
            alert('Félicitations ! Vous avez activé le forfait Brevet Max.');
            return true;
        }
        alert('Code invalide. Veuillez réessayer.');
        return false;
    };


    // Quiz Flow Handlers
    const handleGenerateQuiz = useCallback(async (customPrompt: string, count: number, difficulty: string, level: string) => {
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
            let prompt = `Génère un quiz de ${count} questions à choix multiples sur le sujet "${selectedSubject.name}" avec un niveau de difficulté "${difficulty}" pour un élève de niveau "${level}" en France. Si le niveau est "Brevet", considère que c'est un élève de fin de 3ème qui révise pour l'examen national. Chaque question doit avoir 4 options de réponse. Fournis une explication pour chaque bonne réponse. Assure-toi que la correctAnswer est l'une des chaînes de caractères dans options.`;
            
            if (customPrompt.trim()) {
                prompt += `\n\nInstructions supplémentaires de l'utilisateur : focalise le quiz sur les points suivants : "${customPrompt.trim()}".`;
            }

            const config: {
                responseMimeType: string;
                responseSchema: any;
                systemInstruction?: string;
            } = {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            };

            if (aiSystemInstruction.trim() && subscriptionPlan !== 'free') {
                config.systemInstruction = aiSystemInstruction.trim();
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config,
            });
            
            const quizData = JSON.parse(response.text);
            setQuiz(quizData);
            setView('quiz');
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            alert("Désolé, une erreur est survenue lors de la génération du quiz. Veuillez réessayer.");
            handleBackToHome();
        }
    }, [selectedSubject, aiSystemInstruction, subscriptionPlan]);
    
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
        setView('results');
    };

    // Exercises Flow Handlers
    const handleGenerateExercises = useCallback(async (customPrompt: string, count: number, difficulty: string, level: string) => {
        if (!selectedSubject) return;
        setView('loading');
        setLoadingTask('exercises');
        try {
            let prompt = `Crée une fiche d'exercices complète et bien structurée sur le thème "${selectedSubject.name}" avec un niveau de difficulté "${difficulty}" pour un élève de niveau "${level}" en France. Si le niveau est "Brevet", considère que c'est un élève de fin de 3ème qui révise pour l'examen national. La réponse DOIT être un document HTML complet et autonome (self-contained).
- Inclus une balise <!DOCTYPE html>, <html>, <head>, et <body>.
- Dans le <head>, inclus un <title> pertinent et un lien vers la police "Poppins" de Google Fonts.
- Inclus aussi une balise <style> avec du CSS pour une présentation claire, professionnelle et lisible. Utilise la police 'Poppins', sans-serif. Style les titres (h1, h2, h3), les paragraphes, et crée des classes pour les sections d'exercices et les sections de corrigés. Le corrigé doit être clairement séparé et facile à identifier. Ajoute un style sobre pour le mode sombre (dark mode).
- Le <body> doit contenir un titre principal (h1) et ${count} exercices variés avec des énoncés clairs (utilise des h2 pour chaque exercice).
- Fournis un corrigé détaillé pour chaque exercice dans une section séparée à la fin du document (commençant par un h1 "Corrigé").
- La structure doit être sémantique (utilise des balises comme <section>, <article>, etc.).`;

            if (customPrompt.trim()) {
                prompt += `\n\nInstructions supplémentaires de l'utilisateur : base les exercices sur les points suivants : "${customPrompt.trim()}".`;
            }
            
            const config: { systemInstruction?: string } = {};

            if (aiSystemInstruction.trim() && subscriptionPlan !== 'free') {
                config.systemInstruction = aiSystemInstruction.trim();
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config,
            });

            const generatedHtml = response.text;
            if (!generatedHtml || !generatedHtml.toLowerCase().includes('</html>')) {
                throw new Error("Le contenu généré n'est pas un document HTML valide.");
            }
            
            setGeneratedExercisesHtml(generatedHtml);
            setView('exercises');

        } catch (error) {
            console.error("Failed to generate exercises:", error);
            alert("Désolé, une erreur est survenue lors de la génération des exercices. Veuillez réessayer.");
            handleBackToHome();
        }
    }, [selectedSubject, aiSystemInstruction, subscriptionPlan]);

    const handleDownloadExercises = () => {
        if (!generatedExercisesHtml || !selectedSubject) return;
        
        const blob = new Blob([generatedExercisesHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exercices-${selectedSubject.name.toLowerCase().replace(/\s/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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
                return selectedSubject && <SubjectOptionsView subject={selectedSubject} onGenerateQuiz={handleGenerateQuiz} onGenerateExercises={handleGenerateExercises} onBack={handleBackToHome} subscriptionPlan={subscriptionPlan} />;
            case 'loading':
                return selectedSubject && <LoadingView subject={selectedSubject.name} task={loadingTask} />;
            case 'quiz':
                return quiz && <QuizView quiz={quiz} onSubmit={handleQuizSubmit} />;
            case 'results':
                return <ResultsView score={score} totalQuestions={quiz?.questions.length || 0} onRestart={handleBackToHome} quiz={quiz} userAnswers={quizAnswers} />;
            case 'exercises':
                return <ExercisesView onDownload={handleDownloadExercises} onBack={handleBackToHome} isDownloading={false} />;
            case 'chat':
                return activeSession ? <ChatView session={activeSession} onUpdateSession={handleUpdateSession} onBack={() => setView('home')} onNavigateHistory={() => setView('history')} systemInstruction={aiSystemInstruction} subscriptionPlan={subscriptionPlan} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
            case 'history':
                 return <HistoryView sessions={chatSessions} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onBack={() => activeChatSessionId ? setView('chat') : setView('home')} />;
            case 'settings':
                return <SettingsView onBack={() => setView('home')} theme={theme} onThemeChange={setTheme} aiSystemInstruction={aiSystemInstruction} onAiSystemInstructionChange={setAiSystemInstruction} subscriptionPlan={subscriptionPlan} />;
            case 'subscription':
                return <SubscriptionView onBack={() => setView('home')} currentPlan={subscriptionPlan} onUpgrade={handleUpgradePlan} />;
            case 'login':
                return <LoginView onLogin={(email) => { setUser({email}); setView('home'); }} onBack={() => setView('home')} />;
            default:
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
        }
    };

    const mainContainerClasses = `min-h-screen font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 w-full pt-24 pb-16`;

    return (
        <div className={mainContainerClasses}>
           <FixedHeader onNavigateLogin={handleGoToLogin} onNavigateSettings={handleGoToSettings} onNavigateSubscription={handleGoToSubscription} />
           {renderView()}
           <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto bg-black/10 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 px-4 py-2 rounded-full text-center text-xs text-slate-700 dark:text-slate-400 shadow-lg z-50">
                26-1.8 © All rights reserved | Brevet' Easy - BrevetAI | Official Website and IA
           </footer>
        </div>
    );
};

export default App;