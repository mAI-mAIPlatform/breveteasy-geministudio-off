import React from 'react';
import type { SubscriptionPlan, AiModel, ImageModel } from '../types';
import { PremiumBadge } from './PremiumBadge';

type Theme = 'light' | 'dark' | 'system';

interface SettingsViewProps {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
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

const SettingSection: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 dark:border-slate-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 mb-6">{description}</p>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const RadioGroup: React.FC<{
    options: { value: string; label: string; icon?: React.ReactNode }[];
    selectedValue: string;
    onChange: (value: any) => void;
    name: string;
}> = ({ options, selectedValue, onChange, name }) => (
    <div className="flex flex-wrap gap-3">
        {options.map(({ value, label, icon }) => (
            <label key={value} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${selectedValue === value ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/20 dark:bg-slate-800/60 border-transparent hover:border-slate-400/50'}`}>
                <input
                    type="radio"
                    name={name}
                    value={value}
                    checked={selectedValue === value}
                    onChange={() => onChange(value)}
                    className="sr-only"
                />
                {icon}
                <span className="font-semibold text-sm">{label}</span>
            </label>
        ))}
    </div>
);


export const SettingsView: React.FC<SettingsViewProps> = ({
    theme,
    onThemeChange,
    aiSystemInstruction,
    onAiSystemInstructionChange,
    subscriptionPlan,
    userName,
    onUserNameChange,
    defaultAiModel,
    onDefaultAiModelChange,
    defaultImageModel,
    onDefaultImageModelChange,
    imageGenerationInstruction,
    onImageGenerationInstructionChange,
}) => {
    const isFree = subscriptionPlan === 'free';

    const themeOptions = [
        { value: 'light', label: 'Clair', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { value: 'dark', label: 'Sombre', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> },
        { value: 'system', label: 'Système', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    ];
    
    const aiModelOptions = [
        { value: 'brevetai', label: 'BrevetAI' },
        { value: 'brevetai-plus', label: 'BrevetAI +' },
    ];
    
    const imageModelOptions = [
        { value: 'faceai', label: 'FaceAI' },
        { value: 'faceai-plus', label: 'FaceAI +' },
    ];


    return (
        <div className="w-full max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-slate-900 dark:text-slate-100 mb-10">Paramètres</h1>
            <div className="space-y-8">
                <SettingSection title="Apparence" description="Choisissez le thème visuel de l'application.">
                    <RadioGroup name="theme" options={themeOptions} selectedValue={theme} onChange={onThemeChange} />
                </SettingSection>

                <SettingSection title="Profil" description="Ces informations permettent de personnaliser votre expérience.">
                     <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Votre prénom
                        </label>
                        <input
                            id="user-name"
                            type="text"
                            value={userName}
                            onChange={(e) => onUserNameChange(e.target.value)}
                            className="w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
                            placeholder="Entrez votre prénom..."
                        />
                    </div>
                </SettingSection>

                <SettingSection title="Personnalisation de l'IA" description="Modifiez le comportement de l'IA pour qu'elle corresponde à vos besoins.">
                    <div className="relative">
                        <label htmlFor="ai-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Instruction système pour BrevetAI
                        </label>
                        <textarea
                            id="ai-instruction"
                            rows={4}
                            value={aiSystemInstruction}
                            onChange={(e) => onAiSystemInstructionChange(e.target.value)}
                            className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`}
                            placeholder="Ex: 'Explique les choses de manière très simple, comme si j'avais 10 ans.'"
                            disabled={isFree}
                        />
                         {isFree && <PremiumBadge requiredPlan="pro" />}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Modèle par défaut pour le chat
                        </label>
                        <RadioGroup name="aiModel" options={aiModelOptions} selectedValue={defaultAiModel} onChange={onDefaultAiModelChange} />
                    </div>
                </SettingSection>
                
                 <SettingSection title="Génération d'images" description="Personnalisez le comportement de FaceAI.">
                    <div className="relative">
                        <label htmlFor="image-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Instruction de style globale
                        </label>
                        <textarea
                            id="image-instruction"
                            rows={3}
                            value={imageGenerationInstruction}
                            onChange={(e) => onImageGenerationInstructionChange(e.target.value)}
                             className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`}
                            placeholder="Ex: 'Toutes les images doivent avoir un style cartoon.'"
                            disabled={isFree}
                        />
                         {isFree && <PremiumBadge requiredPlan="pro" />}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Modèle par défaut pour FaceAI
                        </label>
                        <RadioGroup name="imageModel" options={imageModelOptions} selectedValue={defaultImageModel} onChange={onDefaultImageModelChange} />
                    </div>
                </SettingSection>

            </div>
        </div>
    );
};
