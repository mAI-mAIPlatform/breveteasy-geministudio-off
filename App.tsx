
import React, { useState, useCallback } from 'react';
import type { AppState, Quiz, Subject } from './types';
import { generateQuiz } from './services/geminiService';
import { HomeView } from './components/HomeView';
import { LoadingView } from './components/LoadingView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { ChatView } from './components/ChatView';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('home');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [score, setScore] = useState(0);

  const handleSubjectSelect = useCallback(async (subject: Subject) => {
    setSelectedSubject(subject);
    setAppState('loading');
    const quizData = await generateQuiz(subject.name);
    if (quizData) {
      setCurrentQuiz(quizData);
      setAppState('quiz');
    } else {
      alert("Désolé, une erreur est survenue lors de la création du quiz. Veuillez réessayer.");
      setAppState('home');
    }
  }, []);

  const handleQuizSubmit = (answers: (string | null)[]) => {
    if (!currentQuiz) return;
    
    let currentScore = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        currentScore++;
      }
    });

    setScore(currentScore);
    setUserAnswers(answers);
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('home');
    setCurrentQuiz(null);
    setSelectedSubject(null);
    setUserAnswers([]);
    setScore(0);
  };
  
  const handleStartChat = () => {
    setAppState('chat');
  };

  const renderContent = () => {
    switch(appState) {
      case 'loading':
        return <LoadingView subject={selectedSubject?.name ?? '...'} />;
      case 'quiz':
        return currentQuiz ? <QuizView quiz={currentQuiz} onSubmit={handleQuizSubmit} /> : <p>Erreur: Quiz non trouvé.</p>;
      case 'results':
        return <ResultsView score={score} totalQuestions={currentQuiz?.questions.length ?? 0} onRestart={handleRestart} />;
      case 'chat':
        return <ChatView onBack={handleRestart} />;
      case 'home':
      default:
        return <HomeView onSubjectSelect={handleSubjectSelect} onStartChat={handleStartChat} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-0 sm:p-2 md:p-4">
      <div className="w-full max-w-6xl h-screen sm:h-auto sm:max-h-[95vh] mx-auto bg-white sm:rounded-2xl shadow-2xl flex flex-col">
        <div className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto">
            {renderContent()}
        </div>
        <footer className="text-center p-4 text-xs text-gray-500 border-t border-gray-100 flex-shrink-0">
          26-1 © All rights reserved | Brevet' Easy et BrevetAI | Official AI and Website
        </footer>
      </div>
    </div>
  );
};

export default App;
