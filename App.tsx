
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
import { CanvasView } from './components/CanvasView';
import { FlashAIView } from './components/FlashAIView';
import { PlanningView } from './components/PlanningView';
import { ConseilsView } from './components/ConseilsView';
import { DrawingView } from './components/DrawingView';
import { JeuxView } from './components/JeuxView';
import { JeuxDetailView } from './components/JeuxDetailView';
import { GameDisplayView } from './components/GameDisplayView';
// FIX: Added ImageEditingView and VoiceAIView imports
import { ImageEditingView } from './components/ImageEditingView';
import { VoiceAIView } from './components/VoiceAIView';
import { generateQuiz, generateHtmlContent, generateImage, editImage, generateInteractivePage, generateFlashQuestion, generatePlanning, generateConseils, generateGame } from './services/geminiService';
import { AVATAR_ICONS, SUBJECTS } from './constants';
import type { Subject, Quiz, ChatSession, ChatMessage, SubscriptionPlan, AiModel, ImageModel, Folder, CustomAiModel, CanvasVersion, CanvasModel, Question, Planning, FlashAiModel, PlanningAiModel, ConseilsAiModel, PremadeGame, GamesAiModel, PlanningDay, PlanningTask, RawPlanning } from './types';
import { useLocalization } from './hooks/useLocalization';


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


type View = 'home' | 'subjectOptions' | 'loading' | 'quiz' | 'results' | 'chat' | 'settings' | 'login' | 'exercises' | 'subscription' | 'imageGeneration' | 'canvas' | 'flashAI' | 'planning' | 'conseils' | 'drawing' | 'jeux' | 'jeuxDetail' | 'gameDisplay' | 'imageEditing' | 'voiceAI';
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

