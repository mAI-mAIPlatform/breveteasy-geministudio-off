import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from 'next/server';
import type { Quiz, ImageModel, Question, Planning, CanvasModel, FlashAiModel, PlanningAiModel, ConseilsAiModel, ChatMessage, ChatPart } from '@/lib/types';

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


async function internalGenerateHtmlContent({ prompt, systemInstruction, model }: any): Promise<string> {
    // Fix: Use the provided model to select the correct Gemini model, making the function more flexible.
    const geminiModel = (model === 'canvasai' || model === 'conseilsai' || !model) ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });
    return response.text;
}

// FIX: Add `negativePrompt` to the function parameters and use it to construct the final prompt.
async function internalGenerateImage({ prompt, model, style, format, aspectRatio, imageGenerationInstruction, negativePrompt }: any): Promise<{ data: string; mimeType: string; }> {
    const qualityPrompt = model === 'faceai-pro' || model === 'faceai-max'
        ? 'haute qualité, 4k, hyper-détaillé, photoréaliste'
        : '';

    const stylePrompt = style !== 'none' ? `style ${style.replace('-', ' ')}` : '';
    const userInstruction = imageGenerationInstruction.trim();

    const mainPrompt = [
        prompt,
        stylePrompt,
        qualityPrompt,
        userInstruction
    ].filter(Boolean).join(', ');
    
    const finalPrompt = negativePrompt?.trim()
        ? `${mainPrompt}, negative_prompt: [${negativePrompt.trim()}]`
        : mainPrompt;
    
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

// Fix: Add implementation for generating a flash question.
async function internalGenerateFlashQuestion({ level, systemInstruction, model }: { level: string; systemInstruction: string; model: FlashAiModel }): Promise<Question> {
    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            questionText: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
        },
        required: ['questionText', 'options', 'correctAnswer', 'explanation']
    };

    const prompt = `Génère une seule question flash de type QCM (avec exactement 4 options) pour le niveau ${level}. Le sujet peut être n'importe quelle matière du Brevet des collèges. Fournis une explication pour la bonne réponse.`;
    
    const geminiModel = model === 'flashai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';

    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: questionSchema,
            systemInstruction: systemInstruction,
        }
    });
    
    return JSON.parse(response.text);
}

// Fix: Add implementation for generating a planning schedule.
// FIX: Add `todayDate` to the function parameters and use it to construct a more context-aware prompt.
async function internalGeneratePlanning({ task, dueDate, todayDate, systemInstruction, model }: { task: string; dueDate: string; todayDate: string; systemInstruction: string; model: PlanningAiModel }): Promise<Planning> {
    const planningSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            schedule: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING, description: "Date au format YYYY-MM-DD" },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['date', 'tasks']
                }
            }
        },
        required: ['title', 'schedule']
    };

    // FIX: Update the prompt to include today's date for better context and scheduling logic.
    const prompt = `La date d'aujourd'hui est le ${new Date(todayDate + 'T00:00:00Z').toLocaleDateString('fr-FR', { timeZone: 'UTC' })}. Crée un planning de révision pour la tâche suivante : "${task}". La date limite est le ${dueDate}. Le planning doit commencer à partir d'aujourd'hui ou d'un jour futur, jamais dans le passé. Décompose la tâche en étapes logiques et répartis-les sur les jours disponibles jusqu'à la date limite. Le planning doit être réaliste. Assure-toi que les dates dans le JSON sont au format YYYY-MM-DD.`;

    const geminiModel = model === 'planningai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: planningSchema,
            systemInstruction: systemInstruction,
        }
    });
    
    return JSON.parse(response.text);
}

async function internalGenerateConseils({ subject, level, systemInstruction, model }: { subject: string; level: string; systemInstruction: string; model: ConseilsAiModel }): Promise<string> {
    const prompt = `Génère des conseils et des stratégies de révision pour la matière "${subject}" au niveau "${level}". La réponse doit être formatée en HTML simple (<h1>, <h2>, <p>, <ul>, <li>, <strong>) pour être affichée directement. Fournis des conseils pratiques et actionnables.`;
    const geminiModel = model === 'conseilsai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction || "Tu es un conseiller pédagogique expert qui aide les élèves à optimiser leurs révisions.",
        }
    });
    return response.text;
}

async function internalGenerateWithSearch({ history, currentParts }: { history: ChatMessage[], currentParts: ChatPart[] }) {
    const contents = history.map(m => ({
        role: m.role,
        parts: m.parts.map(p => p.text ? ({text: p.text}) : ({inlineData: {data: p.image!.data, mimeType: p.image!.mimeType}}))
    }));

    contents.push({
        role: 'user',
        parts: currentParts.map(p => p.text ? ({text: p.text}) : ({inlineData: {data: p.image!.data, mimeType: p.image!.mimeType}}))
    });
    
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       // @ts-ignore
       contents: contents,
       config: {
         tools: [{googleSearch: {}}],
       },
    });
    
    // We need to return the full response object, not just text, to get grounding metadata
    return {
        text: response.text,
        candidates: response.candidates,
    };
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
            
            case 'generateFlashQuestion':
                const question = await internalGenerateFlashQuestion(payload);
                return NextResponse.json(question);

            case 'generatePlanning':
                const planning = await internalGeneratePlanning(payload);
                return NextResponse.json(planning);

            case 'generateConseils':
                const conseils = await internalGenerateConseils(payload);
                return NextResponse.json({ html: conseils });

            case 'generateWithSearch':
                const searchResult = await internalGenerateWithSearch(payload);
                return NextResponse.json(searchResult);

            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}