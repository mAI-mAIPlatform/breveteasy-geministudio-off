

import type { Quiz, ImageModel, CanvasModel, FlashAiModel, PlanningAiModel, ConseilsAiModel, Question, Planning, ChatMessage, ChatPart, GamesAiModel, RawPlanning, AiModel, SubscriptionPlan, BrevetSubject } from '@/lib/types';
import type { GenerateContentResponse } from '@google/genai';

async function callGeminiApi<T>(action: string, payload: any): Promise<T> {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
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
    return callGeminiApi<Quiz>('generateQuiz', { subjectName, count, difficulty, level, customPrompt, systemInstruction, fileContents });
};

export const generateHtmlContent = async (
    prompt: string,
    systemInstruction: string,
    model?: any,
): Promise<string> => {
    const result = await callGeminiApi<{ html: string }>('generateHtmlContent', { prompt, systemInstruction, model });
    return result.html;
};

export const generateImage = async (
    prompt: string,
    model: ImageModel,
    style: string,
    format: 'jpeg' | 'png',
    aspectRatio: string,
    imageGenerationInstruction: string,
    negativePrompt: string,
    imageSize: '1K' | '2K' | '4K'
): Promise<{ data: string; mimeType: string; }> => {
    return callGeminiApi<{ data: string; mimeType: string; }>('generateImage', { prompt, model, style, format, aspectRatio, imageGenerationInstruction, negativePrompt, imageSize });
};

export const editImage = async (
    base64Data: string,
    mimeType: string,
    prompt: string
): Promise<{ data: string; mimeType: string; }> => {
    return callGeminiApi<{ data: string; mimeType: string; }>('editImage', { base64Data, mimeType, prompt });
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
        model
    );
};

export const generateFlashQuestion = async (
    level: string,
    systemInstruction: string,
    model: FlashAiModel
): Promise<Question> => {
    return callGeminiApi<Question>('generateFlashQuestion', { level, systemInstruction, model });
};

export const generatePlanning = async (
    task: string,
    dueDate: string,
    todayDate: string,
    systemInstruction: string,
    model: PlanningAiModel,
): Promise<RawPlanning> => {
    return callGeminiApi<RawPlanning>('generatePlanning', { task, dueDate, todayDate, systemInstruction, model });
};

export const generateConseils = async (
    subject: string,
    level: string,
    systemInstruction: string,
    model: ConseilsAiModel,
): Promise<string> => {
    return callGeminiApi<{html: string}>('generateConseils', { subject, level, systemInstruction, model }).then(res => res.html);
};

export const generateGame = async (
    subjectName: string,
    customPrompt: string,
    model: GamesAiModel,
    systemInstruction: string,
): Promise<string> => {
    const result = await callGeminiApi<{ html: string }>('generateGame', { subjectName, customPrompt, model, systemInstruction });
    return result.html;
};

export const generateContentWithSearch = async (history: ChatMessage[], currentParts: ChatPart[]): Promise<GenerateContentResponse> => {
    const result = await callGeminiApi<GenerateContentResponse>('generateWithSearch', { history, currentParts });
    return result;
};

export const sendMessageStream = async (
    history: ChatMessage[],
    messageParts: ChatPart[],
    config: { aiModel: AiModel; systemInstruction: string; userName: string; subscriptionPlan: SubscriptionPlan }
): Promise<ReadableStream<Uint8Array>> => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'sendMessage',
            payload: {
                history,
                message: { parts: messageParts },
                config,
            },
        }),
    });

    if (!response.ok || !response.body) {
        const errorBody = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
    }
    return response.body;
};

export const generateTitleForChat = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'generateTitle',
            payload: { prompt },
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to generate title');
    }
    const { title } = await response.json();
    return title;
};

// NEW: Generate Evaluation
export const generateEvaluation = async (
    prompt: string,
    systemInstruction: string,
    fileContents: string[]
): Promise<string> => {
    const fullPrompt = `${prompt}. La sortie doit être un fichier HTML unique, formatté comme un examen officiel (en-tête, exercice 1, exercice 2, barème...). Inclus du CSS pour un style propre et professionnel (police serif pour le texte, sans-serif pour les titres, bordures pour les exercices).`;
    return generateHtmlContent(fullPrompt, systemInstruction, undefined);
};

// NEW: Generate Brevet 2026 Subject
export const generateBrevetSubject = async (
    subject: string,
    pages: number,
    systemInstruction: string
): Promise<BrevetSubject> => {
    return callGeminiApi<BrevetSubject>('generateBrevetSubject', { subject, pages, systemInstruction });
};
