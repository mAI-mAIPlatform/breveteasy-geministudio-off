// Fix: Provide the implementation for the main App component.
import React, { useState, useEffect, useCallback } from 'react';
import { HomeView } from './components/HomeView';
import { SubjectOptionsView } from './components/SubjectOptionsView';
import { LoadingView } from './components/LoadingView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { ChatView } from './components/ChatView';
import { HistorySidebar } from './components/HistorySidebar';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { ExercisesView } from './components/ExercisesView';
import { SubscriptionView } from './components/SubscriptionView';
import { ImageGenerationView } from './components/ImageGenerationView';
import { ai, Type } from './services/geminiService';
import type { Subject, Quiz, ChatSession, ChatMessage, SubscriptionPlan, AiModel, ImageModel } from './types';

type View = 'home' | 'subjectOptions' | 'loading' | 'quiz' | 'results' | 'chat' | 'settings' | 'login' | 'exercises' | 'subscription' | 'imageGeneration';

interface ImageUsage {
    count: number;
    date: string; // YYYY-MM-DD
}

const HeaderButton: React.FC<{
    onClick: () => void;
    title: string;
    ariaLabel: string;
    children: React.ReactNode;
    className?: string;
    isIconOnly?: boolean;
}> = ({ onClick, title, ariaLabel, children, className = '', isIconOnly = false }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center gap-2 whitespace-nowrap bg-white/10 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold ${isIconOnly ? 'rounded-full w-11 h-11 justify-center' : 'px-4 py-2.5 rounded-full'} shadow-lg hover:bg-white/20 dark:hover:bg-slate-800/60 transform hover:scale-105 transition-all duration-300 ${className}`}
        title={title}
        aria-label={ariaLabel}
    >
        {children}
    </button>
);


const FixedHeader: React.FC<{ 
    onNavigateLogin: () => void; 
    onNavigateSettings: () => void; 
    onNavigateSubscription: () => void;
    subscriptionPlan: SubscriptionPlan;
}> = ({ onNavigateLogin, onNavigateSettings, onNavigateSubscription, subscriptionPlan }) => (
    <div className="fixed top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 z-50 flex items-center space-x-3">
       {subscriptionPlan !== 'max' && (
        <HeaderButton 
            onClick={onNavigateSubscription} 
            title="Mettre à niveau"
            ariaLabel="Mettre à niveau et voir les forfaits d'abonnement"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            <span className="hidden sm:inline">Mettre à niveau</span>
        </HeaderButton>
       )}
       <HeaderButton
        onClick={onNavigateSettings} 
        title="Paramètres"
        ariaLabel="Ouvrir les paramètres"
        isIconOnly={true}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
      </HeaderButton>
      <HeaderButton 
        onClick={onNavigateLogin} 
        title="Profil"
        ariaLabel="Ouvrir la page de profil"
        isIconOnly={true}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </HeaderButton>
    </div>
);

const FixedExitButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="fixed top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 z-50">
        <HeaderButton 
            onClick={onClick} 
            title="Retour à l'accueil"
            ariaLabel="Retourner à l'accueil"
            isIconOnly={true}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </HeaderButton>
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
    const [defaultAiModel, setDefaultAiModel] = useState<AiModel>(() => {
        const savedModel = localStorage.getItem('brevet-easy-default-ai-model');
        return (savedModel as AiModel) || 'brevetai';
    });
     const [defaultImageModel, setDefaultImageModel] = useState<ImageModel>(() => {
        const savedModel = localStorage.getItem('brevet-easy-default-image-model');
        return (savedModel as ImageModel) || 'face';
    });
    const [imageGenerationInstruction, setImageGenerationInstruction] = useState<string>(() => {
        return localStorage.getItem('brevet-easy-image-instruction') || '';
    });


    // User/Profile State
    const [user, setUser] = useState<{email: string} | null>(null);
    const [userName, setUserName] = useState<string>(() => {
        return localStorage.getItem('brevet-easy-user-name') || '';
    });
    
    // Quiz State
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>([]);
    const [score, setScore] = useState(0);

    // Exercises State
    const [generatedExercisesHtml, setGeneratedExercisesHtml] = useState<string | null>(null);
    // Fix: Add state for download status to satisfy ExercisesViewProps.
    const [isDownloadingExercises, setIsDownloadingExercises] = useState(false);

    // Chat State
    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
        const savedSessions = localStorage.getItem('chatSessions');
        return savedSessions ? JSON.parse(savedSessions) : [];
    });
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);

    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imageUsage, setImageUsage] = useState<ImageUsage>(() => {
        const savedUsage = localStorage.getItem('brevet-easy-image-usage');
        const today = new Date().toISOString().split('T')[0];
        if (savedUsage) {
            const usage: ImageUsage = JSON.parse(savedUsage);
            if (usage.date !== today) {
                return { count: 0, date: today };
            }
            return usage;
        }
        return { count: 0, date: today };
    });

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
    
    // User Name Persistence Effect
    useEffect(() => {
        localStorage.setItem('brevet-easy-user-name', userName);
    }, [userName]);
    
    // Subscription Plan Persistence Effect
    useEffect(() => {
        localStorage.setItem('brevet-easy-plan', subscriptionPlan);
    }, [subscriptionPlan]);

    // Chat Session Persistence Effect
     useEffect(() => {
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }, [chatSessions]);
    
    // Default AI Model Persistence
    useEffect(() => {
        localStorage.setItem('brevet-easy-default-ai-model', defaultAiModel);
    }, [defaultAiModel]);

    // Image Generation Settings Persistence
    useEffect(() => {
        localStorage.setItem('brevet-easy-default-image-model', defaultImageModel);
    }, [defaultImageModel]);
    
    useEffect(() => {
        localStorage.setItem('brevet-easy-image-instruction', imageGenerationInstruction);
    }, [imageGenerationInstruction]);

    // Image Usage Persistence
    useEffect(() => {
        localStorage.setItem('brevet-easy-image-usage', JSON.stringify(imageUsage));
    }, [imageUsage]);

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
        setGeneratedImage(null);
        setView('home');
    };
    
    const handleGoToSettings = () => setView('settings');
    const handleGoToLogin = () => setView('login');
    const handleGoToSubscription = () => setView('subscription');
    const handleGoToImageGeneration = () => {
        setGeneratedImage(null);
        setView('imageGeneration');
    };

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

    // AI Instruction Builder
    const buildSystemInstruction = useCallback(() => {
        let finalInstruction = aiSystemInstruction.trim();
        if (userName.trim()) {
            finalInstruction += `\nL'utilisateur s'appelle ${userName.trim()}. Adresse-toi à lui par son prénom.`;
        }
        return finalInstruction;
    }, [aiSystemInstruction, userName]);

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

            const finalSystemInstruction = buildSystemInstruction();
            if (finalSystemInstruction && subscriptionPlan !== 'free') {
                config.systemInstruction = finalSystemInstruction;
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
    }, [selectedSubject, subscriptionPlan, buildSystemInstruction]);
    
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

            const finalSystemInstruction = buildSystemInstruction();
            if (finalSystemInstruction && subscriptionPlan !== 'free') {
                config.systemInstruction = finalSystemInstruction;
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
    }, [selectedSubject, subscriptionPlan, buildSystemInstruction]);

    // Fix: Implement download state handling for ExercisesView.
    const handleDownloadExercises = () => {
        if (!generatedExercisesHtml || !selectedSubject || isDownloadingExercises) return;
        
        setIsDownloadingExercises(true);
        const blob = new Blob([generatedExercisesHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exercices-${selectedSubject.name.toLowerCase().replace(/\s/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Use a timeout to provide visual feedback, as the download is synchronous.
        setTimeout(() => setIsDownloadingExercises(false), 1000);
    };

    // Image Generation Flow Handlers
    const getImageGenerationLimit = useCallback(() => {
        if (subscriptionPlan === 'max') return Infinity;
        if (subscriptionPlan === 'pro') return 5;
        return 2; // free
    }, [subscriptionPlan]);

    const remainingGenerations = getImageGenerationLimit() - imageUsage.count;

    const handleGenerateImage = async (prompt: string, model: ImageModel) => {
        if (remainingGenerations <= 0 && subscriptionPlan !== 'max') {
            alert("Vous avez atteint votre limite de générations d'images pour aujourd'hui.");
            return;
        }

        setIsGeneratingImage(true);
        setGeneratedImage(null);
        try {
            let finalPrompt = (subscriptionPlan !== 'free' && imageGenerationInstruction.trim())
                ? `${imageGenerationInstruction.trim()}\n\n---\n\n${prompt}`
                : prompt;

            if (model === 'face-plus') {
                finalPrompt = `portrait photographique de haute qualité, ultra détaillé, photoréaliste. ${finalPrompt}`;
            }

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: finalPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                },
            });
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            setGeneratedImage(base64ImageBytes);

            const today = new Date().toISOString().split('T')[0];
            setImageUsage(prev => {
                if (prev.date !== today) {
                    return { count: 1, date: today };
                }
                return { ...prev, count: prev.count + 1 };
            });

        } catch (error) {
            console.error("Failed to generate image:", error);
            alert("Désolé, une erreur est survenue lors de la génération de l'image. Veuillez réessayer.");
        } finally {
            setIsGeneratingImage(false);
        }
    };


    // Chat Flow Handlers
    const handleStartChat = () => {
        const newSession: ChatSession = {
            id: `chat_${Date.now()}`,
            title: 'Nouvelle Discussion',
            createdAt: Date.now(),
            messages: [],
            aiModel: defaultAiModel,
        };
        setChatSessions(prev => [newSession, ...prev]);
        setActiveChatSessionId(newSession.id);
        setView('chat');
    };
    
    const handleUpdateSession = useCallback((
        sessionId: string,
        updates: Partial<Pick<ChatSession, 'messages' | 'title' | 'aiModel'>> & { messages?: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]) }
    ) => {
        setChatSessions(prevSessions =>
            prevSessions.map(session => {
                if (session.id === sessionId) {
                    const updatedMessages = updates.messages
                        ? (typeof updates.messages === 'function' ? updates.messages(session.messages) : updates.messages)
                        : session.messages;

                    return {
                        ...session,
                        ...updates,
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
        }
    };
    
    const handleSelectChat = (sessionId: string) => {
        setActiveChatSessionId(sessionId);
        setView('chat');
    };

    // Render Logic
    const renderView = () => {
        switch (view) {
            case 'home':
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} onStartImageGeneration={handleGoToImageGeneration} remainingGenerations={remainingGenerations} />;
            case 'subjectOptions':
                return selectedSubject && <SubjectOptionsView subject={selectedSubject} onGenerateQuiz={handleGenerateQuiz} onGenerateExercises={handleGenerateExercises} subscriptionPlan={subscriptionPlan} />;
            case 'loading':
                return selectedSubject && <LoadingView subject={selectedSubject.name} task={loadingTask} />;
            case 'quiz':
                return quiz && <QuizView quiz={quiz} onSubmit={handleQuizSubmit} />;
            case 'results':
                return <ResultsView score={score} totalQuestions={quiz?.questions.length || 0} onRestart={handleBackToHome} quiz={quiz} userAnswers={quizAnswers} />;
            case 'exercises':
                // Fix: Pass the isDownloading prop to ExercisesView.
                return <ExercisesView onDownload={handleDownloadExercises} isDownloading={isDownloadingExercises} />;
            case 'imageGeneration':
                return <ImageGenerationView onGenerate={handleGenerateImage} isGenerating={isGeneratingImage} generatedImage={generatedImage} remainingGenerations={remainingGenerations} defaultImageModel={defaultImageModel} />;
            case 'chat':
                const activeSession = chatSessions.find(s => s.id === activeChatSessionId);
                return activeSession ? (
                    <ChatView 
                        session={activeSession} 
                        onUpdateSession={handleUpdateSession} 
                        systemInstruction={aiSystemInstruction} 
                        subscriptionPlan={subscriptionPlan} 
                        userName={userName} 
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-center p-8">
                        <div className="flex flex-col items-center">
                            <svg className="w-24 h-24 text-slate-400 dark:text-slate-600 mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200">Bienvenue sur BrevetAI Chat</h2>
                            <p className="text-slate-700 dark:text-slate-400 mt-2">Sélectionnez une conversation dans la barre latérale ou commencez-en une nouvelle pour obtenir de l'aide.</p>
                        </div>
                    </div>
                );
            case 'settings':
                return <SettingsView 
                    theme={theme} onThemeChange={setTheme} 
                    aiSystemInstruction={aiSystemInstruction} onAiSystemInstructionChange={setAiSystemInstruction} 
                    subscriptionPlan={subscriptionPlan} 
                    userName={userName} onUserNameChange={setUserName} 
                    defaultAiModel={defaultAiModel} onDefaultAiModelChange={setDefaultAiModel}
                    defaultImageModel={defaultImageModel} onDefaultImageModelChange={setDefaultImageModel}
                    imageGenerationInstruction={imageGenerationInstruction} onImageGenerationInstructionChange={setImageGenerationInstruction}
                />;
            case 'subscription':
                return <SubscriptionView currentPlan={subscriptionPlan} onUpgrade={handleUpgradePlan} />;
            case 'login':
                return <LoginView onLogin={(email) => { setUser({email}); setView('home'); }} />;
            default:
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} onStartImageGeneration={handleGoToImageGeneration} remainingGenerations={remainingGenerations} />;
        }
    };

    return (
        <div className="relative min-h-screen font-sans flex flex-col w-full">
            {view !== 'home' && <FixedExitButton onClick={handleBackToHome} />}
            <FixedHeader onNavigateLogin={handleGoToLogin} onNavigateSettings={handleGoToSettings} onNavigateSubscription={handleGoToSubscription} subscriptionPlan={subscriptionPlan} />
            
            <div className="flex flex-1 w-full pt-20 overflow-hidden" style={{ zIndex: 1 }}>
                {view === 'chat' && (
                    <HistorySidebar
                        sessions={chatSessions}
                        activeSessionId={activeChatSessionId}
                        onSelectChat={handleSelectChat}
                        onDeleteChat={handleDeleteChat}
                        onNewChat={handleStartChat}
                        onUpdateSession={handleUpdateSession}
                    />
                )}

                <main className="flex-1 overflow-y-auto">
                    <div className={`w-full h-full flex flex-col items-center justify-center ${view === 'chat' ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
                        {renderView()}
                    </div>
                </main>
            </div>

            <footer className="w-full text-center p-4 text-xs text-slate-700 dark:text-slate-400 shrink-0" style={{ zIndex: 1 }}>
                 26-2.0 © All rights reserved | Brevet' Easy - BrevetAI | Official Website and IA
            </footer>
        </div>
    );
};

export default App;