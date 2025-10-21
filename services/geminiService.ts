import { GoogleGenAI, Type, Chat, Part } from "@google/genai";
import type {
    Quiz,
    Question,
    ImageModel,
    CanvasModel,
    Planning,
    FlashAiModel,
    PlanningAiModel,
    ConseilsAiModel,
    ChatMessage,
    ChatPart,
    GamesAiModel,
    PlanningTask,
    PlanningDay,
} from '../types';
import type { GenerateContentResponse, Content } from '@google/genai';

const apiKey = process.env.API_KEY;

if (!apiKey) {
    throw new Error(
        "The API_KEY environment variable is not set. " +
        "Please ensure it is correctly configured in your deployment environment."
    );
}

const ai = new GoogleGenAI({ apiKey });

function ensureText(response: { text?: string }): string {
    const text = response.text?.trim();
    if (!text) {
        throw new Error('The model did not return any text content.');
    }
    return text;
}

function ensureImageBytes(response: { generatedImages?: { image?: { imageBytes?: string } }[] }, format: 'jpeg' | 'png'): { data: string; mimeType: string } {
    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
        throw new Error('The model did not return any image data.');
    }
    return { data: imageBytes, mimeType: `image/${format}` };
}

export { ai, Type };

export const generateQuiz = async (
    subjectName: string,
    count: number,
    difficulty: string,
    level: string,
    customPrompt: string,
    systemInstruction: string,
): Promise<Quiz> => {
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

    const prompt = `Generate a ${count}-question quiz on the topic "${subjectName}" for the ${level} level, with ${difficulty} difficulty. ${customPrompt}. The questions should be multiple-choice with 4 answer options. Provide an explanation for each correct answer.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
            systemInstruction: systemInstruction,
        }
    });
    
    const text = ensureText(response);
    return JSON.parse(text);
};

export const generateHtmlContent = async (
    prompt: string,
    systemInstruction: string,
): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });
    return ensureText(response);
};

export const generateGame = async (subjectName: string, customPrompt: string, model: GamesAiModel, systemInstruction: string): Promise<string> => {
    const prompt = `Create a simple and fun educational game on the theme "${subjectName}" for a middle school student (Brevet level in France).
    User instruction: "${customPrompt}".
    The game must be a single, self-contained HTML file, with all CSS and JavaScript included in <style> and <script> tags.
    Do not use any external libraries or image URLs.
    The game should be playable, visually simple but pleasant, and include clear instructions.
    Examples of game types: a quiz with instant feedback, a memory matching game, a hangman game with subject-related terms, a drag-and-drop to associate concepts.
    Ensure the output is ONLY the full HTML code, starting with <!DOCTYPE html>.`;

    const geminiModel = (model === 'gamesai-pro' || model === 'gamesai-max') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction || "You are an expert educational game developer who creates interactive and fun learning experiences.",
        }
    });
    return ensureText(response);
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
    const qualityPrompt = model === 'faceai-pro' || model === 'faceai-max'
        ? 'high quality, 4k, hyper-detailed, photorealistic'
        : '';
    const stylePrompt = style !== 'none' ? `style ${style.replace('-', ' ')}` : '';
    const userInstruction = imageGenerationInstruction.trim();

    const mainPrompt = [prompt, stylePrompt, qualityPrompt, userInstruction].filter(Boolean).join(', ');
    
    const finalPrompt = negativePrompt?.trim() ? `${mainPrompt} --no ${negativePrompt.trim()}` : mainPrompt;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: `image/${format}`,
          aspectRatio: aspectRatio,
        },
    });

    return ensureImageBytes(response, format);
};

export const generateInteractivePage = async (
    prompt: string,
    model: CanvasModel,
    systemInstruction: string,
): Promise<string> => {
    const geminiModel = model === 'canvasai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const fullPrompt = `${prompt}. The output must be a single, complete, and valid HTML file, including CSS in a <style> tag and JavaScript in a <script> tag. Do not use external libraries. The code must be self-contained.`;

    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction || "You are an expert web developer who creates interactive web pages from descriptions. Your code must be clean, efficient, and contained in a single HTML file.",
        }
    });
    return ensureText(response);
};

export const generateFlashQuestion = async (
    level: string,
    systemInstruction: string,
    model: FlashAiModel
): Promise<Question> => {
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

    const prompt = `Generate a single multiple-choice flash question (with exactly 4 options) for the ${level} level. The topic can be any subject from the French Brevet curriculum. Provide an explanation for the correct answer.`;
    
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
    
    const text = ensureText(response);
    return JSON.parse(text);
};

export const generatePlanning = async (
    task: string,
    dueDate: string,
    todayDate: string,
    systemInstruction: string,
    model: PlanningAiModel,
): Promise<Planning> => {
    const planningSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            schedule: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                        tasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING }
                                },
                                required: ['text']
                            }
                        }
                    },
                    required: ['date', 'tasks']
                }
            }
        },
        required: ['title', 'schedule']
    };

    const prompt = `Today's date is ${new Date(todayDate + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' })}. Create a study schedule for the following task: "${task}". The deadline is ${dueDate}. The schedule must start from today or a future date, never in the past. Break down the task into logical steps and distribute them over the available days until the deadline. The schedule must be realistic. Ensure the dates in the JSON are in YYYY-MM-DD format.`;

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

    const text = ensureText(response);
    const parsed = JSON.parse(text);

    const scheduleWithTaskObjects: PlanningDay[] = parsed.schedule.map((day: { date: string, tasks: { text: string }[] }) => ({
        date: day.date,
        tasks: day.tasks.map((taskObj: { text: string }) => ({
            id: `task_${Date.now()}_${Math.random()}`,
            text: taskObj.text,
            isCompleted: false,
        }))
    }));

    return { ...parsed, schedule: scheduleWithTaskObjects };
};

export const generateConseils = async (
    subject: string,
    level: string,
    systemInstruction: string,
    model: ConseilsAiModel,
): Promise<string> => {
    const prompt = `Generate revision tips and strategies for the subject "${subject}" at the "${level}" level. The response should be formatted in simple HTML (<h1>, <h2>, <p>, <ul>, <li>, <strong>) to be displayed directly. Provide practical and actionable advice.`;

    const geminiModel = model === 'conseilsai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction || "You are an expert educational advisor who helps students optimize their study habits.",
        }
    });
    return ensureText(response);
};

export const generateContentWithSearch = async (history: ChatMessage[], currentParts: ChatPart[]): Promise<GenerateContentResponse> => {
    const contents: Content[] = history.map(m => ({
        role: m.role,
        parts: m.parts.map(p => p.text ? ({text: p.text}) : ({inlineData: {data: p.image!.data, mimeType: p.image!.mimeType}}))
    }));

    contents.push({
        role: 'user',
        parts: currentParts.map(p => p.text ? ({text: p.text}) : ({inlineData: {data: p.image!.data, mimeType: p.image!.mimeType}}))
    });

    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: contents,
       config: {
         tools: [{googleSearch: {}}],
       },
    });

    return response;
};

export const generateTitleForChat = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short, concise title (4-5 words max) for a discussion starting with this question: "${prompt}". Respond only with the title.`,
    });
    const text = ensureText(response);
    return text.replace(/"/g, '');
}

