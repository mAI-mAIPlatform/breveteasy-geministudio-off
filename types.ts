import type React from 'react';

export interface Subject {
  name: string;
  icon: React.ReactElement;
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
