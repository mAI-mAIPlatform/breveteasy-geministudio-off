import React, { useState } from 'react';
import type { SubscriptionPlan, AiModel, ImageModel } from '../types';

interface SettingsViewProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  aiSystemInstruction: string;
  onAiSystemInstructionChange: (instruction: string) => void;
  subscriptionPlan: SubscriptionPlan;
  userName: string;
  onUserNameChange: (name: string) => void;
  defaultAiModel: AiModel;
  onDefaultAiModelChange: (model: AiModel) => void;
  defaultImageModel: ImageModel;
  onDefaultImageModelChange: (model: ImageModel) => void;
  imageGenerationInstruction: string;
  onImageGenerationInstructionChange: (instruction: string) => void;
}

const FeedbackModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackMessage.trim()) return;
        
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            setIsSending(false);
            setFeedbackMessage('');
            alert("Merci pour votre retour ! Votre message a bien été envoyé.");
            onClose();
        }, 1000);
    };
    
    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
                style={{ animationFillMode: 'forwards' }}
            >
                <header className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Votre avis nous intéresse</h3>
                     <button onClick={onClose} title="Fermer" className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-slate-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <p className="text-slate-700 dark:text-slate-400 mb-4">
                        Partagez vos suggestions, signalez un bug ou donnez simplement votre avis sur l'application.
                    </p>
                    <textarea
                        rows={6}
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition"
                        placeholder="Écrivez votre message ici..."
                        required
                    />
                    <div className="flex justify-end items-center gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-black/10 dark:hover:bg-slate-700/50 transition-colors">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!feedbackMessage.trim() || isSending}
                            className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSending ? 'Envoi...' : 'Envoyer'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
            `}</style>
        </div>
    );
};


export const SettingsView: React.FC<SettingsViewProps> = ({ theme, onThemeChange, aiSystemInstruction, onAiSystemInstructionChange, subscriptionPlan, userName, onUserNameChange, defaultAiModel, onDefaultAiModelChange, defaultImageModel, onDefaultImageModelChange, imageGenerationInstruction, onImageGenerationInstructionChange }) => {
  const isCustomInstructionDisabled = subscriptionPlan === 'free';
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <header className="text-center pb-4 border-b border-white/20 dark:border-slate-700 mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Paramètres</h2>
        </header>
        
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Thème d'affichage</h3>
                <div className="flex space-x-2 rounded-xl bg-black/10 dark:bg-slate-800 p-1">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => onThemeChange(t)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        theme === t
                            ? 'bg-white dark:bg-slate-950 text-indigo-500 dark:text-sky-300 shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        {t === 'light' ? 'Clair' : t === 'dark' ? 'Sombre' : 'Système'}
                    </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Mon Prénom</h3>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => onUserNameChange(e.target.value)}
                    className="w-full p-3 bg-white/20 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base placeholder-slate-600 dark:placeholder-slate-500 transition"
                    placeholder="Ex: Jean"
                />
                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Indiquez votre prénom pour que BrevetAI puisse s'adresser à vous personnellement.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Modèle IA par défaut</h3>
                <div className="flex space-x-2 rounded-xl bg-black/10 dark:bg-slate-800 p-1">
                    {(['brevetai', 'brevetai-plus'] as const).map((model) => (
                    <button
                        key={model}
                        onClick={() => onDefaultAiModelChange(model)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        defaultAiModel === model
                            ? 'bg-white dark:bg-slate-950 text-indigo-500 dark:text-sky-300 shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        {model === 'brevetai' ? 'BrevetAI' : 'BrevetAI +'}
                    </button>
                    ))}
                </div>
                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Choisissez le modèle à utiliser pour démarrer une nouvelle discussion.
                </p>
            </div>

            <div className="relative">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Instructions pour BrevetAI</h3>
                <textarea
                    rows={4}
                    value={aiSystemInstruction}
                    onChange={(e) => onAiSystemInstructionChange(e.target.value)}
                    className={`w-full p-3 bg-white/20 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base placeholder-slate-600 dark:placeholder-slate-500 transition ${isCustomInstructionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Ex: 'Sois toujours très encourageant et utilise un langage simple.' ou 'Fais-moi des résumés en 3 points-clés.'"
                    disabled={isCustomInstructionDisabled}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Cette instruction sera appliquée à toutes les futures interactions avec BrevetAI (quiz, exercices et chat).
                </p>
                {isCustomInstructionDisabled && (
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl" title="Fonctionnalité Pro / Max">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 text-sm font-bold rounded-full shadow-lg">
                            <span>Fonctionnalité Pro / Max</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Modèle d'image par défaut</h3>
                <div className="flex space-x-2 rounded-xl bg-black/10 dark:bg-slate-800 p-1">
                    {(['face', 'face-plus'] as const).map((model) => (
                    <button
                        key={model}
                        onClick={() => onDefaultImageModelChange(model)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        defaultImageModel === model
                            ? 'bg-white dark:bg-slate-950 text-indigo-500 dark:text-sky-300 shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        {model === 'face' ? 'Face' : 'Face +'}
                    </button>
                    ))}
                </div>
                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Choisissez le modèle pour la génération d'images. Face+ peut offrir de meilleurs résultats.
                </p>
            </div>

            <div className="relative">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Instructions pour la génération d'images</h3>
                <textarea
                    rows={4}
                    value={imageGenerationInstruction}
                    onChange={(e) => onImageGenerationInstructionChange(e.target.value)}
                    className={`w-full p-3 bg-white/20 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base placeholder-slate-600 dark:placeholder-slate-500 transition ${isCustomInstructionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Ex: 'style art numérique, couleurs vives' ou 'photo réaliste, en noir et blanc'."
                    disabled={isCustomInstructionDisabled}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Cette instruction sera ajoutée au début de toutes vos futures demandes de génération d'images.
                </p>
                {isCustomInstructionDisabled && (
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl" title="Fonctionnalité Pro / Max">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 text-sm font-bold rounded-full shadow-lg">
                            <span>Fonctionnalité Pro / Max</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-white/20 dark:border-slate-700 my-6"></div>

            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Support & Commentaires</h3>
                <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="w-full text-left p-4 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm hover:bg-white/30 dark:hover:bg-slate-700/80 transition-colors flex items-center justify-between"
                >
                    <span>Envoyer un commentaire</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
      </div>
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
};

export default SettingsView;