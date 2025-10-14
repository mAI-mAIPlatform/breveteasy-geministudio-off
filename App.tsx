// Fix: Provide the implementation for the main App component.
// Fix: Corrected React import to include necessary hooks.
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { WelcomeView } from './components/WelcomeView';
import { ai, Type } from './services/geminiService';
import type { Subject, Quiz, ChatSession, ChatMessage, SubscriptionPlan, AiModel, ImageModel, Folder } from './types';

type View = 'home' | 'subjectOptions' | 'loading' | 'quiz' | 'results' | 'chat' | 'settings' | 'login' | 'exercises' | 'subscription' | 'imageGeneration';
type LoadingTask = 'quiz' | 'exercises' | 'cours' | 'fiche-revisions';

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

const FixedExitButton: React.FC<{ onClick: () => void; position?: 'fixed' | 'absolute' }> = ({ onClick, position = 'fixed' }) => (
    <div className={`${position} top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 z-50`}>
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

const ScrollToTopButton: React.FC<{ onClick: () => void; isVisible: boolean }> = ({ onClick, isVisible }) => (
    <div className={`fixed bottom-10 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <HeaderButton
            onClick={onClick}
            title="Remonter en haut"
            ariaLabel="Remonter en haut de la page"
            isIconOnly={true}
            className="transform hover:-translate-y-1"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
        </HeaderButton>
    </div>
);


const App: React.FC = () => {
    // App State
    const [view, setView] = useState<View>('home');
    const [loadingTask, setLoadingTask] = useState<LoadingTask>('quiz');
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
        return (savedModel as ImageModel) || 'faceai';
    });
    const [imageGenerationInstruction, setImageGenerationInstruction] = useState<string>(() => {
        return localStorage.getItem('brevet-easy-image-instruction') || '';
    });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const rootRef = useRef<HTMLElement | null>(null);

    // Generation default settings
    const [defaultDifficulty, setDefaultDifficulty] = useState<'Facile' | 'Normal' | 'Difficile' | 'Expert'>(() => {
        const saved = localStorage.getItem('brevet-easy-default-difficulty');
        if (saved === 'Moyen') return 'Normal';
        if (saved === 'Facile' || saved === 'Normal' || saved === 'Difficile' || saved === 'Expert') {
            return saved;
        }
        return 'Normal';
    });
    const [defaultLevel, setDefaultLevel] = useState<string>(() => {
        return localStorage.getItem('brevet-easy-default-level') || 'Brevet';
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

    // Exercises & HTML Content State
    const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
    const [isDownloadingHtml, setIsDownloadingHtml] = useState(false);

    // Chat State
    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
        const savedSessions = localStorage.getItem('chatSessions');
        return savedSessions ? JSON.parse(savedSessions) : [];
    });
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
    const [folders, setFolders] = useState<Folder[]>(() => {
        const savedFolders = localStorage.getItem('brevet-easy-folders');
        return savedFolders ? JSON.parse(savedFolders) : [];
    });


    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<{ data: string; mimeType: string; } | null>(null);
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

    // Scroll-to-top button logic
    useEffect(() => {
        rootRef.current = document.getElementById('root');
        const container = rootRef.current;
        if (!container) return;

        const handleScroll = () => {
            // Show button if scrolled more than 80% of the viewport height
            if (container.scrollTop > window.innerHeight * 0.8) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []); // Runs once on mount
    
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
    
    // Folders Persistence Effect
    useEffect(() => {
        localStorage.setItem('brevet-easy-folders', JSON.stringify(folders));
    }, [folders]);

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
    
    // Default Generation Settings Persistence
    useEffect(() => {
        localStorage.setItem('brevet-easy-default-difficulty', defaultDifficulty);
    }, [defaultDifficulty]);

    useEffect(() => {
        localStorage.setItem('brevet-easy-default-level', defaultLevel);
    }, [defaultLevel]);

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
        setGeneratedHtml(null);
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
    const handleScrollToTop = () => {
        rootRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
            const prompt = `Génère un quiz de ${count} questions sur le sujet "${selectedSubject.name}" pour le niveau ${level}, difficulté ${difficulty}. ${customPrompt}. Les questions doivent être des QCM avec 4 options de réponse. Fournis une explication pour chaque bonne réponse.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: quizSchema,
                    systemInstruction: buildSystemInstruction(),
                }
            });
            
            const generatedQuiz = JSON.parse(response.text);
            setQuiz(generatedQuiz);
            setQuizAnswers(Array(generatedQuiz.questions.length).fill(null));
            setView('quiz');

        } catch (error) {
            console.error("Error generating quiz:", error);
            alert("Une erreur est survenue lors de la génération du quiz. Veuillez réessayer.");
            handleBackToHome();
        }
    }, [selectedSubject, buildSystemInstruction]);

    const handleQuizSubmit = (answers: (string | null)[]) => {
        if (!quiz) return;
        let correctAnswers = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setQuizAnswers(answers);
        setView('results');
    };

    // Generic HTML Content Generation
    const handleGenerateHtmlContent = useCallback(async (task: LoadingTask, instructions: string) => {
        if (!selectedSubject) return;
        setView('loading');
        setLoadingTask(task);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: instructions,
                config: {
                    systemInstruction: buildSystemInstruction(),
                }
            });
            setGeneratedHtml(response.text);
            setView('exercises');
        } catch (error) {
            console.error(`Error generating ${task}:`, error);
            alert(`Une erreur est survenue lors de la génération. Veuillez réessayer.`);
            handleBackToHome();
        }
    }, [selectedSubject, buildSystemInstruction]);

    const handleGenerateExercises = (customPrompt: string, count: number, difficulty: string, level: string) => {
        const prompt = `Génère une fiche de ${count} exercices sur le sujet "${selectedSubject?.name}" pour le niveau ${level}, difficulté ${difficulty}. ${customPrompt}. La sortie doit être un fichier HTML bien formaté, incluant les énoncés numérotés, un espace pour la réponse, et un corrigé détaillé à la fin. Utilise des balises sémantiques (h1, h2, p, ul, li, etc.) et un peu de style CSS dans une balise <style> pour la lisibilité (couleurs, marges, etc.).`;
        handleGenerateHtmlContent('exercises', prompt);
    };
    
    const handleGenerateCours = (customPrompt: string, count: number, difficulty: string, level: string) => {
        const prompt = `Génère une fiche de cours sur le sujet "${selectedSubject?.name}" pour le niveau ${level}, difficulté ${difficulty}, en se concentrant sur ${count} concepts clés. ${customPrompt}. La sortie doit être un fichier HTML bien formaté, avec un titre principal, des sections pour chaque concept (h2), des définitions claires (p), des exemples (ul/li ou blockquojte), et un résumé. Utilise des balises sémantiques et du CSS dans une balise <style> pour rendre le cours visuellement agréable et facile à lire (couleurs, typographie, espacements).`;
        handleGenerateHtmlContent('cours', prompt);
    };
    
    const handleGenerateFicheRevisions = (customPrompt: string, count: number, difficulty: string, level: string) => {
        const prompt = `Génère une fiche de révisions synthétique sur le sujet "${selectedSubject?.name}" pour le niveau ${level}. ${customPrompt}. La fiche doit résumer les points essentiels à connaître pour le brevet. La sortie doit être un fichier HTML bien formaté, utilisant des titres, des listes à puces, du gras pour les termes importants, et un code couleur simple pour mettre en évidence les différentes sections. Le contenu doit être concis et aller à l'essentiel.`;
        handleGenerateHtmlContent('fiche-revisions', prompt);
    };

    const handleDownloadHtml = () => {
        if (!generatedHtml || isDownloadingHtml) return;
        setIsDownloadingHtml(true);
        try {
            const blob = new Blob([generatedHtml], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${loadingTask}_${selectedSubject?.name.replace(' ', '_')}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading HTML:", error);
            alert("Le téléchargement a échoué.");
        } finally {
            setIsDownloadingHtml(false);
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
    
    const handleNewChat = () => {
        setActiveChatSessionId(null);
        setTimeout(handleStartChat, 0); // Create after deselecting to ensure a fresh start
    };

    const handleSelectChat = (sessionId: string) => {
        setActiveChatSessionId(sessionId);
        setView('chat');
    };

    const handleDeleteChat = (sessionId: string) => {
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeChatSessionId === sessionId) {
            setActiveChatSessionId(null);
            // Optional: select the most recent chat after deletion
            const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
            if(remainingSessions.length > 0) {
                 const sorted = [...remainingSessions].sort((a,b) => b.createdAt - a.createdAt);
                 setActiveChatSessionId(sorted[0].id);
            }
        }
    };
    
    const handleUpdateSession = (sessionId: string, updates: Partial<ChatSession>) => {
        setChatSessions(prev =>
            prev.map(s => (s.id === sessionId ? { ...s, ...updates } : s))
        );
    };

    const handleDownloadChat = (sessionId: string) => {
        const session = chatSessions.find(s => s.id === sessionId);
        if (!session) return;
    
        const sanitizedTitle = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `brevetai_discussion_${sanitizedTitle || 'sans_titre'}.txt`;
    
        let content = `Titre: ${session.title}\n`;
        content += `Date: ${new Date(session.createdAt).toLocaleString('fr-FR')}\n`;
        content += `Modèle: ${session.aiModel}\n`;
        content += '------------------------------------\n\n';
    
        session.messages.forEach(message => {
            const role = message.role === 'user' ? 'Utilisateur' : 'BrevetAI';
            const textParts = message.parts.map(p => p.text).filter(Boolean).join('\n');
            if (textParts) {
                content += `${role}:\n${textParts}\n\n`;
            }
        });
    
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Folder Handlers
    const handleNewFolder = (name: string) => {
        const newFolder: Folder = {
            id: `folder_${Date.now()}`,
            name,
            createdAt: Date.now(),
        };
        setFolders(prev => [newFolder, ...prev]);
    };
    
    const handleDeleteFolder = (folderId: string) => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        // Un-assign sessions from the deleted folder
        setChatSessions(prev => prev.map(s => s.folderId === folderId ? {...s, folderId: null} : s));
    };

    const handleUpdateFolder = (folderId: string, updates: Partial<Folder>) => {
        setFolders(prev =>
            prev.map(f => (f.id === folderId ? { ...f, ...updates } : f))
        );
    };

    // Image Generation Handlers
    const handleGenerateImage = useCallback(async (prompt: string, model: ImageModel, style: string, format: 'jpeg' | 'png', aspectRatio: string, negativePrompt: string) => {
        const generationLimit = subscriptionPlan === 'free' ? 2 : subscriptionPlan === 'pro' ? 5 : Infinity;
        if (imageUsage.count >= generationLimit) {
            alert("Vous avez atteint votre limite de générations d'images pour aujourd'hui.");
            return;
        }

        setIsGeneratingImage(true);
        setGeneratedImage(null);
        
        // Amélioration de la compréhension du prompt
        const qualityPrompt = model === 'faceai-plus' && (subscriptionPlan === 'pro' || subscriptionPlan === 'max')
            ? 'haute qualité, 4k, hyper-détaillé, photoréaliste'
            : '';

        const stylePrompt = style !== 'none' ? `style ${style.replace('-', ' ')}` : '';
        const userInstruction = imageGenerationInstruction.trim();

        // Construction d'un prompt plus structuré
        const finalPrompt = [
            prompt,
            stylePrompt,
            qualityPrompt,
            userInstruction
        ].filter(Boolean).join(', ');

        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: finalPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: `image/${format}`,
                    aspectRatio: aspectRatio,
                    ...(negativePrompt.trim() && { negativePrompt: negativePrompt.trim() }),
                },
            });
            
            const imageBytes = response.generatedImages[0].image.imageBytes;
            setGeneratedImage({ data: imageBytes, mimeType: `image/${format}`});
            setImageUsage(prev => ({ ...prev, count: prev.count + 1 }));

        } catch (error) {
            console.error("Error generating image:", error);
            alert("Une erreur est survenue lors de la génération de l'image.");
        } finally {
            setIsGeneratingImage(false);
        }
    }, [imageUsage, subscriptionPlan, imageGenerationInstruction]);
    

    const activeSession = chatSessions.find(s => s.id === activeChatSessionId);
    
    const remainingImageGenerations = () => {
        if (subscriptionPlan === 'max') return Infinity;
        const limit = subscriptionPlan === 'pro' ? 5 : 2;
        return Math.max(0, limit - imageUsage.count);
    };

    const renderContent = () => {
        switch (view) {
            case 'home':
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={() => setView('chat')} onStartImageGeneration={handleGoToImageGeneration} remainingGenerations={remainingImageGenerations()} />;
            case 'subjectOptions':
                return selectedSubject && <SubjectOptionsView subject={selectedSubject} onGenerateQuiz={handleGenerateQuiz} onGenerateExercises={handleGenerateExercises} onGenerateCours={handleGenerateCours} onGenerateFicheRevisions={handleGenerateFicheRevisions} subscriptionPlan={subscriptionPlan} defaultDifficulty={defaultDifficulty} defaultLevel={defaultLevel} />;
            case 'loading':
                return <LoadingView subject={selectedSubject?.name || ''} task={loadingTask} />;
            case 'quiz':
                return quiz && <QuizView quiz={quiz} onSubmit={handleQuizSubmit} />;
            case 'results':
                return <ResultsView score={score} totalQuestions={quiz?.questions.length || 0} onRestart={handleBackToHome} quiz={quiz} userAnswers={quizAnswers} />;
            case 'exercises':
                const titleMap = {
                    exercises: "Fiche d'exercices prête !",
                    cours: "Fiche de cours prête !",
                    'fiche-revisions': "Fiche de révisions prête !",
                };
                return <ExercisesView 
                            onDownload={handleDownloadHtml}
                            title={titleMap[loadingTask] || "Contenu prêt !"}
                            description={`Votre document sur ${selectedSubject?.name} a été généré avec succès.`}
                            buttonText={`Télécharger le .html`}
                        />;
            case 'chat':
                if (activeSession) {
                    return <ChatView session={activeSession} onUpdateSession={handleUpdateSession} systemInstruction={buildSystemInstruction()} subscriptionPlan={subscriptionPlan} userName={userName}/>
                }
                return <WelcomeView />;
            case 'settings':
                return <SettingsView 
                    theme={theme} 
                    onThemeChange={setTheme} 
                    aiSystemInstruction={aiSystemInstruction}
                    onAiSystemInstructionChange={setAiSystemInstruction}
                    subscriptionPlan={subscriptionPlan}
                    userName={userName}
                    onUserNameChange={setUserName}
                    defaultAiModel={defaultAiModel}
                    onDefaultAiModelChange={setDefaultAiModel}
                    defaultImageModel={defaultImageModel}
                    onDefaultImageModelChange={setDefaultImageModel}
                    imageGenerationInstruction={imageGenerationInstruction}
                    onImageGenerationInstructionChange={setImageGenerationInstruction}
                    defaultDifficulty={defaultDifficulty}
                    onDefaultDifficultyChange={setDefaultDifficulty}
                    defaultLevel={defaultLevel}
                    onDefaultLevelChange={setDefaultLevel}
                />;
            case 'login':
                return <LoginView onLogin={(email) => setUser({ email })} />;
            case 'subscription':
                return <SubscriptionView currentPlan={subscriptionPlan} onUpgrade={handleUpgradePlan} />;
            case 'imageGeneration':
                 return <ImageGenerationView
                    onGenerate={handleGenerateImage}
                    isGenerating={isGeneratingImage}
                    generatedImage={generatedImage}
                    remainingGenerations={remainingImageGenerations()}
                    defaultImageModel={defaultImageModel}
                    subscriptionPlan={subscriptionPlan}
                />;
            default:
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={() => setView('chat')} onStartImageGeneration={handleGoToImageGeneration} remainingGenerations={remainingImageGenerations()}/>;
        }
    };
    
    // Main Render
    return (
        <div className="min-h-screen w-screen flex flex-col">
            <div className="flex-grow flex">
                {view === 'chat' ? (
                    <>
                        <HistorySidebar 
                            sessions={chatSessions} 
                            folders={folders}
                            activeSessionId={activeChatSessionId} 
                            onSelectChat={handleSelectChat} 
                            onDeleteChat={handleDeleteChat}
                            onDownloadChat={handleDownloadChat}
                            onNewChat={handleNewChat}
                            onUpdateSession={handleUpdateSession}
                            onNewFolder={handleNewFolder}
                            onDeleteFolder={handleDeleteFolder}
                            onUpdateFolder={handleUpdateFolder}
                            onExitChat={handleBackToHome}
                        />
                        <div className="flex-grow flex flex-col h-full relative">
                            {renderContent()}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow w-full">
                        {view !== 'home' && <FixedExitButton onClick={handleBackToHome} />}
                        <FixedHeader onNavigateLogin={handleGoToLogin} onNavigateSettings={handleGoToSettings} onNavigateSubscription={handleGoToSubscription} subscriptionPlan={subscriptionPlan}/>
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                           {renderContent()}
                        </div>
                    </div>
                )}
            </div>
            <ScrollToTopButton onClick={handleScrollToTop} isVisible={showScrollTop && view !== 'chat'} />
            <footer className="flex justify-center items-center gap-4 text-center py-2 px-4 text-xs text-slate-500 dark:text-slate-400 border-t border-white/10 dark:border-slate-800 shrink-0">
                <span>26-3.0 © All rights reserved | Brevet' Easy - BrevetAI/FaceAI | Official Website and IA</span>
            </footer>
        </div>
    );
};

export default App;