const FixedExitButton: React.FC<{ onClick: () => void; position?: 'fixed' | 'absolute' }> = ({ onClick, position = 'fixed' }) => {
    const { t } = useLocalization();
    return (
        <div className={`${position} top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 z-[100]`}>
            <HeaderButton 
                onClick={onClick} 
                title={t('header_back_home')}
                ariaLabel={t('header_back_home')}
                isIconOnly={true}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
    const [view, setView] = useState<View>('login');
    const [loadingTask, setLoadingTask] = useState<LoadingTask>('quiz');
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [aiSystemInstruction, setAiSystemInstruction] = useState<string>('');
    const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('free');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const rootRef = useRef<HTMLElement | null>(null);

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
    const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

    // Chat State
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [customAiModels, setCustomAiModels] = useState<CustomAiModel[]>([]);


    // Image Generation State
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<{ data: string; mimeType: string; } | null>(null);
    const [imageUsage, setImageUsage] = useState<ImageUsage>({ count: 0, date: new Date().toISOString().split('T')[0] });
    
    // Image Editing State
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [editedImage, setEditedImage] = useState<{ data: string; mimeType: string } | null>(null);

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

    // Other state
    const [quizUseTimer, setQuizUseTimer] = useState(false);


    // Load state from localStorage on initial mount
    useEffect(() => {
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

    // Notification handler
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
    };


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


    // Navigation Handlers
    const handleLogin = (email: string) => {
        setUser({ email });
        setView('home');
    };

    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        setView('subjectOptions');
    };

    const handleBackToHome = () => {
        setSelectedSubject(null);
        setQuiz(null);
        setQuizAnswers([]);
        setScore(0);
        setCurrentQuestionIndex(0);
        setGeneratedHtml(null);
        setGeneratedImage(null);
        setFlashQuestion(null);
        setPlanning(null);
        setConseils(null);
        setGameHtml(null);
        setSelectedGameSubject(null);
        setView('home');
    };
    
    const handleGoToSettings = () => setView('settings');
    const handleGoToLogin = () => setView('login');
    const handleGoToSubscription = () => setView('subscription');
    const handleGoToImageGeneration = () => {
        setGeneratedImage(null);
        setView('imageGeneration');
    };
    const handleStartCanvas = () => {
        setView('canvas');
    };
    const handleStartDrawing = () => setView('drawing');
    const handleStartFlashAI = () => {
        setFlashQuestion(null);
        setView('flashAI');
    };
    const handleStartPlanning = () => {
        setPlanning(null);
        setView('planning');
    }
    const handleStartConseils = () => {
        setConseils(null);
        setView('conseils');
    };
    const handleScrollToTop = () => {
        rootRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStartJeux = () => {
        setView('jeux');
    };

    const handleSelectGameSubject = (subject: Subject) => {
        setSelectedGameSubject(subject);
        setView('jeuxDetail');
    };

    const handleSelectPremadeGame = (game: PremadeGame) => {
        setGameHtml(game.html);
        setSelectedGameSubject(SUBJECTS.find(s => s.nameKey === game.subjectNameKey) || null);
        setView('gameDisplay');
    };
    
    const handleStartImageEditing = () => setView('imageEditing');
    const handleStartVoiceAI = () => setView('voiceAI');


    // Subscription Handler
    const handleUpgradePlan = (code: string) => {
        const upperCaseCode = code.toUpperCase();
        let planName = '';
        if (upperCaseCode === 'BVTPRO') {
            setSubscriptionPlan('pro');
            planName = 'Brevet Pro';
        } else if (upperCaseCode === 'BVTMAX') {
            setSubscriptionPlan('max');
            planName = 'Brevet Max';
        }

        if (planName) {
            showNotification(`Forfait ${planName} activé !`, 'success');
            return true;
        }
        showNotification('Code invalide.', 'error');
        return false;
    };

    // AI Instruction Builder
    const buildSystemInstruction = useCallback((baseInstruction: string) => {
        let finalInstruction = baseInstruction.trim();
        if (userName.trim()) {
            finalInstruction += `\nL'utilisateur s'appelle ${userName.trim()}. Adresse-toi à lui par son prénom.`;
        }
        return finalInstruction;
    }, [userName]);

    // Quiz Flow Handlers
    const handleGenerateQuiz = useCallback(async (customPrompt: string, count: number, difficulty: string, level: string, useTimer: boolean, fileContents: string[]) => {
        if (!selectedSubject) return;
        setView('loading');
        setLoadingTask('quiz');
        setQuizUseTimer(useTimer);
        setCurrentQuestionIndex(0);
        
        try {
            const systemInstruction = buildSystemInstruction(aiSystemInstruction);
            const generatedQuiz = await generateQuiz(
                t(selectedSubject.nameKey),
                count,
                difficulty,
                level,
                customPrompt,
                systemInstruction,
                fileContents
            );
            setQuiz(generatedQuiz);
            setQuizAnswers(Array(generatedQuiz.questions.length).fill(null));
            setView('quiz');

        } catch (error) {
            console.error("Error generating quiz:", error);
            showNotification(t('error_generating'), 'error');
            handleBackToHome();
        }
    }, [selectedSubject, buildSystemInstruction, aiSystemInstruction, t, handleBackToHome]);
    
    const triggerConfetti = () => {
        const newParticles = Array.from({ length: 150 }).map((_, i) => ({
          id: Date.now() + i,
          x: Math.random() * window.innerWidth,
          y: -20,
          color: ['#a5b4fc', '#7dd3fc', '#f472b6', '#4ade80', '#facc15'][Math.floor(Math.random() * 5)],
          endX: (Math.random() - 0.5) * 500,
          endY: Math.random() * 300 + 400,
        }));
        setConfetti(newParticles);
        setTimeout(() => setConfetti([]), 5000);
      };

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
        if (correctAnswers / quiz.questions.length >= 0.8) {
            triggerConfetti();
        }
    };

    const handleGenericHtmlGeneration = useCallback(async (task: LoadingTask, prompt: string, fileContents: string[]) => {
        if (!selectedSubject) return;
        setView('loading');
        setLoadingTask(task);
        try {
            const html = await generateHtmlContent(prompt, buildSystemInstruction(aiSystemInstruction), fileContents);
            setGeneratedHtml(html);
            setView('exercises');
        } catch (error) {
            console.error(`Error generating ${task}:`, error);
            showNotification(t('error_generating'), 'error');
            handleBackToHome();
        }
    }, [selectedSubject, buildSystemInstruction, aiSystemInstruction, t, handleBackToHome]);

    const handleGenerateExercises = (customPrompt: string, count: number, difficulty: string, level: string, fileContents: string[]) => {
        const prompt = `Génère une fiche de ${count} exercices sur le sujet "${t(selectedSubject?.nameKey || '')}" pour le niveau ${level}, difficulté ${difficulty}. ${customPrompt}.
La sortie doit être un fichier HTML unique, complet et bien formaté.

**CONSIGNES STRICTES POUR LE HTML & CSS :**

1.  **Structure HTML :**
    *   Utilise une structure sémantique: \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`.
    *   Dans \`<head>\`, inclure \`<meta charset="UTF-8">\`, \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`, et un \`<title>\` pertinent.
    *   Le corps (\`<body>\`) doit contenir un conteneur principal (\`div class="container"\`).
    *   Le titre principal (\`<h1>\`) doit être "Exercices de ${t(selectedSubject?.nameKey || '')}". Un sous-titre \`<p>\` peut indiquer le niveau et la difficulté.
    *   Chaque exercice doit être dans une \`<section class="exercise">\` avec un titre \`<h2>\` (ex: "Exercice 1").
    *   La section des corrigés doit être à la fin, dans une balise \`<details class="correction-details">\`. Le titre "Corrigés" sera dans une balise \`<summary>\`. Chaque corrigé d'exercice sera dans un \`<div class="correction-item">\`.

2.  **CSS (dans une balise \`<style>\` dans le \`<head>\`) :**
    *   Importe la police 'Poppins' de Google Fonts: \`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');\`
    *   Style le \`body\` avec la police 'Poppins'.
    *   Crée un design moderne, épuré et aéré. Utilise un fond de couleur claire.
    *   Centre le \`.container\` avec une largeur maximale (\`max-width: 800px;\`) et des marges.
    *   **Supporte le mode sombre :** Ajoute des styles dans une media query \`@media (prefers-color-scheme: dark)\`. Change les couleurs du fond, du texte, des bordures, etc., pour un thème sombre agréable.
    *   Style les titres, paragraphes et listes pour une lisibilité optimale.
    *   Style la section \`.exercise\` avec une bordure subtile et un peu de marge.
    *   Style la section des corrigés (\`.correction-details\`) avec un fond légèrement différent. Style le \`<summary>\` pour qu'il ressemble à un bouton interactif.

3.  **Contenu :**
    *   Les énoncés doivent être clairs.
    *   Les corrigés doivent être détaillés et pédagogiques.
    *   Ajoute un pied de page discret \`<footer>\` avec le texte "Généré par Brevet' Easy".

**Exemple de structure CSS pour le mode sombre :**
\`\`\`css
@media (prefers-color-scheme: dark) {
  body { background-color: #121212; color: #e0e0e0; }
  .container { background-color: #1e1e1e; }
  /* ... autres styles pour le mode sombre ... */
}
\`\`\`
`;
        handleGenericHtmlGeneration('exercises', prompt, fileContents);
    };
    
    const handleGenerateCours = (customPrompt: string, count: number, difficulty: string, level: string, fileContents: string[]) => {
        const prompt = `Génère une fiche de cours sur le sujet "${t(selectedSubject?.nameKey || '')}" pour le niveau ${level}, en se concentrant sur ${count} concepts clés. ${customPrompt}.
La sortie doit être un fichier HTML unique, complet et bien formaté, suivant les mêmes consignes de design (police Poppins, conteneur centré, support mode sombre, etc.) que pour une fiche d'exercices.

**Structure spécifique pour le cours :**
*   Le titre principal \`<h1>\` sera "Fiche de Cours : ${t(selectedSubject?.nameKey || '')}".
*   Chaque concept clé doit être une \`<section>\` avec un titre \`<h2>\`.
*   Utilise des paragraphes \`<p>\`, des listes \`<ul>\`/\`<li>\`, et des balises \`<strong>\` ou \`<em>\` pour mettre en évidence les termes importants.
*   Inclus une section de résumé à la fin dans un \`<div class="summary">\` avec un style distinctif (par exemple, un fond de couleur ou une bordure).
*   Pas de section de corrigés ici, mais maintiens le design général et le pied de page.
`;
        handleGenericHtmlGeneration('cours', prompt, fileContents);
    };
    
    const handleGenerateFicheRevisions = (customPrompt: string, count: number, difficulty: string, level: string, fileContents: string[]) => {
        const prompt = `Génère une fiche de révisions synthétique sur le sujet "${t(selectedSubject?.nameKey || '')}" pour le niveau ${level}. ${customPrompt}. La fiche doit résumer les points essentiels à connaître pour le brevet.
La sortie doit être un fichier HTML unique, complet et bien formaté, suivant les mêmes consignes de design (police Poppins, conteneur centré, support mode sombre, etc.) que pour une fiche d'exercices.

**Structure spécifique pour la fiche de révisions :**
*   Le titre principal \`<h1>\` sera "Fiche de Révisions : ${t(selectedSubject?.nameKey || '')}".
*   La fiche doit être très concise, utilisant principalement des listes à puces \`<ul>\`/\`<li>\` et des titres \`<h2>\` pour organiser les thèmes.
*   Les mots-clés et définitions importantes doivent être mis en évidence avec \`<strong>\`.
*   Tu peux utiliser des boîtes d'information ou "tips" avec une classe CSS spéciale (\`.info-box\`) et un style distinct pour attirer l'attention sur des points cruciaux.
*   Maintiens le design général et le pied de page.
`;
        handleGenericHtmlGeneration('fiche-revisions', prompt, fileContents);
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
            showNotification("Le téléchargement a échoué.", 'error');
        } finally {
            setIsDownloadingHtml(false);
        }
    };
    
    const handleCopyHtml = () => {
        if (!generatedHtml) return;
        navigator.clipboard.writeText(generatedHtml).catch(err => {
            console.error('Failed to copy HTML: ', err);
            showNotification("La copie a échoué.", 'error');
        });
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
            const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
            if(remainingSessions.length > 0) {
                 const sorted = [...remainingSessions].sort((a,b) => b.createdAt - a.createdAt);
                 setActiveChatSessionId(sorted[0].id);
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

    // Folder Handlers
    const handleNewFolder = (name: string, emoji: string) => {
        const newFolder: Folder = {
            id: `folder_${Date.now()}`,
            name,
            emoji,
            createdAt: Date.now(),
        };
        setFolders(prev => [newFolder, ...prev]);
    };
    
    const handleDeleteFolder = (folderId: string) => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        setChatSessions(prev => prev.map(s => s.folderId === folderId ? {...s, folderId: null} : s));
    };

    const handleUpdateFolder = (folderId: string, updates: Partial<Folder>) => {
        setFolders(prev =>
            prev.map(f => (f.id === folderId ? { ...f, ...updates } : f))
        );
    };

    // Custom Model Handlers
    const handleAddNewCustomModel = (modelData: Omit<CustomAiModel, 'id' | 'createdAt'>) => {
        const newModel: CustomAiModel = {
            ...modelData,
            id: `custom_${Date.now()}`,
            createdAt: Date.now(),
        };
        setCustomAiModels(prev => [newModel, ...prev]);
    };

    // Image Generation Handlers
    const handleGenerateImage = useCallback(async (prompt: string, model: ImageModel, style: string, format: 'jpeg' | 'png', aspectRatio: string, negativePrompt: string) => {
        const generationLimit = subscriptionPlan === 'free' ? 2 : subscriptionPlan === 'pro' ? 5 : Infinity;
        if (imageUsage.count >= generationLimit) {
            showNotification("Vous avez atteint votre limite de générations d'images pour aujourd'hui.", 'error');
            return;
        }

        setIsGeneratingImage(true);
        setGeneratedImage(null);
        
        try {
            const imageData = await generateImage(
                prompt,
                model,
                style,
                format,
                aspectRatio,
                imageGenerationInstruction,
                negativePrompt
            );
            
            setGeneratedImage(imageData);
            setImageUsage(prev => ({ ...prev, count: prev.count + 1 }));

        } catch (error) {
            console.error("Error generating image:", error);
            showNotification("Une erreur est survenue lors de la génération de l'image.", 'error');
        } finally {
            setIsGeneratingImage(false);
        }
    }, [imageUsage.count, subscriptionPlan, imageGenerationInstruction]);

    const handleEditImage = useCallback(async (base64Data: string, mimeType: string, prompt: string) => {
        setIsEditingImage(true);
        setEditedImage(null);
        try {
            const imageData = await editImage(base64Data, mimeType, prompt);
            setEditedImage(imageData);
        } catch (error) {
            console.error("Error editing image:", error);
            showNotification("Une erreur est survenue lors de la modification de l'image.", 'error');
        } finally {
            setIsEditingImage(false);
        }
    }, []);

    // Canvas, FlashAI, Planning & Conseils Handlers
    const handleGenerateCanvas = useCallback(async (prompt: string, model: CanvasModel) => {
        setIsGeneratingCanvas(true);
        try {
            const html = await generateInteractivePage(prompt, model, buildSystemInstruction(canvasSystemInstruction));
            const newVersion: CanvasVersion = {
                id: `canvas_${Date.now()}`,
                htmlContent: html,
                prompt: prompt,
                createdAt: Date.now()
            };
            setCanvasVersions(prev => [...prev, newVersion]);
            setActiveCanvasVersionId(newVersion.id);
        } catch (error) {
            console.error("Error generating canvas page:", error);
            showNotification(t('error_generating'), 'error');
        } finally {
            setIsGeneratingCanvas(false);
        }
    }, [buildSystemInstruction, canvasSystemInstruction, t]);

    const handleGenerateFlashQuestion = useCallback(async (level: string, model: FlashAiModel) => {
        setIsGeneratingFlashQuestion(true);
        try {
            const question = await generateFlashQuestion(level, buildSystemInstruction(flashAiSystemInstruction), model);
            setFlashQuestion(question);
        } catch (error) {
            console.error("Error generating flash question:", error);
            showNotification(t('error_generating'), 'error');
        } finally {
            setIsGeneratingFlashQuestion(false);
        }
    }, [buildSystemInstruction, flashAiSystemInstruction, t]);
    
    const handleGeneratePlanning = useCallback(async (task: string, dueDate: string, model: PlanningAiModel) => {
        setIsGeneratingPlanning(true);
        try {
            const todayDate = new Date().toISOString().split('T')[0];
            const generatedPlan: RawPlanning = await generatePlanning(task, dueDate, todayDate, buildSystemInstruction(planningAiSystemInstruction), model);
            
            const scheduleWithTaskObjects: PlanningDay[] = generatedPlan.schedule.map(day => ({
                date: day.date,
                tasks: day.tasks.map((taskText: string) => ({
                    id: `task_${Date.now()}_${Math.random()}`,
                    text: taskText,
                    isCompleted: false,
                })) as PlanningTask[]
            }));

            setPlanning({ ...generatedPlan, schedule: scheduleWithTaskObjects });
        } catch (error) {
            console.error("Error generating planning:", error);
            showNotification("Une erreur est survenue lors de la création du planning.", 'error');
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
            showNotification(t('error_generating'), 'error');
        } finally {
            setIsGeneratingConseils(false);
        }
    }, [buildSystemInstruction, conseilsAiSystemInstruction, t]);
    
    const handleGenerateAIGame = useCallback(async (subject: Subject, prompt: string, model: GamesAiModel) => {
        setView('loading');
        setLoadingTask('gamesAI');
        try {
            const html = await generateGame(t(subject.nameKey), prompt, model, buildSystemInstruction(gamesAiSystemInstruction));
            setGameHtml(html);
            setSelectedGameSubject(subject);
            setView('gameDisplay');
        } catch (error) {
            console.error(`Error generating game:`, error);
            showNotification(t('error_generating'), 'error');
            handleBackToHome();
        }
    }, [t, handleBackToHome, buildSystemInstruction, gamesAiSystemInstruction]);


    const activeSession = chatSessions.find(s => s.id === activeChatSessionId);
    
    const remainingImageGenerations = () => {
        if (subscriptionPlan === 'max') return Infinity;
        const limit = subscriptionPlan === 'pro' ? 5 : 2;
        return Math.max(0, limit - imageUsage.count);
    };

    const quizProgress = quiz ? ((currentQuestionIndex + 1) / (quiz.questions.length || 1)) * 100 : 0;
    
    if (!user) {
        return (
            <div className="w-full min-h-full flex items-center justify-center p-4">
                <LoginView onLogin={handleLogin} />
            </div>
        )
    }

    if (view === 'loading') {
        return <LoadingView subject={selectedSubject?.nameKey ? t(selectedSubject.nameKey) : ''} task={loadingTask} onCancel={handleBackToHome} />;
    }
    
    const renderContent = () => {
        switch (view) {
            case 'home':
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} onStartDrawing={handleStartDrawing} onStartImageGeneration={handleGoToImageGeneration} onStartCanvas={handleStartCanvas} onStartFlashAI={handleStartFlashAI} onStartPlanning={handleStartPlanning} onStartConseils={handleStartConseils} onStartJeux={handleStartJeux} subscriptionPlan={subscriptionPlan} onStartImageEditing={handleStartImageEditing} onStartVoiceAI={handleStartVoiceAI} />;
            case 'subjectOptions':
                return selectedSubject && <SubjectOptionsView subject={selectedSubject} onGenerateQuiz={handleGenerateQuiz} onGenerateExercises={handleGenerateExercises} onGenerateCours={handleGenerateCours} onGenerateFicheRevisions={handleGenerateFicheRevisions} subscriptionPlan={subscriptionPlan} defaultItemCount={defaultItemCount} defaultDifficulty={defaultDifficulty} defaultLevel={defaultLevel} />;
            case 'quiz':
                return quiz && <QuizView quiz={quiz} onSubmit={handleQuizSubmit} currentQuestionIndex={currentQuestionIndex} setCurrentQuestionIndex={setCurrentQuestionIndex} isTimed={quizUseTimer} />;
            case 'results':
                return <ResultsView score={score} totalQuestions={quiz?.questions.length || 0} onRestart={handleBackToHome} quiz={quiz} userAnswers={quizAnswers} />;
            case 'settings':
                return (
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
            case 'chat':
                return (
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
            case 'login':
                return <LoginView onLogin={handleLogin} />;
            case 'exercises':
                const contentConfig = {
                    exercises: { title: t('exercises_generated'), description: t('exercises_generated_desc'), buttonText: t('exercises_download_button') },
                    cours: { title: t('course_generated'), description: t('course_generated_desc'), buttonText: t('course_download_button') },
                    'fiche-revisions': { title: t('summary_generated'), description: t('summary_generated_desc'), buttonText: t('summary_download_button') },
                }[loadingTask] || { title: "Contenu généré !", description: "Votre contenu est prêt.", buttonText: "Télécharger" };
                
                return <ExercisesView onDownload={handleDownloadHtml} onCopy={handleCopyHtml} {...contentConfig} />;
            case 'subscription':
                return <SubscriptionView currentPlan={subscriptionPlan} onUpgrade={handleUpgradePlan} />;
            case 'imageGeneration':
                 return <ImageGenerationView onGenerate={handleGenerateImage} isGenerating={isGeneratingImage} generatedImage={generatedImage} remainingGenerations={remainingImageGenerations()} defaultImageModel={defaultImageModel} subscriptionPlan={subscriptionPlan} />;
            case 'imageEditing':
                 return <ImageEditingView onGenerate={handleEditImage} isGenerating={isEditingImage} generatedImage={editedImage} onClear={() => setEditedImage(null)} />;
            case 'voiceAI':
                 return <VoiceAIView />;
            case 'canvas':
                return <CanvasView versions={canvasVersions} activeVersionId={activeCanvasVersionId} onGenerate={handleGenerateCanvas} onSelectVersion={setActiveCanvasVersionId} isGenerating={isGeneratingCanvas} subscriptionPlan={subscriptionPlan} defaultCanvasModel={defaultCanvasModel} />;
            case 'flashAI':
                return <FlashAIView onGenerate={handleGenerateFlashQuestion} isLoading={isGeneratingFlashQuestion} question={flashQuestion} onClear={() => setFlashQuestion(null)} subscriptionPlan={subscriptionPlan} defaultFlashAiModel={defaultFlashAiModel} />;
            case 'planning':
                return <PlanningView onGenerate={handleGeneratePlanning} isLoading={isGeneratingPlanning} planning={planning} onClear={() => setPlanning(null)} subscriptionPlan={subscriptionPlan} defaultPlanningAiModel={defaultPlanningAiModel} onUpdate={handleUpdatePlanning}/>;
            case 'conseils':
                return <ConseilsView onGenerate={handleGenerateConseils} isLoading={isGeneratingConseils} conseils={conseils} onClear={() => setConseils(null)} subscriptionPlan={subscriptionPlan} defaultConseilsAiModel={defaultConseilsAiModel} />;
            case 'drawing':
                return <DrawingView />;
            case 'jeux':
                return <JeuxView onSelectSubject={handleSelectGameSubject} />;
            case 'jeuxDetail':
                return selectedGameSubject && <JeuxDetailView subject={selectedGameSubject} onSelectPremadeGame={handleSelectPremadeGame} onGenerateAIGame={handleGenerateAIGame} subscriptionPlan={subscriptionPlan} defaultGamesAiModel={defaultGamesAiModel} />;
            case 'gameDisplay':
                return <GameDisplayView htmlContent={gameHtml} subject={selectedGameSubject} onGenerateAnother={(subject) => { setView('jeuxDetail'); setSelectedGameSubject(subject); }} />;
            default:
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} onStartDrawing={handleStartDrawing} onStartImageGeneration={handleGoToImageGeneration} onStartCanvas={handleStartCanvas} onStartFlashAI={handleStartFlashAI} onStartPlanning={handleStartPlanning} onStartConseils={handleStartConseils} onStartJeux={handleStartJeux} subscriptionPlan={subscriptionPlan} onStartImageEditing={handleStartImageEditing} onStartVoiceAI={handleStartVoiceAI} />;
        }
    };
    
    const showHeader = !['login', 'chat', 'drawing'].includes(view);
    const showExitButton = !['login', 'home', 'chat'].includes(view);
    const isFullWidthView = ['home', 'chat', 'quiz', 'results', 'settings', 'subscription', 'imageGeneration', 'canvas', 'flashAI', 'planning', 'conseils', 'drawing', 'jeux', 'jeuxDetail', 'gameDisplay', 'imageEditing', 'voiceAI'].includes(view);

    return (
        <div className={`w-full min-h-full ${view !== 'chat' ? 'p-4 sm:p-6 lg:p-8' : ''} ${isFullWidthView ? '' : 'flex items-center justify-center'}`}>
             <Confetti particles={confetti} />
             {notification && <GeneralNotification message={notification.message} type={notification.type} />}
             {showHeader && <FixedHeader onNavigateSettings={handleGoToSettings} onNavigateSubscription={handleGoToSubscription} subscriptionPlan={subscriptionPlan} userAvatar={userAvatar} userName={userName} />}
             {showExitButton && <FixedExitButton onClick={handleBackToHome} />}
             <ScrollToTopButton onClick={handleScrollToTop} isVisible={showScrollTop} />
             {view === 'quiz' && quiz && (
                <div className="w-full max-w-4xl mx-auto pt-20">
                    <div className="w-full bg-black/10 dark:bg-slate-800/50 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-indigo-400 to-sky-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${quizProgress}%`, boxShadow: '0 0 10px rgba(96, 165, 250, 0.7)' }}></div>
                    </div>
                </div>
             )}
             <div className={`${view === 'quiz' ? 'pt-6' : ''}`}>
                {renderContent()}
             </div>
        </div>
    );
};
// FIX: Added default export
export default App;
