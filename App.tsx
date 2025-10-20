// Fix: Provide the implementation for the main App component.
// Fix: Corrected React import to include necessary hooks.
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { CanvasView } from './components/CanvasView';
import { FlashAIView } from './components/FlashAIView';
import { PlanningView } from './components/PlanningView';
import { ConseilsView } from './components/ConseilsView';
import { DrawingView } from './components/DrawingView';
import { JeuxView } from './components/JeuxView';
import { JeuxDetailView } from './components/JeuxDetailView';
import { GameDisplayView } from './components/GameDisplayView';
import { generateQuiz, generateHtmlContent, generateImage, generateInteractivePage, generateFlashQuestion, generatePlanning, generateConseils, generateGame } from './services/geminiService';
import { AVATAR_ICONS, SUBJECTS } from './constants';
import type { Subject, Quiz, ChatSession, ChatMessage, SubscriptionPlan, AiModel, ImageModel, Folder, CustomAiModel, CanvasVersion, CanvasModel, Question, Planning, FlashAiModel, PlanningAiModel, ConseilsAiModel, ChatPart, PremadeGame, GamesAiModel, PlanningDay } from './types';
import { useLocalization } from './hooks/useLocalization';


// Confetti and success message components
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  endX: number;
  endY: number;
}

const Confetti: React.FC<{ particles: ConfettiParticle[] }> = ({ particles }) => (
  <div className="fixed inset-0 pointer-events-none z-[9999]">
    {particles.map(p => (
      <div
        key={p.id}
        className="confetti"
        style={{
          left: `${p.x}px`,
          top: `${p.y}px`,
          backgroundColor: p.color,
          // @ts-ignore
          '--x-end': `${p.endX}px`,
          '--y-end': `${p.endY}px`,
        }}
      />
    ))}
  </div>
);

const GeneralNotification: React.FC<{ message: string, type: 'success' | 'error' }> = ({ message, type }) => {
    const icon = {
        success: <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        error: <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    };

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white/30 dark:bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-center animate-fade-in">
             <div className="flex justify-center mb-4">{icon[type]}</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{message}</h2>
        </div>
    );
};


// Fix: Add new view types for the new features.
type View = 'home' | 'subjectOptions' | 'loading' | 'quiz' | 'results' | 'chat' | 'settings' | 'login' | 'exercises' | 'subscription' | 'imageGeneration' | 'canvas' | 'flashAI' | 'planning' | 'conseils' | 'drawing' | 'jeux' | 'jeuxDetail' | 'gameDisplay';
// Fix: Add new loading task types for the new features.
type LoadingTask = 'quiz' | 'exercises' | 'cours' | 'fiche-revisions' | 'canvas' | 'flashAI' | 'planning' | 'conseils' | 'game' | 'gamesAI';

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
    onNavigateSettings: () => void; 
    onNavigateSubscription: () => void;
    subscriptionPlan: SubscriptionPlan;
    userAvatar: string;
    userName: string;
}> = ({ onNavigateSettings, onNavigateSubscription, subscriptionPlan, userAvatar, userName }) => {
    const { t } = useLocalization();
    const hasName = userName.trim().length > 0;
    
    return (
        <div className="fixed top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 z-[100] flex items-center space-x-3">
           {subscriptionPlan !== 'max' && (
            <HeaderButton 
                onClick={onNavigateSubscription} 
                title={t('header_upgrade')}
                ariaLabel={t('header_upgrade_aria')}
                isIconOnly={true}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </HeaderButton>
           )}
           <HeaderButton
            onClick={onNavigateSettings} 
            title={t('header_settings_title')}
            ariaLabel={t('header_settings_aria')}
            isIconOnly={true}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
          </HeaderButton>
          <HeaderButton 
            onClick={onNavigateSettings} 
            title={t('header_profile_title')}
            ariaLabel={t('header_profile_aria')}
            isIconOnly={!hasName}
          >
            {React.cloneElement(AVATAR_ICONS[userAvatar] || AVATAR_ICONS['user'], { className: 'h-5 w-5' })}
            {hasName && <span className="hidden sm:inline">{userName}</span>}
          </HeaderButton>
        </div>
    );
};

