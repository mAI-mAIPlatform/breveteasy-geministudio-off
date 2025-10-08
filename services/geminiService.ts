
import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

// FIX: Export the `ai` instance for use in other files.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "Une liste de 15 questions pour le quiz.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: {
                        type: Type.STRING,
                        description: "Le texte de la question."
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "Une liste de 4 réponses possibles, chacune étant une chaîne de caractères.",
                        items: { type: Type.STRING }
                    },
                    correctAnswer: {
                        type: Type.STRING,
                        description: "Le texte exact de la bonne réponse parmi les options."
                    },
                    explanation: {
                        type: Type.STRING,
                        description: "Une explication brève et pédagogique de la raison pour laquelle la réponse correcte est la bonne."
                    }
                },
                required: ["questionText", "options", "correctAnswer", "explanation"]
            }
        }
    },
    required: ["questions"]
};

export const generateQuiz = async (subject: string): Promise<Quiz | null> => {
    try {
        const prompt = `Génère un quiz de 15 questions à choix multiples pour le niveau Brevet des collèges en France sur le sujet : ${subject}. Pour chaque question, fournis 4 options de réponse distinctes, le texte exact de la bonne réponse, et une explication brève et pédagogique de la bonne réponse. Les questions doivent être pertinentes, variées et couvrir des points clés du programme officiel.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
                temperature: 0.7,
            }
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson.questions && Array.isArray(parsedJson.questions) && parsedJson.questions.length > 0) {
             const validatedQuiz: Quiz = {
                subject: subject,
                questions: parsedJson.questions.map((q: any) => ({
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation
                }))
             };
             return validatedQuiz;
        } else {
            throw new Error("Invalid quiz format received from API");
        }

    } catch (error) {
        console.error("Error generating quiz for subject " + subject + ":", error);
        return null;
    }
};

export const generateExercises = async (subject: string): Promise<string | null> => {
    try {
        const prompt = `Génère 5 exercices variés de type Brevet des collèges en France sur le sujet : ${subject}.
Pour chaque exercice, fournis un énoncé clair, des questions précises, et un corrigé détaillé.
Le format de la réponse doit être en Markdown, bien structuré, avec des titres pour chaque exercice et pour les sections "Énoncé" et "Corrigé".
Les exercices doivent couvrir des aspects importants du programme. Par exemple:
- Pour le Français : analyse de texte, questions de grammaire, réécriture.
- Pour les Mathématiques : résolution de problèmes, exercices d'algèbre, géométrie.
- Pour l'Histoire-Géo-EMC : étude de document, question de connaissance, développement construit.
- Pour les Sciences : analyse d'expérience, restitution de connaissances, application de formules.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.6,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating exercises for subject " + subject + ":", error);
        return null;
    }
};
