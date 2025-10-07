import React from 'react';

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

export interface Subject {
  name: string;
  // FIX: Use React.ReactElement to avoid JSX namespace error in .ts file.
  icon: React.ReactElement;
  color: string;
  bgColor: string;
}

export type AppState = 'home' | 'loading' | 'quiz' | 'results' | 'chat';

export interface ChatMessagePart {
  text?: string;
  file?: {
    data: string; // base64 encoded data
    mimeType: string;
    name: string;
  };
}

export interface ChatMessage {
  sender: 'user' | 'model';
  parts: ChatMessagePart[];
  id: number;
}