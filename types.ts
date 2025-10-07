import type React from 'react';

export type View = 'home' | 'subjectOptions' | 'loading' | 'quiz' | 'results' | 'chat' | 'history' | 'settings' | 'login';

export interface Subject {
  name: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  subject: string;
  questions: Question[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isGenerating?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
}

export interface UserProfile {
    email: string;
    level: number;
    xp: number;
}