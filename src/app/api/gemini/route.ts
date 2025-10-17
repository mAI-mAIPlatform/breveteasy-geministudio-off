
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';
import type { Quiz, ImageModel } from '@/lib/types';

if (!process.env.API_KEY) {
  throw new Error("Missing API_KEY environment variable");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function internalGenerateQuiz({ subjectName, count, difficulty, level, customPrompt, systemInstruction }: any): Promise<Quiz> {
    const quizSchema = {
        type: Type.OBJECT,
        properties: {
            subject: { type: Type.STRING },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        questionText: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ['questionText', 'options', 'correctAnswer', 'explanation']
                }
            }
        },
        required: ['subject', 'questions']
    };

    const prompt = `Génère un quiz de ${count} questions sur le sujet "${subjectName}" pour le niveau ${level}, difficulté ${difficulty}. ${customPrompt}. Les questions doivent être des QCM avec 4 options de réponse. Fournis une explication pour chaque bonne réponse.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
            systemInstruction: systemInstruction,
        }
    });
    
    return JSON.parse(response.text);
}


async function internalGenerateHtmlContent({ prompt, systemInstruction }: any): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });
    return response.text;
}

async function internalGenerateImage({ prompt, model, style, format, aspectRatio, imageGenerationInstruction }: any): Promise<{ data: string; mimeType: string; }> {
    const qualityPrompt = model === 'faceai-pro' || model === 'faceai-max'
        ? 'haute qualité, 4k, hyper-détaillé, photoréaliste'
        : '';

    const stylePrompt = style !== 'none' ? `style ${style.replace('-', ' ')}` : '';
    const userInstruction = imageGenerationInstruction.trim();

    const finalPrompt = [
        prompt,
        stylePrompt,
        qualityPrompt,
        userInstruction
    ].filter(Boolean).join(', ');
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: `image/${format}`,
          aspectRatio: aspectRatio,
        },
    });
    
    const imageBytes = response.generatedImages[0].image.imageBytes;
    return { data: imageBytes, mimeType: `image/${format}`};
}


export async function POST(req: Request) {
    try {
        const { action, payload } = await req.json();

        switch (action) {
            case 'generateQuiz':
                const quiz = await internalGenerateQuiz(payload);
                return NextResponse.json(quiz);
            
            case 'generateHtmlContent':
                const html = await internalGenerateHtmlContent(payload);
                return NextResponse.json({ html });

            case 'generateImage':
                const image = await internalGenerateImage(payload);
                return NextResponse.json(image);

            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}
