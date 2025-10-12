// Fix: Provide the implementation for the main App component.
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

export type AiModel = 'brevetai' | 'brevetai-plus';
export type ImageModel = 'faceai' | 'faceai-plus';

export interface Folder {
    id: string;
    name: string;
    createdAt: number;
}

export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    messages: ChatMessage[];
    aiModel: AiModel;
    folderId?: string | null;
}

export type SubscriptionPlan = 'free' | 'pro' | 'max';