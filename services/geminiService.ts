import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz, Question, ImageModel, CanvasModel, Planning, FlashAiModel, PlanningAiModel, ConseilsAiModel, ChatMessage, ChatPart } from '../types';
import type { GenerateContentResponse } from '@google/genai';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error(
    "La variable d'environnement API_KEY n'est pas définie. " +
    "Veuillez vous assurer qu'elle est correctement configurée dans votre environnement de déploiement."
  );
}

const ai = new GoogleGenAI({ apiKey });

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
    return response.text;
};

export const generateGame = async (subjectName: string): Promise<string> => {
    const prompt = `Crée un jeu éducatif simple et amusant sur le thème "${subjectName}" pour un élève de niveau Brevet des collèges (France).
    Le jeu doit être un fichier HTML unique et autonome, avec tout le CSS et JavaScript inclus dans des balises <style> et <script>.
    N'utilise aucune bibliothèque externe ni d'URL d'image.
    Le jeu doit être jouable, visuellement simple mais agréable, et inclure des instructions claires.
    Exemples de types de jeux : un quiz avec feedback instantané, un jeu de paires (memory), un jeu de pendu avec des termes du sujet, un 'glisser-déposer' pour associer des concepts.
    Assure-toi que la sortie est SEULEMENT le code HTML complet, en commençant par <!DOCTYPE html>.`;

    return generateHtmlContent(prompt, "Tu es un développeur de jeux éducatifs expert qui crée des expériences d'apprentissage interactives et amusantes.");
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
        ? 'haute qualité, 4k, hyper-détaillé, photoréaliste'
        : '';
    const stylePrompt = style !== 'none' ? `style ${style.replace('-', ' ')}` : '';
    const userInstruction = imageGenerationInstruction.trim();

    const mainPrompt = [prompt, stylePrompt, qualityPrompt, userInstruction].filter(Boolean).join(', ');
    
    const finalPrompt = negativePrompt?.trim() ? `${mainPrompt}, negative_prompt: [${negativePrompt.trim()}]` : mainPrompt;
    
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
};

export const generateInteractivePage = async (
    prompt: string,
    model: CanvasModel,
    systemInstruction: string,
): Promise<string> => {
    const geminiModel = model === 'canvasai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const fullPrompt = `${prompt}. La sortie doit être un fichier HTML unique, complet et valide, incluant le CSS dans une balise <style> et le JavaScript dans une balise <script>. Ne pas utiliser de bibliothèques externes. Le code doit être autonome.`;

    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction || "Tu es un développeur web expert qui crée des pages web interactives à partir de descriptions. Ton code doit être propre, efficace et contenu dans un seul fichier HTML.",
        }
    });
    return response.text;
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
                        date: { type: Type.STRING, description: "Date au format YYYY-MM-DD" },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['date', 'tasks']
                }
            }
        },
        required: ['title', 'schedule']
    };

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
};

export const generateConseils = async (
    subject: string,
    level: string,
    systemInstruction: string,
    model: ConseilsAiModel,
): Promise<string> => {
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
};

export const generateContentWithSearch = async (history: ChatMessage[], currentParts: ChatPart[]): Promise<GenerateContentResponse> => {
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

    return response;
};