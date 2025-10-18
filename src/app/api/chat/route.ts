

import { GoogleGenAI } from "@google/genai";
import type { Chat, Part } from "@google/genai";
import type { ChatMessage, ChatPart, AiModel, SubscriptionPlan } from "@/lib/types";

if (!process.env.API_KEY) {
  throw new Error("Missing API_KEY environment variable");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function createChatInstance(history: ChatMessage[], model: AiModel, systemInstruction: string, userName: string, subscriptionPlan: SubscriptionPlan): Chat {
    const geminiHistory: { role: 'user' | 'model'; parts: Part[] }[] = history
        .filter(m => !m.isGenerating)
        .map(m => ({
            role: m.role,
            parts: m.parts.map(part => {
                if (part.image) {
                    return { inlineData: { data: part.image.data, mimeType: part.image.mimeType } };
                }
                return { text: part.text || "" };
            }).filter(p => p.text || p.inlineData)
        }));

    const baseInstruction = "Tu es BrevetAI, un tuteur IA spécialisé dans l'aide aux révisions pour le Brevet des collèges en France. Tes réponses doivent être pédagogiques, encourageantes et adaptées au niveau d'un élève de 3ème. Sois concis et clair. Tu peux utiliser des listes à puces ou des exemples pour faciliter la compréhension. N'hésite pas à poser des questions pour vérifier la compréhension de l'élève.";
    
    let finalInstruction = baseInstruction;
    if (subscriptionPlan !== 'free' && systemInstruction.trim()) {
        finalInstruction = `${systemInstruction.trim()}\n\n---\n\n${baseInstruction}`;
    }
    if (userName.trim()) {
        finalInstruction += `\n\nL'utilisateur s'appelle ${userName.trim()}. Adresse-toi à lui par son prénom de manière amicale.`;
    }
    
    const config: { systemInstruction: string; thinkingConfig?: { thinkingBudget: number } } = {
         systemInstruction: finalInstruction,
    };
    
    let geminiModelName: 'gemini-2.5-flash' | 'gemini-2.5-pro' = 'gemini-2.5-flash';

    if (model === 'brevetai') {
        config.thinkingConfig = { thinkingBudget: 0 };
    } else if (model === 'brevetai-max') {
        geminiModelName = 'gemini-2.5-pro';
    }
    
    return ai.chats.create({
        model: geminiModelName,
        history: geminiHistory,
        config,
    });
}

async function streamToUint8Array(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return chunks;
}


export async function POST(req: Request) {
    try {
        const { action, payload } = await req.json();

        if (action === 'generateTitle') {
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Génère un titre court et concis (4-5 mots maximum) pour une discussion qui commence par cette question : "${payload.prompt}". Réponds uniquement avec le titre.`,
            });
            return new Response(JSON.stringify({ title: response.text }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (action === 'sendMessage' || action === 'regenerate') {
            const { history, message, config, modification, useWebSearch } = payload;
            
            let parts: ChatPart[] = message.parts;
            const messageForApi = parts.map((p: any) => p.image ? { inlineData: { data: p.image.data, mimeType: p.image.mimeType } } : { text: p.text || '' });

            if (useWebSearch) {
                const fullHistory = history.map((m: ChatMessage) => ({ role: m.role, parts: m.parts.map(p => p.text ? ({text: p.text}) : ({inlineData: {data: p.image!.data, mimeType: p.image!.mimeType}})) }));
                
                const response = await ai.models.generateContent({
                   model: "gemini-2.5-flash",
                   contents: [...fullHistory, { role: 'user', parts: messageForApi }],
                   config: {
                     tools: [{googleSearch: {}}],
                   },
                });

                const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
                return new Response(JSON.stringify({ text: response.text, groundingMetadata }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }

            const chat = createChatInstance(history, config.aiModel, config.systemInstruction, config.userName, config.subscriptionPlan);
            
            if (action === 'regenerate') {
                 if (modification === 'longer' || modification === 'shorter') {
                    const instruction = modification === 'longer' 
                        ? "\n\n(Instruction pour l'IA : Régénère ta réponse précédente, mais en la rendant plus longue et plus détaillée.)"
                        : "\n\n(Instruction pour l'IA : Régénère ta réponse précédente, mais en la rendant plus courte et plus concise.)";
                    
                    let textPart = messageForApi.find((p: Part) => 'text' in p);
                    if (textPart && 'text' in textPart) {
                        textPart.text += instruction;
                    } else {
                        messageForApi.push({ text: instruction });
                    }
                }
            }


            const result = await chat.sendMessageStream({ message: messageForApi });
            
            // Convert Node.js stream to Web Stream
            const webStream = new ReadableStream({
              async start(controller) {
                for await (const chunk of result) {
                  const chunkText = chunk.text;
                  if (chunkText) {
                    controller.enqueue(new TextEncoder().encode(chunkText));
                  }
                }
                controller.close();
              },
            });

            return new Response(webStream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        return new Response(JSON.stringify({ message: 'Invalid action' }), { status: 400 });

    } catch (error: any) {
        console.error("Chat API Route Error:", error);
        return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred' }), { status: 500 });
    }
}