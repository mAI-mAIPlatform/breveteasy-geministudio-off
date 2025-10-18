import type { Quiz, ImageModel, CanvasModel, FlashAiModel, PlanningAiModel, ConseilsAiModel, Question, Planning } from '@/lib/types';

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
    // FIX: Add `negativePrompt` to the function signature.
    negativePrompt: string,
): Promise<{ data: string; mimeType: string; }> => {
    // FIX: Pass `negativePrompt` in the payload to the API.
    return callGeminiApi<{ data: string; mimeType: string; }>('generateImage', { prompt, model, style, format, aspectRatio, imageGenerationInstruction, negativePrompt });
};

// Fix: Add missing generateInteractivePage export
export const generateInteractivePage = async (
    prompt: string,
    model: CanvasModel,
    systemInstruction: string
): Promise<string> => {
    const fullPrompt = `${prompt}. La sortie doit être un fichier HTML unique, complet et valide, incluant le CSS dans une balise <style> et le JavaScript dans une balise <script>. Ne pas utiliser de bibliothèques externes. Le code doit être autonome.`;
    const result = await callGeminiApi<{ html: string }>('generateHtmlContent', { 
        prompt: fullPrompt, 
        systemInstruction: systemInstruction || "Tu es un développeur web expert qui crée des pages web interactives à partir de descriptions. Ton code doit être propre, efficace et contenu dans un seul fichier HTML.",
        model
    });
    return result.html;
};

// Fix: Add missing generateFlashQuestion export
export const generateFlashQuestion = async (
    level: string,
    systemInstruction: string,
    model: FlashAiModel
): Promise<Question> => {
    return callGeminiApi<Question>('generateFlashQuestion', { level, systemInstruction, model });
};

// Fix: Add missing generatePlanning export
export const generatePlanning = async (
    task: string,
    dueDate: string,
    systemInstruction: string,
    model: PlanningAiModel,
): Promise<Planning> => {
    return callGeminiApi<Planning>('generatePlanning', { task, dueDate, systemInstruction, model });
};

// Fix: Add missing generateConseils export
export const generateConseils = async (
    subject: string,
    level: string,
    systemInstruction: string,
    model: ConseilsAiModel,
): Promise<string> => {
    const prompt = `Génère des conseils et des stratégies de révision pour la matière "${subject}" au niveau "${level}". La réponse doit être formatée en HTML simple (<h1>, <h2>, <p>, <ul>, <li>, <strong>) pour être affichée directement. Fournis des conseils pratiques et actionnables.`;
    const result = await callGeminiApi<{ html: string }>('generateHtmlContent', { 
        prompt, 
        systemInstruction: systemInstruction || "Tu es un conseiller pédagogique expert qui aide les élèves à optimiser leurs révisions.",
        model
    });
    return result.html;
};
