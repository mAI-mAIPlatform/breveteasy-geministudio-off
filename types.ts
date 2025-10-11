import React from 'react';

export interface Subject {
  name: string;
  // Fix: Specify that the icon can accept a className prop for styling via React.cloneElement.
  icon: React.ReactElement<{ className?: string }>;
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

export interface ChatPart {
    text?: string;
    image?: {
        data: string; // base64
        mimeType: string;
    }
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: ChatPart[];
    isGenerating?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    messages: ChatMessage[];
}

export type SubscriptionPlan = 'free' | 'pro' | 'max';