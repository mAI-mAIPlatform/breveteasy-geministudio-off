import React, { useState, useEffect, useCallback } from 'react';
import { HomeView } from './components/HomeView';
import { SubjectOptionsView } from './components/SubjectOptionsView';
import { LoadingView } from './components/LoadingView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { ExercisesView } from './components/ExercisesView';
import { ChatView } from './components/ChatView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { generateQuiz, generateExercises } from './services/geminiService';
import type { Subject, Quiz, ChatSession, ChatMessage } from './types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type View = 'home' | 'subjectOptions' | 'loadingQuiz' | 'loadingExercises' | 'quiz' | 'results' | 'exercises' | 'chat' | 'history' | 'settings' | 'login';
type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
    // View and navigation state
    const [view, setView] = useState<View>('home');
    const [historyStack, setHistoryStack] = useState<View[]>(['home']);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // Quiz state
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
    const [score, setScore] = useState(0);

    // Exercises state
    const [exercisesHtml, setExercisesHtml] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Chat state
    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
        try {
            const savedSessions = localStorage.getItem('chatSessions');
            return savedSessions ? JSON.parse(savedSessions) : [];
        } catch (error) {
            return [];
        }
    });
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // User profile state
    const [user, setUser] = useState<{ email: string; xp: number; level: number } | null>(() => {
        try {
            const savedUser = localStorage.getItem('userProfile');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            return null;
        }
    });
    const [xpGained, setXpGained] = useState(0);
    const [leveledUp, setLeveledUp] = useState(false);

    // Theme state
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');

    // Persist chat sessions and user profile to localStorage
    useEffect(() => {
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }, [chatSessions]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('userProfile', JSON.stringify(user));
        } else {
            localStorage.removeItem('userProfile');
        }
    }, [user]);

    // Apply theme changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    const navigate = (newView: View) => {
        setView(newView);
        setHistoryStack(prev => [...prev, newView]);
    }

    const goBack = () => {
        const newStack = [...historyStack];
        newStack.pop();
        if (newStack.length > 0) {
            setView(newStack[newStack.length - 1]);
            setHistoryStack(newStack);
        } else {
            setView('home');
            setHistoryStack(['home']);
        }
    }

    const goHome = () => {
        setView('home');
        setHistoryStack(['home']);
        setSelectedSubject(null);
        setQuiz(null);
        setExercisesHtml(null);
        setUserAnswers([]);
        setScore(0);
    };

    const handleLogin = (email: string) => {
        setUser({ email, xp: 0, level: 1 });
        goBack(); // go back to wherever user was before login
    }

    const handleSubjectSelect = (subject: Subject) => {
        setSelectedSubject(subject);
        navigate('subjectOptions');
    };

    const handleStartQuiz = async (subjectName: string) => {
        navigate('loadingQuiz');
        const generatedQuiz = await generateQuiz(subjectName);
        if (generatedQuiz) {
            setQuiz(generatedQuiz);
            setUserAnswers(Array(generatedQuiz.questions.length).fill(null));
            navigate('quiz');
        } else {
            alert("Impossible de générer le quiz. Veuillez réessayer.");
            goBack();
        }
    };

    const handleGenerateExercises = async (subjectName: string) => {
        navigate('loadingExercises');
        const generatedHtml = await generateExercises(subjectName);
        if (generatedHtml) {
            setExercisesHtml(generatedHtml);
            navigate('exercises');
        } else {
            alert("Impossible de générer les exercices. Veuillez réessayer.");
            goBack();
        }
    };
    
    const handleSubmitQuiz = (answers: (string | null)[]) => {
        if (!quiz) return;
        let correctAnswers = 0;
        quiz.questions.forEach((q, index) => {
            if (q.correctAnswer === answers[index]) {
                correctAnswers++;
            }
        });
        const newScore = correctAnswers;
        setScore(newScore);
        setUserAnswers(answers);
        
        // XP calculation
        if (user) {
            const gained = newScore * 10;
            const newXp = user.xp + gained;
            const xpForNextLevel = user.level * 100;
            let newLevel = user.level;
            let didLevelUp = false;
            if (newXp >= xpForNextLevel) {
                newLevel += 1;
                didLevelUp = true;
            }
            setUser({ ...user, xp: newXp, level: newLevel });
            setXpGained(gained);
            setLeveledUp(didLevelUp);
        }

        navigate('results');
    };

    const handleDownloadPdf = () => {
        if (!exercisesHtml) return;
        setIsGeneratingPdf(true);
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        // Use a standard A4 ratio for sizing the content within the temp container
        tempContainer.style.width = '210mm';
        tempContainer.innerHTML = exercisesHtml;
        document.body.appendChild(tempContainer);

        html2canvas(tempContainer, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasHeight / canvasWidth;
            let heightLeft = canvasHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfWidth * ratio);
            heightLeft -= pdfHeight * (canvasWidth / pdfWidth);

            while (heightLeft > 0) {
                position -= pdfHeight * (canvasWidth / pdfWidth);
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfWidth * ratio);
                heightLeft -= pdfHeight * (canvasWidth / pdfWidth);
            }
            
            pdf.save(`exercices-${selectedSubject?.name.toLowerCase().replace(/\s/g, '_')}.pdf`);
            document.body.removeChild(tempContainer);
            setIsGeneratingPdf(false);
        }).catch(err => {
            console.error("Error generating PDF", err);
            document.body.removeChild(tempContainer);
            setIsGeneratingPdf(false);
            alert("Une erreur est survenue lors de la création du PDF.");
        });
    };

    const handleStartChat = () => {
        const newSession: ChatSession = {
            id: `session-${Date.now()}`,
            title: "Nouvelle discussion",
            createdAt: Date.now(),
            messages: [],
        };
        setChatSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        navigate('chat');
    };
    
    const handleUpdateSession = useCallback((sessionId: string, messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]), newTitle?: string) => {
        setChatSessions(prevSessions =>
            prevSessions.map(session => {
                if (session.id === sessionId) {
                    const newMessages = typeof messages === 'function' ? messages(session.messages) : messages;
                    return {
                        ...session,
                        title: newTitle || session.title,
                        messages: newMessages,
                    };
                }
                return session;
            })
        );
    }, []);

    const handleDeleteChat = (sessionId: string) => {
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
            setCurrentSessionId(null);
            navigate('home');
        }
    };
    
    const handleSelectChat = (sessionId: string) => {
        setCurrentSessionId(sessionId);
        navigate('chat');
    };

    const renderView = () => {
        const currentSession = chatSessions.find(s => s.id === currentSessionId);

        switch (view) {
            case 'subjectOptions':
                return selectedSubject && <SubjectOptionsView subject={selectedSubject} onStartQuiz={handleStartQuiz} onGenerateExercises={handleGenerateExercises} onBack={goBack} />;
            case 'loadingQuiz':
                return <LoadingView subject={selectedSubject?.name || ''} task="quiz" />;
            case 'loadingExercises':
                return <LoadingView subject={selectedSubject?.name || ''} task="exercises" />;
            case 'quiz':
                return quiz && <QuizView quiz={quiz} onSubmit={handleSubmitQuiz} />;
            case 'results':
                return <ResultsView score={score} totalQuestions={quiz?.questions.length || 0} onRestart={goHome} quiz={quiz} userAnswers={userAnswers} xpGained={xpGained} leveledUp={leveledUp} />;
            case 'exercises':
                return <ExercisesView onDownloadPdf={handleDownloadPdf} onBack={goHome} isGeneratingPdf={isGeneratingPdf} />;
            case 'chat':
                return currentSession ? <ChatView session={currentSession} onUpdateSession={handleUpdateSession} onBack={goHome} onNavigateHistory={() => navigate('history')} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
            case 'history':
                return <HistoryView sessions={chatSessions} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onBack={() => currentSessionId ? navigate('chat') : goHome()} />;
            case 'settings':
                return <SettingsView onBack={goBack} theme={theme} onThemeChange={setTheme} />;
            case 'login':
                return <LoginView onLogin={handleLogin} onBack={goBack} />;
            case 'home':
            default:
                return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans flex flex-col">
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow flex items-center justify-center">
                {renderView()}
            </main>
            {view === 'home' && (
                <footer className="w-full text-center p-4 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                    26-1.1 © All rights reserved | Brevet' Easy - BrevetAI | Official Website and IA
                </footer>
            )}
        </div>
    );
};

export default App;