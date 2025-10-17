import type { Quiz, ImageModel } from '@/lib/types';

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
): Promise<Quiz> => {
    return callGeminiApi<Quiz>('generateQuiz', { subjectName, count, difficulty, level, customPrompt, systemInstruction });
};

export const generateHtmlContent = async (
    prompt: string,
    systemInstruction: string,
): Promise<string> => {
    const result = await callGeminiApi<{ html: string }>('generateHtmlContent', { prompt, systemInstruction });
    return result.html;
};

export const generateImage = async (
    prompt: string,
    model: ImageModel,
    style: string,
    format: 'jpeg' | 'png',
    aspectRatio: string,
    imageGenerationInstruction: string,
): Promise<{ data: string; mimeType: string; }> => {
    return callGeminiApi<{ data: string; mimeType: string; }>('generateImage', { prompt, model, style, format, aspectRatio, imageGenerationInstruction });
};