const ScrollToTopButton: React.FC<{ onClick: () => void; isVisible: boolean }> = ({ onClick, isVisible }) => {
    const { t } = useLocalization();
    return (
        <div className={`fixed bottom-10 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 z-[100] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <HeaderButton
                onClick={onClick}
                title={t('header_scroll_top')}
                ariaLabel={t('header_scroll_top')}
                isIconOnly={true}
                className="transform hover:-translate-y-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
            </HeaderButton>
        </div>
    );
};


const App: React.FC = () => {
    const { t } = useLocalization();
    // App State
    const [view, setView] = useState<View>('home');
    const [viewHistory, setViewHistory] = useState<View[]>([]);
    const [loadingTask, setLoadingTask] = useState<LoadingTask>('quiz');
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [aiSystemInstruction, setAiSystemInstruction] = useState<string>('');
    const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('free');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const rootRef = useRef<HTMLElement | null>(null);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
    const [isQuizTimed, setIsQuizTimed] = useState(false);
    const [isAppLoading, setIsAppLoading] = useState(true);

    // Generation default settings
    const [defaultItemCount, setDefaultItemCount] = useState<number>(5);
    const [defaultDifficulty, setDefaultDifficulty] = useState<'Facile' | 'Normal' | 'Difficile' | 'Expert'>('Normal');
    const [defaultLevel, setDefaultLevel] = useState<string>('Brevet');
    
    // Default Models & Instructions
    const [defaultAiModel, setDefaultAiModel] = useState<AiModel>('brevetai');
    const [defaultImageModel, setDefaultImageModel] = useState<ImageModel>('faceai');
    const [imageGenerationInstruction, setImageGenerationInstruction] = useState<string>('');
    const [defaultCanvasModel, setDefaultCanvasModel] = useState<CanvasModel>('canvasai');
    const [canvasSystemInstruction, setCanvasSystemInstruction] = useState<string>('');
    const [defaultFlashAiModel, setDefaultFlashAiModel] = useState<FlashAiModel>('flashai');
    const [flashAiSystemInstruction, setFlashAiSystemInstruction] = useState<string>('');
    const [defaultPlanningAiModel, setDefaultPlanningAiModel] = useState<PlanningAiModel>('planningai');
    const [planningAiSystemInstruction, setPlanningAiSystemInstruction] = useState<string>('');
    const [defaultConseilsAiModel, setDefaultConseilsAiModel] = useState<ConseilsAiModel>('conseilsai');
    const [conseilsAiSystemInstruction, setConseilsAiSystemInstruction] = useState<string>('');
    const [defaultGamesAiModel, setDefaultGamesAiModel] = useState<GamesAiModel>('gamesai');
    const [gamesAiSystemInstruction, setGamesAiSystemInstruction] = useState<string>('');


    // User/Profile State
    const [user, setUser] = useState<{email: string} | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [userAvatar, setUserAvatar] = useState<string>('user');
    
    // Quiz State
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>([]);
    const [score, setScore] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Exercises & HTML Content State
    const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
    const [isDownloadingHtml, setIsDownloadingHtml] = useState(false);

    // Chat State
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [customAiModels, setCustomAiModels] = useState<CustomAiModel[]>([]);


    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<{ data: string; mimeType: string; } | null>(null);
    const [imageUsage, setImageUsage] = useState<ImageUsage>({ count: 0, date: new Date().toISOString().split('T')[0] });

    // Canvas State
    const [canvasVersions, setCanvasVersions] = useState<CanvasVersion[]>([]);
    const [activeCanvasVersionId, setActiveCanvasVersionId] = useState<string | null>(null);
    const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);

    // FlashAI State
    const [flashQuestion, setFlashQuestion] = useState<Question | null>(null);
    const [isGeneratingFlashQuestion, setIsGeneratingFlashQuestion] = useState(false);
    
    // Planning State
    const [planning, setPlanning] = useState<Planning | null>(null);
    const [isGeneratingPlanning, setIsGeneratingPlanning] = useState(false);

    // Conseils State
    const [conseils, setConseils] = useState<string | null>(null);
    const [isGeneratingConseils, setIsGeneratingConseils] = useState(false);

    // Jeux State
    const [selectedGameSubject, setSelectedGameSubject] = useState<Subject | null>(null);
    const [gameHtml, setGameHtml] = useState<string | null>(null);

    const navigate = useCallback((newView: View) => {
        rootRef.current?.scrollTo({ top: 0, behavior: 'auto' });
        setView(currentView => {
            if (currentView !== newView) {
                // Don't add to history if going back to home, as it's the base
                if (currentView !== 'home') {
                     setViewHistory(h => [...h, currentView]);
                }
            }
            return newView;
        });
    }, []);

    // Load state from localStorage on initial mount
    useEffect(() => {
        const savedUser = localStorage.getItem('brevet-easy-user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setView('home'); 
        } else {
            const guestUser = localStorage.getItem('brevet-easy-guest');
            if (guestUser) {
              setUser(JSON.parse(guestUser));
              setView('home');
            } else {
              setView('login');
            }
        }
        setIsAppLoading(false);

        setTheme((localStorage.getItem('brevet-easy-theme') as any) || 'system');
        setSubscriptionPlan((localStorage.getItem('brevet-easy-plan') as SubscriptionPlan) || 'free');
        setUserName(localStorage.getItem('brevet-easy-user-name') || '');
        setUserAvatar(localStorage.getItem('brevet-easy-user-avatar') || 'user');

        // Generation settings
        const loadedCount = parseInt(localStorage.getItem('brevet-easy-default-item-count') || '5', 10);
        setDefaultItemCount(Math.max(1, Math.min(10, loadedCount)));
        const savedDifficulty = localStorage.getItem('brevet-easy-default-difficulty');
        setDefaultDifficulty((savedDifficulty === 'Facile' || savedDifficulty === 'Normal' || savedDifficulty === 'Difficile' || savedDifficulty === 'Expert' ? savedDifficulty : 'Normal'));
        setDefaultLevel(localStorage.getItem('brevet-easy-default-level') || 'Brevet');
        
        // AI Models & Instructions
        setAiSystemInstruction(localStorage.getItem('brevet-easy-ai-instruction') || '');
        setDefaultAiModel((localStorage.getItem('brevet-easy-default-ai-model') as AiModel) || 'brevetai');
        setImageGenerationInstruction(localStorage.getItem('brevet-easy-image-instruction') || '');
        setDefaultImageModel((localStorage.getItem('brevet-easy-default-image-model') as ImageModel) || 'faceai');
        setCanvasSystemInstruction(localStorage.getItem('brevet-easy-canvas-instruction') || '');
        setDefaultCanvasModel((localStorage.getItem('brevet-easy-default-canvas-model') as CanvasModel) || 'canvasai');
        setFlashAiSystemInstruction(localStorage.getItem('brevet-easy-flashai-instruction') || '');
        setDefaultFlashAiModel((localStorage.getItem('brevet-easy-default-flashai-model') as FlashAiModel) || 'flashai');
        setPlanningAiSystemInstruction(localStorage.getItem('brevet-easy-planningai-instruction') || '');
        setDefaultPlanningAiModel((localStorage.getItem('brevet-easy-default-planningai-model') as PlanningAiModel) || 'planningai');
        setConseilsAiSystemInstruction(localStorage.getItem('brevet-easy-conseilsai-instruction') || '');
        setDefaultConseilsAiModel((localStorage.getItem('brevet-easy-default-conseilsai-model') as ConseilsAiModel) || 'conseilsai');
        setGamesAiSystemInstruction(localStorage.getItem('brevet-easy-gamesai-instruction') || '');
        setDefaultGamesAiModel((localStorage.getItem('brevet-easy-default-gamesai-model') as GamesAiModel) || 'gamesai');


        const savedSessions = localStorage.getItem('chatSessions');
        setChatSessions(savedSessions ? JSON.parse(savedSessions) : []);
        const savedCanvasVersions = localStorage.getItem('canvasVersions');
        setCanvasVersions(savedCanvasVersions ? JSON.parse(savedCanvasVersions) : []);
        const savedPlanning = localStorage.getItem('brevet-easy-planning');
        if (savedPlanning) { setPlanning(JSON.parse(savedPlanning)); }
        
        const savedFolders = localStorage.getItem('brevet-easy-folders');
        setFolders(savedFolders ? JSON.parse(savedFolders) : []);
        
        const savedCustomModels = localStorage.getItem('brevet-easy-custom-models');
        setCustomAiModels(savedCustomModels ? JSON.parse(savedCustomModels) : []);

        const savedUsage = localStorage.getItem('brevet-easy-image-usage');
        const today = new Date().toISOString().split('T')[0];
        if (savedUsage) {
            const usage: ImageUsage = JSON.parse(savedUsage);
            if (usage.date !== today) {
                setImageUsage({ count: 0, date: today });
            } else {
                setImageUsage(usage);
            }
        } else {
            setImageUsage({ count: 0, date: today });
        }

    }, []);


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
            if (container.scrollTop > 200) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Persistence effects for all settings
    useEffect(() => { localStorage.setItem('brevet-easy-ai-instruction', aiSystemInstruction); }, [aiSystemInstruction]);
    useEffect(() => { localStorage.setItem('brevet-easy-user-name', userName); }, [userName]);
    useEffect(() => { localStorage.setItem('brevet-easy-user-avatar', userAvatar); }, [userAvatar]);
    useEffect(() => { localStorage.setItem('brevet-easy-plan', subscriptionPlan); }, [subscriptionPlan]);
    useEffect(() => { localStorage.setItem('chatSessions', JSON.stringify(chatSessions)); }, [chatSessions]);
    useEffect(() => { localStorage.setItem('brevet-easy-folders', JSON.stringify(folders)); }, [folders]);
    useEffect(() => { localStorage.setItem('brevet-easy-custom-models', JSON.stringify(customAiModels)); }, [customAiModels]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-ai-model', defaultAiModel); }, [defaultAiModel]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-image-model', defaultImageModel); }, [defaultImageModel]);
    useEffect(() => { localStorage.setItem('brevet-easy-image-instruction', imageGenerationInstruction); }, [imageGenerationInstruction]);
    useEffect(() => { localStorage.setItem('brevet-easy-image-usage', JSON.stringify(imageUsage)); }, [imageUsage]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-item-count', String(defaultItemCount)); }, [defaultItemCount]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-difficulty', defaultDifficulty); }, [defaultDifficulty]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-level', defaultLevel); }, [defaultLevel]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-canvas-model', defaultCanvasModel); }, [defaultCanvasModel]);
    useEffect(() => { localStorage.setItem('brevet-easy-canvas-instruction', canvasSystemInstruction); }, [canvasSystemInstruction]);
    useEffect(() => { localStorage.setItem('canvasVersions', JSON.stringify(canvasVersions)); }, [canvasVersions]);
    useEffect(() => { if (planning) localStorage.setItem('brevet-easy-planning', JSON.stringify(planning)); }, [planning]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-flashai-model', defaultFlashAiModel); }, [defaultFlashAiModel]);
    useEffect(() => { localStorage.setItem('brevet-easy-flashai-instruction', flashAiSystemInstruction); }, [flashAiSystemInstruction]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-planningai-model', defaultPlanningAiModel); }, [defaultPlanningAiModel]);
    useEffect(() => { localStorage.setItem('brevet-easy-planningai-instruction', planningAiSystemInstruction); }, [planningAiSystemInstruction]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-conseilsai-model', defaultConseilsAiModel); }, [defaultConseilsAiModel]);
    useEffect(() => { localStorage.setItem('brevet-easy-conseilsai-instruction', conseilsAiSystemInstruction); }, [conseilsAiSystemInstruction]);
    useEffect(() => { localStorage.setItem('brevet-easy-default-gamesai-model', defaultGamesAiModel); }, [defaultGamesAiModel]);
    useEffect(() => { localStorage.setItem('brevet-easy-gamesai-instruction', gamesAiSystemInstruction); }, [gamesAiSystemInstruction]);
    

    // Effect to handle model downgrades when subscription changes
    useEffect(() => {
        if (subscriptionPlan === 'free') {
            if (defaultAiModel !== 'brevetai') setDefaultAiModel('brevetai');
            if (defaultImageModel !== 'faceai') setDefaultImageModel('faceai');
            if (defaultCanvasModel !== 'canvasai') setDefaultCanvasModel('canvasai');
            if (defaultFlashAiModel !== 'flashai') setDefaultFlashAiModel('flashai');
            if (defaultPlanningAiModel !== 'planningai') setDefaultPlanningAiModel('planningai');
            if (defaultConseilsAiModel !== 'conseilsai') setDefaultConseilsAiModel('conseilsai');
            if (defaultGamesAiModel !== 'gamesai') setDefaultGamesAiModel('gamesai');
        } else if (subscriptionPlan === 'pro') {
            if (defaultAiModel === 'brevetai-max') setDefaultAiModel('brevetai-pro');
            if (defaultImageModel === 'faceai-max') setDefaultImageModel('faceai-pro');
            if (defaultCanvasModel === 'canvasai-max') setDefaultCanvasModel('canvasai-pro');
            if (defaultFlashAiModel === 'flashai-max') setDefaultFlashAiModel('flashai-pro');
            if (defaultPlanningAiModel === 'planningai-max') setDefaultPlanningAiModel('planningai-pro');
            if (defaultConseilsAiModel === 'conseilsai-max') setDefaultConseilsAiModel('conseilsai-pro');
            if (defaultGamesAiModel === 'gamesai-max') setDefaultGamesAiModel('gamesai-pro');
        }
    }, [subscriptionPlan, defaultAiModel, defaultImageModel, defaultCanvasModel, defaultFlashAiModel, defaultPlanningAiModel, defaultConseilsAiModel, defaultGamesAiModel]);

    // ... The rest of the App component ...
    const activeSession = chatSessions.find(s => s.id === activeChatSessionId);

    const handleBackToHome = () => {
      setQuiz(null);
      setViewHistory([]);
      setView('home');
    }

    const handleGoBack = () => {
        if (viewHistory.length > 0) {
            const previousView = viewHistory[viewHistory.length - 1];
            setViewHistory(h => h.slice(0, -1));
            // Don't use navigate here to avoid pushing to history again
            rootRef.current?.scrollTo({ top: 0, behavior: 'auto' });
            setView(previousView);
        } else {
            handleBackToHome(); // Fallback to home
        }
    };

    const handleGoToSettings = () => {
      navigate('settings');
    }
    
    const handleLogin = (email: string) => {
        const newUser = { email };
        if (email === 'guest@breveteasy.com') {
          localStorage.setItem('brevet-easy-guest', JSON.stringify(newUser));
        } else {
          localStorage.setItem('brevet-easy-user', JSON.stringify(newUser));
        }
        setUser(newUser);
        navigate('home');
    };

    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        navigate('subjectOptions');
    };
    
    const handleStartChat = () => navigate('chat');
    const handleStartDrawing = () => navigate('drawing');
    const handleGoToImageGeneration = () => navigate('imageGeneration');
    const handleStartCanvas = () => navigate('canvas');
    const handleStartFlashAI = () => navigate('flashAI');
    const handleStartPlanning = () => navigate('planning');
    const handleStartConseils = () => navigate('conseils');
    const handleStartJeux = () => navigate('jeux');
    
    const buildSystemInstruction = useCallback((baseInstruction: string) => {
        let finalInstruction = baseInstruction.trim();
        if (userName.trim()) {
            finalInstruction += `\nL'utilisateur s'appelle ${userName.trim()}. Adresse-toi à lui par son prénom de manière amicale.`;
        }
        return finalInstruction;
    }, [userName]);

    const handleGenerateQuiz = useCallback(async (customPrompt: string, count: number, difficulty: string, level: string, useTimer: boolean) => {
        if (!selectedSubject) return;
        setLoadingTask('quiz');
        navigate('loading');
        setCurrentQuestionIndex(0);
        setIsQuizTimed(useTimer);
        
        try {
            const systemInstruction = buildSystemInstruction(aiSystemInstruction);
            const generatedQuiz = await generateQuiz(
                t(selectedSubject.nameKey),
                count,
                difficulty,
                level,
                customPrompt,
                systemInstruction
            );
            setQuiz(generatedQuiz);
            setQuizAnswers(Array(generatedQuiz.questions.length).fill(null));
            navigate('quiz');

        } catch (error) {
            console.error("Error generating quiz:", error);
            setNotification({ message: "Erreur lors de la génération du quiz.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
            handleBackToHome();
        }
    }, [selectedSubject, buildSystemInstruction, aiSystemInstruction, t, navigate, handleBackToHome]);
    
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
        navigate('results');
    };
    
    const handleGenericHtmlGeneration = useCallback(async (task: LoadingTask, prompt: string) => {
        if (!selectedSubject) return;
        setLoadingTask(task);
        navigate('loading');
        try {
            const html = await generateHtmlContent(prompt, buildSystemInstruction(aiSystemInstruction));
            setGeneratedHtml(html);
            navigate('exercises');
        } catch (error) {
            console.error(`Error generating ${task}:`, error);
            setNotification({ message: "Erreur lors de la génération.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
            handleBackToHome();
        }
    }, [selectedSubject, buildSystemInstruction, aiSystemInstruction, navigate, handleBackToHome]);

    const handleGenerateExercises = (customPrompt: string, count: number, difficulty: string, level: string) => {
        const prompt = `Génère une fiche de ${count} exercices sur le sujet "${t(selectedSubject?.nameKey || '')}" pour le niveau ${level}, difficulté ${difficulty}. ${customPrompt}. La sortie doit être un fichier HTML bien formaté, incluant les énoncés numérotés, un espace pour la réponse, et un corrigé détaillé à la fin. Utilise des balises sémantiques (h1, h2, p, ul, li, etc.) et un peu de style CSS dans une balise <style> pour la lisibilité (couleurs, marges, etc.).`;
        handleGenericHtmlGeneration('exercises', prompt);
    };
    
    const handleGenerateCours = (customPrompt: string, count: number, difficulty: string, level: string) => {
        const prompt = `Génère une fiche de cours sur le sujet "${t(selectedSubject?.nameKey || '')}" pour le niveau ${level}, difficulté ${difficulty}, en se concentrant sur ${count} concepts clés. ${customPrompt}. La sortie doit être un fichier HTML bien formaté, avec un titre principal, des sections pour chaque concept (h2), des définitions claires (p), des exemples (ul/li ou blockquojte), et un résumé. Utilise des balises sémantiques et du CSS dans une balise <style> pour rendre le cours visuellement agréable et facile à lire (couleurs, typographie, espacements).`;
        handleGenericHtmlGeneration('cours', prompt);
    };
    
    const handleGenerateFicheRevisions = (customPrompt: string, count: number, difficulty: string, level: string) => {
        const prompt = `Génère une fiche de révisions synthétique sur le sujet "${t(selectedSubject?.nameKey || '')}" pour le niveau ${level}. ${customPrompt}. La fiche doit résumer les points essentiels à connaître pour le brevet. La sortie doit être un fichier HTML bien formaté, utilisant des titres, des listes à puces, du gras pour les termes importants, et un code couleur simple pour mettre en évidence les différentes sections. Le contenu doit être concis et aller à l'essentiel.`;
        handleGenericHtmlGeneration('fiche-revisions', prompt);
    };

    const handleDownloadHtml = () => {
        if (!generatedHtml || isDownloadingHtml) return;
        setIsDownloadingHtml(true);
        try {
            const blob = new Blob([generatedHtml], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${loadingTask}_${t(selectedSubject?.nameKey || '').replace(' ', '_')}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading HTML:", error);
            setNotification({ message: "Le téléchargement a échoué.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsDownloadingHtml(false);
        }
    };
    
    const handleCopyHtml = () => {
        if (!generatedHtml) return;
        navigator.clipboard.writeText(generatedHtml).catch(err => {
            console.error('Failed to copy HTML: ', err);
            setNotification({ message: "La copie a échoué.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        });
    };
    
    const handleNewChat = () => {
        const newSession: ChatSession = {
            id: `chat_${Date.now()}`,
            title: t('history_sidebar_new_chat'),
            createdAt: Date.now(),
            messages: [],
            aiModel: defaultAiModel,
        };
        setChatSessions(prev => [newSession, ...prev]);
        setActiveChatSessionId(newSession.id);
        navigate('chat');
    };
    
    const handleSelectChat = (sessionId: string) => {
        setActiveChatSessionId(sessionId);
        navigate('chat');
    };
    
    const handleDeleteChat = (sessionId: string) => {
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeChatSessionId === sessionId) {
            const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
            if(remainingSessions.length > 0) {
                 const sorted = [...remainingSessions].sort((a,b) => b.createdAt - a.createdAt);
                 setActiveChatSessionId(sorted[0].id);
            } else {
                 setActiveChatSessionId(null);
            }
        }
    };
    
    const handleUpdateSession = (
        sessionId: string,
        updates: {
            messages?: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]);
            title?: string;
            aiModel?: AiModel;
            folderId?: string | null;
        }
    ) => {
        setChatSessions(prev =>
            prev.map(s => {
                if (s.id === sessionId) {
                    const newSession = { ...s };
                    if (updates.title !== undefined) newSession.title = updates.title;
                    if (updates.aiModel !== undefined) newSession.aiModel = updates.aiModel;
                    if (updates.folderId !== undefined) newSession.folderId = updates.folderId;

                    if (updates.messages) {
                        if (typeof updates.messages === 'function') {
                            newSession.messages = updates.messages(s.messages);
                        } else {
                            newSession.messages = updates.messages;
                        }
                    }
                    return newSession;
                }
                return s;
            })
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
    
    const handleNewFolder = (name: string, emoji: string) => {
        const newFolder: Folder = { id: `folder_${Date.now()}`, name, emoji, createdAt: Date.now() };
        setFolders(prev => [newFolder, ...prev]);
    };
    
    const handleDeleteFolder = (folderId: string) => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        setChatSessions(prev => prev.map(s => s.folderId === folderId ? {...s, folderId: null} : s));
    };

    const handleUpdateFolder = (folderId: string, updates: Partial<Folder>) => {
        setFolders(prev => prev.map(f => (f.id === folderId ? { ...f, ...updates } : f)));
    };
    
    const handleAddNewCustomModel = (modelData: Omit<CustomAiModel, 'id' | 'createdAt'>) => {
        const newModel: CustomAiModel = { ...modelData, id: `custom_${Date.now()}`, createdAt: Date.now() };
        setCustomAiModels(prev => [newModel, ...prev]);
    };
    
    const handleGenerateImage = useCallback(async (prompt: string, model: ImageModel, style: string, format: 'jpeg' | 'png', aspectRatio: string, negativePrompt: string) => {
        const generationLimit = subscriptionPlan === 'free' ? 2 : subscriptionPlan === 'pro' ? 5 : Infinity;
        if (imageUsage.count >= generationLimit) {
            setNotification({ message: "Vous avez atteint votre limite de générations d'images pour aujourd'hui.", type: 'error'});
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        setIsGeneratingImage(true);
        setGeneratedImage(null);
        
        try {
            const imageData = await generateImage(prompt, model, style, format, aspectRatio, imageGenerationInstruction, negativePrompt);
            setGeneratedImage(imageData);
            setImageUsage(prev => ({ ...prev, count: prev.count + 1 }));
        } catch (error) {
            console.error("Error generating image:", error);
            setNotification({ message: "Erreur lors de la génération de l'image.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsGeneratingImage(false);
        }
    }, [imageUsage, subscriptionPlan, imageGenerationInstruction]);
    
    const remainingImageGenerations = () => {
        if (subscriptionPlan === 'max') return Infinity;
        const limit = subscriptionPlan === 'pro' ? 5 : 2;
        return Math.max(0, limit - imageUsage.count);
    };
    
    const handleGenerateCanvas = useCallback(async (prompt: string, model: CanvasModel) => {
        setIsGeneratingCanvas(true);
        try {
            const html = await generateInteractivePage(prompt, model, buildSystemInstruction(canvasSystemInstruction));
            const newVersion: CanvasVersion = { id: `canvas_${Date.now()}`, htmlContent: html, prompt: prompt, createdAt: Date.now() };
            setCanvasVersions(prev => [...prev, newVersion]);
            setActiveCanvasVersionId(newVersion.id);
        } catch (error) {
            console.error("Error generating canvas page:", error);
            setNotification({ message: "Erreur lors de la génération.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsGeneratingCanvas(false);
        }
    }, [buildSystemInstruction, canvasSystemInstruction]);

    const handleGenerateFlashQuestion = useCallback(async (level: string, model: FlashAiModel) => {
        setIsGeneratingFlashQuestion(true);
        try {
            const question = await generateFlashQuestion(level, buildSystemInstruction(flashAiSystemInstruction), model);
            setFlashQuestion(question);
        } catch (error) {
            console.error("Error generating flash question:", error);
            setNotification({ message: "Une erreur est survenue.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsGeneratingFlashQuestion(false);
        }
    }, [buildSystemInstruction, flashAiSystemInstruction]);

    const handleGeneratePlanning = useCallback(async (task: string, dueDate: string, model: PlanningAiModel) => {
        setIsGeneratingPlanning(true);
        try {
            const todayDate = new Date().toISOString().split('T')[0];
            const generatedPlan = await generatePlanning(task, dueDate, todayDate, buildSystemInstruction(planningAiSystemInstruction), model);
            setPlanning(generatedPlan);
        } catch (error) {
            console.error("Error generating planning:", error);
            setNotification({ message: "Erreur lors de la création du planning.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsGeneratingPlanning(false);
        }
    }, [buildSystemInstruction, planningAiSystemInstruction]);
    
    const handleUpdatePlanning = (updatedPlanning: Planning) => {
        setPlanning(updatedPlanning);
    };

    const handleGenerateConseils = useCallback(async (subject: string, level: string, model: ConseilsAiModel) => {
        setIsGeneratingConseils(true);
        try {
            const generatedConseils = await generateConseils(subject, level, buildSystemInstruction(conseilsAiSystemInstruction), model);
            setConseils(generatedConseils);
        } catch (error) {
            console.error("Error generating conseils:", error);
            setNotification({ message: "Erreur lors de la génération des conseils.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setIsGeneratingConseils(false);
        }
    }, [buildSystemInstruction, conseilsAiSystemInstruction]);

    const handleSelectGameSubject = (subject: Subject) => {
        setSelectedGameSubject(subject);
        navigate('jeuxDetail');
    };

    const handleSelectPremadeGame = (game: PremadeGame) => {
        setGameHtml(game.html);
        setSelectedGameSubject(SUBJECTS.find(s => s.nameKey === game.subjectNameKey) || null);
        navigate('gameDisplay');
    };

    const handleGenerateAIGame = useCallback(async (subject: Subject, prompt: string, model: GamesAiModel) => {
        setLoadingTask('gamesAI');
        navigate('loading');
        try {
            const html = await generateGame(t(subject.nameKey), prompt, model, buildSystemInstruction(gamesAiSystemInstruction));
            setGameHtml(html);
            setSelectedGameSubject(subject);
            navigate('gameDisplay');
        } catch (error) {
            console.error(`Error generating game:`, error);
            setNotification({ message: "Erreur lors de la génération.", type: 'error' });
            setTimeout(() => setNotification(null), 3000);
            handleBackToHome();
        }
    }, [t, handleBackToHome, buildSystemInstruction, gamesAiSystemInstruction, navigate]);
    
    const handleGoToSubscription = () => navigate('subscription');

    const handleUpgradePlan = (code: string) => {
        const upperCaseCode = code.toUpperCase();
        let planName = '';
        if (upperCaseCode === 'BVTPRO') {
            setSubscriptionPlan('pro');
            planName = t('subscription_plan_pro');
        } else if (upperCaseCode === 'BVTMAX') {
            setSubscriptionPlan('max');
            planName = t('subscription_plan_max');
        }

        if (planName) {
            const message = t('subscription_upgrade_success', { planName });
            setNotification({ message, type: 'success' });

            const newParticles: ConfettiParticle[] = Array.from({ length: 100 }).map((_, i) => ({
              id: Date.now() + i,
              x: Math.random() * window.innerWidth,
              y: -20,
              color: ['#a5b4fc', '#7dd3fc', '#f472b6', '#4ade80'][Math.floor(Math.random() * 4)],
              endX: (Math.random() - 0.5) * 400,
              endY: window.innerHeight * 0.8 + Math.random() * window.innerHeight * 0.2,
            }));
            setConfetti(newParticles);
            
            setTimeout(() => {
                setNotification(null);
                setConfetti([]);
            }, 3000);
            return true;
        }
        
        setNotification({ message: 'Code invalide. Veuillez réessayer.', type: 'error' });
        setTimeout(() => setNotification(null), 3000);
        return false;
    };


    if (isAppLoading) {
        return null; // Or a full-page loader to prevent any flash of content
    }

    let content;

    if (view === 'login' && !user) {
        content = <LoginView onLogin={handleLogin} />;
    } else {
        switch (view) {
            case 'home':
                content = <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleNewChat} onStartDrawing={handleStartDrawing} onStartImageGeneration={handleGoToImageGeneration} onStartCanvas={handleStartCanvas} onStartFlashAI={handleStartFlashAI} onStartPlanning={handleStartPlanning} onStartConseils={handleStartConseils} onStartJeux={handleStartJeux} subscriptionPlan={subscriptionPlan} />;
                break;
            case 'subjectOptions':
                content = selectedSubject && <SubjectOptionsView subject={selectedSubject} onGenerateQuiz={handleGenerateQuiz} onGenerateExercises={handleGenerateExercises} onGenerateCours={handleGenerateCours} onGenerateFicheRevisions={handleGenerateFicheRevisions} subscriptionPlan={subscriptionPlan} defaultItemCount={defaultItemCount} defaultDifficulty={defaultDifficulty} defaultLevel={defaultLevel} />;
                break;
            case 'quiz':
                content = quiz && <QuizView quiz={quiz} onSubmit={handleQuizSubmit} currentQuestionIndex={currentQuestionIndex} setCurrentQuestionIndex={setCurrentQuestionIndex} isTimed={isQuizTimed}/>;
                break;
            case 'results':
                content = <ResultsView score={score} totalQuestions={quiz?.questions.length || 0} onRestart={handleBackToHome} quiz={quiz} userAnswers={quizAnswers} />;
                break;
            case 'settings':
                content = (
                    <SettingsView
                        theme={theme}
                        onThemeChange={setTheme}
                        aiSystemInstruction={aiSystemInstruction}
                        onAiSystemInstructionChange={setAiSystemInstruction}
                        subscriptionPlan={subscriptionPlan}
                        userName={userName}
                        onUserNameChange={setUserName}
                        userAvatar={userAvatar}
                        onUserAvatarChange={setUserAvatar}
                        defaultAiModel={defaultAiModel}
                        onDefaultAiModelChange={setDefaultAiModel}
                        defaultImageModel={defaultImageModel}
                        onDefaultImageModelChange={setDefaultImageModel}
                        imageGenerationInstruction={imageGenerationInstruction}
                        onImageGenerationInstructionChange={setImageGenerationInstruction}
                        defaultItemCount={defaultItemCount}
                        onDefaultItemCountChange={setDefaultItemCount}
                        defaultDifficulty={defaultDifficulty}
                        onDefaultDifficultyChange={setDefaultDifficulty}
                        defaultLevel={defaultLevel}
                        onDefaultLevelChange={setDefaultLevel}
                        defaultCanvasModel={defaultCanvasModel}
                        onDefaultCanvasModelChange={setDefaultCanvasModel}
                        canvasSystemInstruction={canvasSystemInstruction}
                        onCanvasSystemInstructionChange={setCanvasSystemInstruction}
                        defaultFlashAiModel={defaultFlashAiModel}
                        onDefaultFlashAiModelChange={setDefaultFlashAiModel}
                        flashAiSystemInstruction={flashAiSystemInstruction}
                        onFlashAiSystemInstructionChange={setFlashAiSystemInstruction}
                        defaultPlanningAiModel={defaultPlanningAiModel}
                        onDefaultPlanningAiModelChange={setDefaultPlanningAiModel}
                        planningAiSystemInstruction={planningAiSystemInstruction}
                        onPlanningAiSystemInstructionChange={setPlanningAiSystemInstruction}
                        defaultConseilsAiModel={defaultConseilsAiModel}
                        onDefaultConseilsAiModelChange={setDefaultConseilsAiModel}
                        conseilsAiSystemInstruction={conseilsAiSystemInstruction}
                        onConseilsAiSystemInstructionChange={setConseilsAiSystemInstruction}
                        defaultGamesAiModel={defaultGamesAiModel}
                        onDefaultGamesAiModelChange={setDefaultGamesAiModel}
                        gamesAiSystemInstruction={gamesAiSystemInstruction}
                        onGamesAiSystemInstructionChange={setGamesAiSystemInstruction}
                    />
                );
                break;
            case 'chat':
                content = (
                    <div className="w-full h-full flex flex-row">
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
                            subscriptionPlan={subscriptionPlan}
                            onNewCustomModel={handleAddNewCustomModel}
                        />
                        <div className="flex-grow h-full">
                            {activeSession ? (
                                <ChatView 
                                    session={activeSession} 
                                    onUpdateSession={handleUpdateSession} 
                                    systemInstruction={aiSystemInstruction}
                                    subscriptionPlan={subscriptionPlan}
                                    userName={userName}
                                    onNavigateToImageGeneration={handleGoToImageGeneration}
                                    onNavigateToCanvas={handleStartCanvas}
                                    onNavigateToFlashAI={handleStartFlashAI}
                                    onNavigateToPlanning={handleStartPlanning}
                                    onNavigateToConseils={handleStartConseils}
                                />
                            ) : (
                                <WelcomeView />
                            )}
                        </div>
                    </div>
                );
                break;
            case 'exercises':
                const contentConfig = {
                    exercises: { title: "Exercices générés !", description: "Votre fiche d'exercices est prête à être téléchargée.", buttonText: "Télécharger les exercices" },
                    cours: { title: "Cours généré !", description: "Votre fiche de cours est prête à être téléchargée.", buttonText: "Télécharger le cours" },
                    'fiche-revisions': { title: "Fiche générée !", description: "Votre fiche de révisions est prête.", buttonText: "Télécharger la fiche" },
                }[loadingTask] || { title: "Contenu généré !", description: "Votre contenu est prêt.", buttonText: "Télécharger" };
                
                content = <ExercisesView onDownload={handleDownloadHtml} onCopy={handleCopyHtml} {...contentConfig} />;
                break;
             case 'subscription':
                content = <SubscriptionView currentPlan={subscriptionPlan} onUpgrade={handleUpgradePlan} />;
                break;
            case 'imageGeneration':
                 content = <ImageGenerationView onGenerate={handleGenerateImage} isGenerating={isGeneratingImage} generatedImage={generatedImage} remainingGenerations={remainingImageGenerations()} defaultImageModel={defaultImageModel} subscriptionPlan={subscriptionPlan} />;
                 break;
            case 'canvas':
                content = <CanvasView versions={canvasVersions} activeVersionId={activeCanvasVersionId} onGenerate={handleGenerateCanvas} onSelectVersion={setActiveCanvasVersionId} isGenerating={isGeneratingCanvas} subscriptionPlan={subscriptionPlan} defaultCanvasModel={defaultCanvasModel} />;
                break;
            case 'drawing':
                content = <DrawingView />;
                break;
            case 'flashAI':
                content = <FlashAIView onGenerate={handleGenerateFlashQuestion} isLoading={isGeneratingFlashQuestion} question={flashQuestion} onClear={() => setFlashQuestion(null)} subscriptionPlan={subscriptionPlan} defaultFlashAiModel={defaultFlashAiModel} />;
                break;
            case 'planning':
                content = <PlanningView onGenerate={handleGeneratePlanning} isLoading={isGeneratingPlanning} planning={planning} onClear={() => setPlanning(null)} subscriptionPlan={subscriptionPlan} defaultPlanningAiModel={defaultPlanningAiModel} onUpdate={handleUpdatePlanning}/>;
                break;
            case 'conseils':
                content = <ConseilsView onGenerate={handleGenerateConseils} isLoading={isGeneratingConseils} conseils={conseils} onClear={() => setConseils(null)} subscriptionPlan={subscriptionPlan} defaultConseilsAiModel={defaultConseilsAiModel} />;
                break;
            case 'jeux':
                content = <JeuxView onSelectSubject={handleSelectGameSubject} />;
                break;
            case 'jeuxDetail':
                content = selectedGameSubject && <JeuxDetailView subject={selectedGameSubject} onSelectPremadeGame={handleSelectPremadeGame} onGenerateAIGame={handleGenerateAIGame} subscriptionPlan={subscriptionPlan} defaultGamesAiModel={defaultGamesAiModel} />;
                break;
            case 'gameDisplay':
                content = <GameDisplayView htmlContent={gameHtml} subject={selectedGameSubject} onGenerateAnother={(subject) => { setView('jeuxDetail'); setSelectedGameSubject(subject); }} />;
                break;
            default:
                content = <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleNewChat} onStartDrawing={handleStartDrawing} onStartImageGeneration={handleGoToImageGeneration} onStartCanvas={handleStartCanvas} onStartFlashAI={handleStartFlashAI} onStartPlanning={handleStartPlanning} onStartConseils={handleStartConseils} onStartJeux={handleStartJeux} subscriptionPlan={subscriptionPlan} />;
        }
    }
    
    if (view === 'loading') {
        content = <LoadingView subject={selectedSubject ? t(selectedSubject.nameKey) : ''} task={loadingTask} onCancel={handleBackToHome} />;
    }
    
    const showHeader = !['chat', 'drawing', 'loading', 'login'].includes(view);
    const showExitButton = !['home', 'chat', 'loading', 'login'].includes(view);
    const showBackButton = viewHistory.length > 0 && showExitButton;
    const isFullWidthView = ['home', 'chat', 'quiz', 'results', 'settings', 'subscription', 'imageGeneration', 'canvas', 'flashAI', 'planning', 'conseils', 'drawing', 'jeux', 'jeuxDetail', 'gameDisplay', 'login'].includes(view);

    const quizProgress = quiz ? ((currentQuestionIndex + 1) / (quiz.questions.length || 1)) * 100 : 0;

    return (
        <>
            {notification?.type === 'success' && <Confetti particles={confetti} />}
            {notification && <GeneralNotification message={notification.message} type={notification.type} />}
            <div className={`w-full min-h-full ${view !== 'chat' ? 'p-4 sm:p-6 lg:p-8' : ''} ${isFullWidthView ? '' : 'flex items-start justify-center'}`}>
                 {showHeader && <FixedHeader onNavigateSettings={handleGoToSettings} onNavigateSubscription={handleGoToSubscription} subscriptionPlan={subscriptionPlan} userAvatar={userAvatar} userName={userName} />}
                 <div className="fixed top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 z-[100] flex items-center gap-2">
                    {showBackButton && (
                        <HeaderButton 
                            onClick={handleGoBack}
                            title="Retour"
                            ariaLabel="Retour à la page précédente"
                            isIconOnly={true}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </HeaderButton>
                    )}
                    {showExitButton && (
                        <HeaderButton 
                            onClick={handleBackToHome} 
                            title={t('header_back_home')}
                            ariaLabel={t('header_back_home')}
                            isIconOnly={true}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </HeaderButton>
                    )}
                 </div>
                 <ScrollToTopButton onClick={() => rootRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} isVisible={showScrollTop} />
                 {view === 'quiz' && quiz && (
                    <div className="w-full max-w-4xl mx-auto pt-20">
                        <div className="w-full bg-black/10 dark:bg-slate-800/50 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-indigo-400 to-sky-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${quizProgress}%`, boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}></div>
                        </div>
                    </div>
                 )}
                 <div className={`${view === 'quiz' ? 'pt-6' : ''}`}>
                    {content}
                 </div>
            </div>
        </>
    );
};

// Fix: Added default export to the component.
export default App;