
import React, { useState, useEffect, useCallback } from 'react';
import { HomeView } from './components/HomeView';
import { LoadingView } from './components/LoadingView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { ChatView } from './components/ChatView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { SubjectOptionsView } from './components/SubjectOptionsView';
import { LoginView } from './components/LoginView';
import { ExercisesView } from './components/ExercisesView';
import { generateQuiz, generateExercises } from './services/geminiService';
import type { Subject, Quiz, ChatSession, ChatMessage, View, UserProfile } from './types';

const ACTIVE_USER_EMAIL_KEY = 'brevet-easy-active-user-email';
const PROFILES_KEY = 'brevet-easy-profiles';
const SESSIONS_KEY_PREFIX = 'brevet-easy-sessions';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [score, setScore] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [loadingTask, setLoadingTask] = useState<'quiz' | 'exercises'>('quiz');
  const [generatedExercisesHtml, setGeneratedExercisesHtml] = useState<string | null>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);

  // Load active user profile on startup
  useEffect(() => {
    const activeUserEmail = localStorage.getItem(ACTIVE_USER_EMAIL_KEY);
    if (activeUserEmail) {
      const allProfiles: { [email: string]: UserProfile } = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
      if (allProfiles[activeUserEmail]) {
        setCurrentUser(allProfiles[activeUserEmail]);
      }
    }
  }, []);

  const getSessionsKey = useCallback(() => {
    return `${SESSIONS_KEY_PREFIX}-${currentUser?.email || 'guest'}`;
  }, [currentUser]);

  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(getSessionsKey());
      setChatSessions(savedSessions ? JSON.parse(savedSessions) : []);
    } catch (error) {
      console.error("Failed to load sessions from localStorage", error);
      setChatSessions([]);
    }
  }, [currentUser, getSessionsKey]);

  useEffect(() => {
    try {
      localStorage.setItem(getSessionsKey(), JSON.stringify(chatSessions));
    } catch (error) {
      console.error("Failed to save sessions to localStorage", error);
    }
  }, [chatSessions, getSessionsKey]);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setView('subjectOptions');
  }, []);

  const handleStartQuiz = useCallback(async (subjectName: string) => {
    setView('loading');
    setLoadingTask('quiz');
    const quiz = await generateQuiz(subjectName);
    if (quiz) {
      setCurrentQuiz(quiz);
      setUserAnswers(Array(quiz.questions.length).fill(null));
      setXpGained(0);
      setLeveledUp(false);
      setView('quiz');
    } else {
      alert("Désolé, une erreur est survenue lors de la création du quiz. Veuillez réessayer.");
      setView('home');
    }
  }, []);
  
  const printHtmlAsPdf = (htmlContent: string) => {
    const printWindow = window.open('', '_blank', 'height=800,width=600');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    } else {
        alert("Veuillez autoriser les fenêtres pop-up pour pouvoir télécharger le PDF.");
    }
  };
  
  const handleGenerateExercises = useCallback(async (subjectName: string) => {
    setView('loading');
    setLoadingTask('exercises');
    const exercises = await generateExercises(subjectName);
    if (exercises) {
      setGeneratedExercisesHtml(exercises);
      setView('exercisesView');
    } else {
      alert("Désolé, une erreur est survenue lors de la création des exercices. Veuillez réessayer.");
      setView('home');
    }
  }, []);

  const handleQuizSubmit = (answers: (string | null)[]) => {
    if (!currentQuiz) return;
    let newScore = 0;
    currentQuiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setUserAnswers(answers);

    if (currentUser) {
      const scoreOutOf20 = (newScore / currentQuiz.questions.length) * 20;
      const xpToAdd = Math.round(scoreOutOf20);
      setXpGained(xpToAdd);

      const updatedUser = { ...currentUser };
      updatedUser.xp += xpToAdd;

      let didLevelUp = false;
      let xpForNextLevel = updatedUser.level * 100;
      while (updatedUser.xp >= xpForNextLevel) {
        updatedUser.level += 1;
        updatedUser.xp -= xpForNextLevel;
        didLevelUp = true;
        xpForNextLevel = updatedUser.level * 100;
      }
      setLeveledUp(didLevelUp);
      
      setCurrentUser(updatedUser);
      const allProfiles: { [email: string]: UserProfile } = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
      allProfiles[updatedUser.email] = updatedUser;
      localStorage.setItem(PROFILES_KEY, JSON.stringify(allProfiles));
    }

    setView('results');
  };

  const handleRestart = () => {
    setView('home');
    setSelectedSubject(null);
    setCurrentQuiz(null);
    setUserAnswers([]);
    setScore(0);
    setXpGained(0);
    setLeveledUp(false);
    setGeneratedExercisesHtml(null);
  };
  
  const handleStartNewChat = () => {
      const newSession: ChatSession = {
          id: `chat-${Date.now()}`,
          title: "Nouvelle discussion",
          messages: [],
          createdAt: Date.now(),
      };
      setChatSessions(prev => [newSession, ...prev]);
      setCurrentChatSessionId(newSession.id);
      setView('chat');
  };
  
  const handleSelectChat = (chatId: string) => {
      setCurrentChatSessionId(chatId);
      setView('chat');
  };
  
  const handleDeleteChat = (chatId: string) => {
      setChatSessions(prev => prev.filter(s => s.id !== chatId));
      if (currentChatSessionId === chatId) {
          setCurrentChatSessionId(null);
      }
  };

  const updateChatSession = (sessionId: string, messagesUpdater: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[]), newTitle?: string) => {
      setChatSessions(prevSessions => {
          return prevSessions.map(session => {
              if (session.id === sessionId) {
                  const newMessages = typeof messagesUpdater === 'function'
                      ? messagesUpdater(session.messages)
                      : messagesUpdater;
                  const updatedSession = { ...session, messages: newMessages };
                  if (newTitle && session.title === "Nouvelle discussion") {
                      updatedSession.title = newTitle;
                  }
                  return updatedSession;
              }
              return session;
          }).sort((a, b) => b.createdAt - a.createdAt);
      });
  };

  const handleLogin = (email: string) => {
    const allProfiles: { [email: string]: UserProfile } = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
    let userProfile = allProfiles[email];
    if (!userProfile) {
        userProfile = { email, level: 1, xp: 0 };
        allProfiles[email] = userProfile;
        localStorage.setItem(PROFILES_KEY, JSON.stringify(allProfiles));
    }
    localStorage.setItem(ACTIVE_USER_EMAIL_KEY, email);
    setCurrentUser(userProfile);
    setView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem(ACTIVE_USER_EMAIL_KEY);
    setCurrentUser(null);
  };

  const renderView = () => {
    switch (view) {
      case 'subjectOptions':
        return selectedSubject ? <SubjectOptionsView subject={selectedSubject} onStartQuiz={handleStartQuiz} onBack={handleRestart} onGenerateExercises={handleGenerateExercises} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
      case 'loading':
        return <LoadingView subject={selectedSubject?.name || ''} task={loadingTask} />;
      case 'quiz':
        return currentQuiz ? <QuizView quiz={currentQuiz} onSubmit={handleQuizSubmit} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
      case 'results':
        return <ResultsView score={score} totalQuestions={currentQuiz?.questions.length || 0} onRestart={handleRestart} quiz={currentQuiz} userAnswers={userAnswers} xpGained={xpGained} leveledUp={leveledUp} />;
      case 'exercisesView':
        return generatedExercisesHtml ? <ExercisesView onDownloadPdf={() => printHtmlAsPdf(generatedExercisesHtml)} onBack={handleRestart} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
      case 'chat': {
        const currentSession = chatSessions.find(s => s.id === currentChatSessionId);
        return currentSession ? <ChatView session={currentSession} onUpdateSession={updateChatSession} onBack={() => setView('home')} onNavigateHistory={() => setView('history')} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
      }
      case 'history':
        return <HistoryView sessions={chatSessions} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onBack={() => setView('home')} />;
      case 'settings':
          return <SettingsView onBack={() => setView('home')} currentUser={currentUser} onNavigateToLogin={() => setView('login')} onLogout={handleLogout} />;
      case 'login':
          return <LoginView onLogin={handleLogin} onBack={() => currentUser ? setView('settings') : setView('home')} />;
      case 'home':
      default:
        return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
    }
  };

  const showHeaderNav = !['quiz', 'loading', 'login', 'subjectOptions', 'chat', 'exercisesView'].includes(view);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col items-center">
      {showHeaderNav && (
         <nav className="w-full max-w-4xl flex justify-between items-center mb-8">
            <button onClick={() => setView('home')} className="text-2xl font-bold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Brevet' Easy</button>
            <div className="flex items-center gap-4">
                {currentUser ? (
                    <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.686.445l1.833 3.718 4.1.596a.75.75 0 01.416 1.28l-2.966 2.89.7 4.084a.75.75 0 01-1.088.79L10 13.43l-3.65 1.918a.75.75 0 01-1.088-.79l.7-4.084-2.966-2.89a.75.75 0 01.416-1.28l4.1-.596L9.314 2.445A.75.75 0 0110 2z" clipRule="evenodd" /></svg>
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-200">Niv. {currentUser.level}</span>
                    </div>
                ) : (
                   <button onClick={() => setView('login')} className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:bg-blue-700 transition-colors">
                        Compte
                    </button>
                )}
               <button onClick={() => setView('history')} title="Historique" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </button>
               <button onClick={() => setView('settings')} title="Paramètres" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </button>
            </div>
         </nav>
      )}
      <div className="w-full flex-grow flex items-center justify-center">
        {renderView()}
      </div>
    </div>
  );
};

export default App;