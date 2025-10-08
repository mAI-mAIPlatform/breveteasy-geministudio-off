
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
import { generateQuiz, generateExercises } from './services/geminiService';
import type { View, Subject, Quiz, ChatSession, ChatMessage, UserProfile } from './types';

// Simple UUID generator to avoid adding a dependency
const simpleUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const App: React.FC = () => {
  // State management
  const [view, setView] = useState<View>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [loadingTask, setLoadingTask] = useState<'quiz' | 'exercises'>('quiz');
  const [exercisesHtml, setExercisesHtml] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('brevet-easy-user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const savedSessions = localStorage.getItem('brevet-easy-chats');
      if (savedSessions) {
        setChatSessions(JSON.parse(savedSessions));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
     // Apply theme on initial load
     const theme = localStorage.getItem('brevet-easy-theme') || 'system';
     if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
         document.documentElement.classList.add('dark');
     } else {
         document.documentElement.classList.remove('dark');
     }
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('brevet-easy-user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('brevet-easy-user');
      }
    } catch (error) {
      console.error("Failed to save user data to localStorage", error);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('brevet-easy-chats', JSON.stringify(chatSessions));
    } catch (error) {
      console.error("Failed to save chat sessions to localStorage", error);
    }
  }, [chatSessions]);

  // Handlers
  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setView('subjectOptions');
  };

  const handleStartQuiz = async (subjectName: string) => {
    setLoadingTask('quiz');
    setView('loading');
    const quiz = await generateQuiz(subjectName);
    if (quiz) {
      setCurrentQuiz(quiz);
      setUserAnswers(Array(quiz.questions.length).fill(null));
      setView('quiz');
    } else {
      alert("Erreur lors de la génération du quiz. Veuillez réessayer.");
      setView('subjectOptions');
    }
  };

  const handleGenerateExercises = async (subjectName: string) => {
    setLoadingTask('exercises');
    setView('loading');
    const html = await generateExercises(subjectName);
    if (html) {
      setExercisesHtml(html);
      setView('exercisesView');
    } else {
      alert("Erreur lors de la génération des exercices. Veuillez réessayer.");
      setView('subjectOptions');
    }
  };
  
  const handleDownloadPdf = () => {
    if (!exercisesHtml) return;
    setIsGeneratingPdf(true);
    const blob = new Blob([exercisesHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exercices-${selectedSubject?.name.toLowerCase().replace(/\s/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsGeneratingPdf(false);
    alert("Le fichier HTML a été téléchargé. Vous pouvez l'ouvrir dans votre navigateur et l'imprimer en PDF (Ctrl+P ou Cmd+P).");
  };

  const handleQuizSubmit = (answers: (string | null)[]) => {
    if (!currentQuiz) return;
    
    let score = 0;
    currentQuiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    setUserAnswers(answers);
    
    if (currentUser) {
        const xpEarned = score * 10;
        let newXp = currentUser.xp + xpEarned;
        const xpForNextLevel = currentUser.level * 100;
        let newLevel = currentUser.level;
        let didLevelUp = false;

        if (newXp >= xpForNextLevel) {
            newLevel++;
            newXp = newXp - xpForNextLevel;
            didLevelUp = true;
        }

        setCurrentUser({ ...currentUser, xp: newXp, level: newLevel });
        setXpGained(xpEarned);
        setLeveledUp(didLevelUp);
    } else {
        setXpGained(0);
        setLeveledUp(false);
    }

    setView('results');
  };

  const handleRestart = () => {
    setCurrentQuiz(null);
    setSelectedSubject(null);
    setUserAnswers([]);
    setXpGained(0);
    setLeveledUp(false);
    setView('home');
  };

  const handleBackToHome = () => {
      setView('home');
  }

  const handleStartChat = () => {
      const newSession: ChatSession = {
          id: simpleUUID(),
          title: "Nouvelle discussion",
          messages: [],
          createdAt: Date.now(),
      };
      setChatSessions(prev => [newSession, ...prev]);
      setCurrentChatSessionId(newSession.id);
      setView('chat');
  };

  const handleSelectChat = (sessionId: string) => {
      setCurrentChatSessionId(sessionId);
      setView('chat');
  };
  
  const handleDeleteChat = (sessionId: string) => {
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentChatSessionId === sessionId) {
          setCurrentChatSessionId(null);
          setView('history');
      }
  };

  const handleUpdateSession = useCallback((sessionId: string, messages: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]), newTitle?: string) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          const newMessages = typeof messages === 'function' ? messages(session.messages) : messages;
          return {
            ...session,
            title: newTitle !== undefined ? newTitle : session.title,
            messages: newMessages,
          };
        }
        return session;
      })
    );
  }, []);

  const handleLogin = (email: string) => {
      const user: UserProfile = {
          email,
          level: 1,
          xp: 0,
      };
      setCurrentUser(user);
      setView('settings');
  };
  
  const handleLogout = () => {
      setCurrentUser(null);
  };
  
  const currentSession = chatSessions.find(s => s.id === currentChatSessionId);
  
  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
      case 'subjectOptions':
        if (!selectedSubject) {
            setView('home');
            return null;
        }
        return (
          <SubjectOptionsView
            subject={selectedSubject}
            onStartQuiz={handleStartQuiz}
            onGenerateExercises={handleGenerateExercises}
            onBack={() => setView('home')}
          />
        );
      case 'loading':
        return <LoadingView subject={selectedSubject?.name || ''} task={loadingTask} />;
      case 'quiz':
        if (!currentQuiz) {
            setView('home');
            return null;
        }
        return <QuizView quiz={currentQuiz} onSubmit={handleQuizSubmit} />;
      case 'results':
          const score = userAnswers.reduce((acc, answer, index) => {
            if(currentQuiz && answer === currentQuiz.questions[index].correctAnswer) {
                return acc + 1;
            }
            return acc;
        }, 0);
        return (
          <ResultsView
            score={score}
            totalQuestions={currentQuiz?.questions.length || 0}
            onRestart={handleRestart}
            quiz={currentQuiz}
            userAnswers={userAnswers}
            xpGained={xpGained}
            leveledUp={leveledUp}
          />
        );
      case 'chat':
          if(!currentSession) {
            handleStartChat();
            return null;
          }
          return <ChatView session={currentSession} onUpdateSession={handleUpdateSession} onBack={() => setView('home')} onNavigateHistory={() => setView('history')} />;
      case 'history':
          return <HistoryView sessions={chatSessions} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onBack={() => setView(currentChatSessionId ? 'chat' : 'home')} />;
      case 'settings':
          return <SettingsView onBack={() => setView('home')} currentUser={currentUser} onNavigateToLogin={() => setView('login')} onLogout={handleLogout} />;
      case 'login':
          return <LoginView onLogin={handleLogin} onBack={() => setView('settings')} />;
      case 'exercisesView':
          return <ExercisesView onDownloadPdf={handleDownloadPdf} onBack={handleBackToHome} isGeneratingPdf={isGeneratingPdf} />;
        
      default:
        return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
    }
  };
  
  const TopNav: React.FC = () => {
      if (['login'].includes(view)) return null;
      
      return (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
               <button onClick={() => currentUser ? setView('settings') : setView('login')} className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors" title="Compte">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
             </button>
               <button onClick={() => setView('settings')} className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors" title="Paramètres">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </button>
          </div>
      )
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 min-h-screen font-sans flex flex-col p-4 sm:p-6 lg:p-8 relative">
        <TopNav />
        <main className="w-full flex-grow flex items-center justify-center">
            {renderView()}
        </main>
        <footer className="w-full text-center text-xs text-gray-500 dark:text-gray-400 pt-8 shrink-0">
          26-1.1 © All rights reserved | Brevet' Easy - BrevetAI | Official Website and IA
        </footer>
    </div>
  );
};

export default App;
