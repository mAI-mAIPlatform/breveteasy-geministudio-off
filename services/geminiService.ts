import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz, Question, ImageModel, CanvasModel, Planning, FlashAiModel, PlanningAiModel, ConseilsAiModel, ChatMessage, ChatPart, GamesAiModel, PlanningTask, PlanningDay, RawPlanning, AiModel, SubscriptionPlan } from './types';
import type { GenerateContentResponse } from '@google/genai';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error(
    "The API_KEY environment variable is not set. " +
    "Please ensure it is correctly configured in your deployment environment."
  );
}

const ai = new GoogleGenAI({ apiKey });

export { ai, Type };

async function callApi<T>(endpoint: string, action: string, payload: any): Promise<T> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API call to ${endpoint} failed with status ${response.status}: ${errorBody}`);
    }

    if (response.headers.get('Content-Type')?.includes('text/plain')) {
        return response.body as any;
    }

    return response.json();
}

export const generateQuiz = async (
    subjectName: string,
    count: number,
    difficulty: string,
    level: string,
    customPrompt: string,
    systemInstruction: string,
    fileContents: string[]
): Promise<Quiz> => {
    return callApi<Quiz>('/api/gemini', 'generateQuiz', { subjectName, count, difficulty, level, customPrompt, systemInstruction, fileContents });
};

export const generateHtmlContent = async (
    prompt: string,
    systemInstruction: string,
    fileContents: string[],
    model?: any
): Promise<string> => {
    const result = await callApi<{ html: string }>('/api/gemini', 'generateHtmlContent', { prompt, systemInstruction, fileContents, model });
    return result.html;
};

export const generateImage = async (
    prompt: string,
    model: ImageModel,
    style: string,
    format: 'jpeg' | 'png',
    aspectRatio: string,
    imageGenerationInstruction: string,
    negativePrompt: string
): Promise<{ data: string; mimeType: string; }> => {
    return callApi<{ data: string; mimeType: string; }>('/api/gemini', 'generateImage', { prompt, model, style, format, aspectRatio, imageGenerationInstruction, negativePrompt });
};

export const generateInteractivePage = async (
    prompt: string,
    model: CanvasModel,
    systemInstruction: string
): Promise<string> => {
    const fullPrompt = `${prompt}. La sortie doit être un fichier HTML unique, complet et valide, incluant le CSS dans une balise <style> et le JavaScript dans une balise <script>. Ne pas utiliser de bibliothèques externes. Le code doit être autonome.`;
    return generateHtmlContent(
        fullPrompt,
        systemInstruction || "Tu es un développeur web expert qui crée des pages web interactives à partir de descriptions. Ton code doit être propre, efficace et contenu dans un seul fichier HTML.",
        [],
        model
    );
};

export const generateFlashQuestion = async (
    level: string,
    systemInstruction: string,
    model: FlashAiModel
): Promise<Question> => {
    return callApi<Question>('/api/gemini', 'generateFlashQuestion', { level, systemInstruction, model });
};

export const generatePlanning = async (
    task: string,
    dueDate: string,
    todayDate: string,
    systemInstruction: string,
    model: PlanningAiModel,
): Promise<RawPlanning> => {
    return callApi<RawPlanning>('/api/gemini', 'generatePlanning', { task, dueDate, todayDate, systemInstruction, model });
};

export const generateConseils = async (
    subject: string,
    level: string,
    systemInstruction: string,
    model: ConseilsAiModel,
): Promise<string> => {
    const result = await callApi<{ html: string }>('/api/gemini', 'generateConseils', { subject, level, systemInstruction, model });
    return result.html;
};

export const generateGame = async (
    subjectName: string,
    customPrompt: string,
    model: GamesAiModel,
    systemInstruction: string,
): Promise<string> => {
    const result = await callApi<{ html: string }>('/api/gemini', 'generateGame', { subjectName, customPrompt, model, systemInstruction });
    return result.html;
};

export const generateContentWithSearch = async (history: ChatMessage[], currentParts: ChatPart[]): Promise<GenerateContentResponse> => {
    return callApi<GenerateContentResponse>('/api/gemini', 'generateWithSearch', { history, currentParts });
};

export const generateTitleForChat = async (prompt: string): Promise<string> => {
    const result = await callApi<{ title: string }>('/api/chat', 'generateTitle', { prompt });
    return result.title;
};

export const sendMessageStream = async (
  history: ChatMessage[],
  parts: ChatPart[],
  config: {
    aiModel: AiModel;
    systemInstruction: string;
    userName: string;
    subscriptionPlan: SubscriptionPlan;
  },
): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sendMessage',
      payload: { history, message: { parts }, config },
    }),
  });
  if (!response.ok || !response.body) {
    throw new Error('Failed to send message stream');
  }
  return response.body;
};
