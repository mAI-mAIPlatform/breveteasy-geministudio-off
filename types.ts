import React from 'react';

export interface Subject {
  name: string;
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
    groundingMetadata?: {
        groundingChunks: { web: { uri: string; title: string; } }[] 
    };
}

export type AiModel = 'brevetai' | 'brevetai-pro' | 'brevetai-max';
export type ImageModel = 'faceai' | 'faceai-pro' | 'faceai-max';
export type CanvasModel = 'canvasai' | 'canvasai-pro' | 'canvasai-max';
export type FlashAiModel = 'flashai' | 'flashai-pro' | 'flashai-max';
export type PlanningAiModel = 'planningai' | 'planningai-pro' | 'planningai-max';
export type ConseilsAiModel = 'conseilsai' | 'conseilsai-pro' | 'conseilsai-max';


export interface Folder {
    id: string;
    name: string;
    createdAt: number;
    emoji?: string;
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

export interface CustomAiModel {
    id: string;
    name: string;
    icon: string;
    version: string;
    description: string;
    baseModel: AiModel;
    instructions: string;
    createdAt: number;
}


export type EvaluationQuestionType = 'qcm' | 'fill-in-the-blank' | 'short-text' | 'long-text';

export interface BaseEvaluationQuestion {
    questionText: string;
    points: number;
    type: EvaluationQuestionType;
}

export interface QcmEvaluationQuestion extends BaseEvaluationQuestion {
    type: 'qcm';
    options: string[];
    correctAnswer: string;
}

export interface FillInTheBlankEvaluationQuestion extends BaseEvaluationQuestion {
    type: 'fill-in-the-blank';
    questionTextWithBlanks: string;
    correctAnswers: string[];
}

export interface ShortTextEvaluationQuestion extends BaseEvaluationQuestion {
    type: 'short-text';
    correctAnswer: string;
}

export interface LongTextEvaluationQuestion extends BaseEvaluationQuestion {
    type: 'long-text';
    idealAnswer: string;
}

export type EvaluationQuestion = QcmEvaluationQuestion | FillInTheBlankEvaluationQuestion | ShortTextEvaluationQuestion | LongTextEvaluationQuestion;

export interface Evaluation {
    title: string;
    subject: string;
    questions: EvaluationQuestion[];
}

export type EvaluationAnswers = {
    [questionIndex: number]: string | string[];
};

export interface GradedQuestionResult {
    isCorrect: boolean;
    scoreAwarded: number;
    feedback: string;
}

export interface EvaluationResult {
    totalScore: number;
    overallFeedback: string;
    gradedQuestions: GradedQuestionResult[];
}

export interface CanvasVersion {
  id: string;
  htmlContent: string;
  prompt: string;
  createdAt: number;
}

export interface PlanningTask {
    date: string; // e.g., "2025-10-27"
    tasks: string[]; // List of tasks for the day
}

export interface Planning {
    title: string;
    schedule: PlanningTask[];
}