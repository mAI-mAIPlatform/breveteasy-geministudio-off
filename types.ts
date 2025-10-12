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

// --- Evaluation Types ---

export interface BaseEvaluationQuestion {
    questionText: string;
    points: number;
}

export interface EvaluationQCM extends BaseEvaluationQuestion {
    type: 'qcm';
    options: string[];
    correctAnswer: string;
}

export interface EvaluationFillBlank extends BaseEvaluationQuestion {
    type: 'fill-in-the-blank';
    // "La capitale de la France est {{BLANK}}."
    questionTextWithBlanks: string; 
    correctAnswers: string[]; // Answers in order of appearance
}

export interface EvaluationShortText extends BaseEvaluationQuestion {
    type: 'short-text';
    correctAnswer: string; // An ideal answer for comparison
}

export interface EvaluationLongText extends BaseEvaluationQuestion {
    type: 'long-text';
    idealAnswer: string; // The model answer for correction
}

export type EvaluationQuestion = EvaluationQCM | EvaluationFillBlank | EvaluationShortText | EvaluationLongText;

export interface Evaluation {
  subject: string;
  title: string;
  questions: EvaluationQuestion[];
  totalPoints: number;
}

// For user answers
export type EvaluationAnswers = {
    [questionIndex: number]: string | string[]; // string for QCM/Short/Long, string[] for FillBlank
};

// For AI grading result
export interface GradedQuestion {
    isCorrect: boolean;
    feedback: string;
    scoreAwarded: number;
}

export interface EvaluationResult {
    totalScore: number;
    overallFeedback: string;
    gradedQuestions: GradedQuestion[];
}