export const sendMessageStream = (
    history: ChatMessage[], 
    message: ChatPart[], 
    config: { aiModel: string; systemInstruction: string; userName: string, subscriptionPlan: string }
) => {
    const geminiHistory: { role: 'user' | 'model'; parts: Part[] }[] = history
        .filter(m => !m.isGenerating)
        .map(m => ({
            role: m.role,
            parts: m.parts.map(part => {
                if (part.image) {
                    return { inlineData: { data: part.image.data, mimeType: part.image.mimeType } };
                }
                return { text: part.text || "" };
            }).filter(p => p.text || p.inlineData) as Part[]
        }));

    const baseInstruction = "You are BrevetAI, an AI tutor specializing in helping students revise for the French 'Brevet des collèges' exam. Your answers should be educational, encouraging, and adapted to a 9th-grade level. Be concise and clear. You can use bullet points or examples to facilitate understanding. Feel free to ask questions to check the student's comprehension.";
    let finalInstruction = baseInstruction;
    if (config.subscriptionPlan !== 'free' && config.systemInstruction.trim()) {
        finalInstruction = `${config.systemInstruction.trim()}\n\n---\n\n${baseInstruction}`;
    }
    if (config.userName.trim()) {
        finalInstruction += `\n\nThe user's name is ${config.userName.trim()}. Address them by their first name in a friendly manner.`;
    }

    const modelConfig: any = { systemInstruction: finalInstruction };
    let geminiModelName: 'gemini-2.5-flash' | 'gemini-2.5-pro' = 'gemini-2.5-flash';
    if (config.aiModel === 'brevetai') {
        modelConfig.thinkingConfig = { thinkingBudget: 0 };
    } else if (config.aiModel === 'brevetai-max') {
        geminiModelName = 'gemini-2.5-pro';
    }
    
    const chat = ai.chats.create({
        model: geminiModelName,
        history: geminiHistory,
        config: modelConfig,
    });

    const messageForApi = message.map(p => p.image ? { inlineData: { data: p.image.data, mimeType: p.image.mimeType } } : { text: p.text || '' }) as Part[];
    return chat.sendMessageStream({ message: messageForApi });
};