
import React, { useState, useEffect, useCallback } from 'react';
import { HomeView } from './components/HomeView';
import { LoadingView } from './components/LoadingView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { ChatView } from './components/ChatView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { SubjectOptionsView } from './components/SubjectOptionsView';
import { generateQuiz } from './services/geminiService';
import type { Subject, Quiz, ChatSession, ChatMessage } from './types';

type View = 'home' | 'subjectOptions' | 'loading' | 'quiz' | 'results' | 'chat' | 'history' | 'settings';

const SESSIONS_KEY = 'brevet-easy-sessions';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [score, setScore] = useState(0);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem(SESSIONS_KEY);
      return savedSessions ? JSON.parse(savedSessions) : [];
    } catch (error) {
      console.error("Failed to load sessions from localStorage", error);
      return [];
    }
  });
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(chatSessions));
    } catch (error) {
      console.error("Failed to save sessions to localStorage", error);
    }
  }, [chatSessions]);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setView('subjectOptions');
  }, []);

  const handleStartQuiz = useCallback(async (subjectName: string) => {
    if (selectedSubject) {
        setView('loading');
        const quiz = await generateQuiz(subjectName);
        if (quiz) {
          setCurrentQuiz(quiz);
          setUserAnswers(Array(quiz.questions.length).fill(null));
          setView('quiz');
        } else {
          alert("Désolé, une erreur est survenue lors de la création du quiz. Veuillez réessayer.");
          setView('home');
        }
    }
  }, [selectedSubject]);


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
    setView('results');
  };

  const handleRestart = () => {
    setView('home');
    setSelectedSubject(null);
    setCurrentQuiz(null);
    setUserAnswers([]);
    setScore(0);
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

  const updateChatSession = (sessionId: string, messages: ChatMessage[], newTitle?: string) => {
      setChatSessions(prevSessions => {
          return prevSessions.map(session => {
              if (session.id === sessionId) {
                  const updatedSession = { ...session, messages: messages };
                  if (newTitle && session.title === "Nouvelle discussion") {
                      updatedSession.title = newTitle;
                  }
                  return updatedSession;
              }
              return session;
          });
      });
  };

  const renderView = () => {
    switch (view) {
      case 'subjectOptions':
        return selectedSubject ? <SubjectOptionsView subject={selectedSubject} onStartQuiz={handleStartQuiz} onBack={handleRestart} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
      case 'loading':
        return <LoadingView subject={selectedSubject?.name || ''} />;
      case 'quiz':
        return currentQuiz ? <QuizView quiz={currentQuiz} onSubmit={handleQuizSubmit} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
      case 'results':
        return <ResultsView score={score} totalQuestions={currentQuiz?.questions.length || 0} onRestart={handleRestart} quiz={currentQuiz} userAnswers={userAnswers} />;
      case 'chat': {
        const currentSession = chatSessions.find(s => s.id === currentChatSessionId);
        return currentSession ? <ChatView session={currentSession} onUpdateSession={updateChatSession} onBack={() => setView('home')} onNavigateHistory={() => setView('history')} /> : <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
      }
      case 'history':
        return <HistoryView sessions={chatSessions} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onBack={() => setView('home')} />;
      case 'settings':
          return <SettingsView onBack={() => setView('home')} />;
      case 'home':
      default:
        return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartNewChat} />;
    }
  };

  const showHeaderNav = view === 'home' || view === 'history' || view === 'settings';

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col items-center">
      {showHeaderNav && (
         <nav className="w-full max-w-4xl flex justify-between items-center mb-8">
            <button onClick={() => setView('home')} className="text-2xl font-bold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Brevet' Easy</button>
            <div className="flex items-center gap-4">
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
