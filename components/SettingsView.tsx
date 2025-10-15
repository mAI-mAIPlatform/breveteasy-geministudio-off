import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { SubscriptionPlan, AiModel, ImageModel } from '../types';
import { AVATAR_ICONS, AVATAR_ICON_KEYS } from '../constants';
import { PremiumBadge } from './PremiumBadge';

type Theme = 'light' | 'dark' | 'system';

const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [feedbackName, setFeedbackName] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(10);
    const [feedbackTerms, setFeedbackTerms] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackMessage.trim() || !feedbackTerms) {
            alert('Veuillez remplir le message et accepter les conditions.');
            return;
        }
        alert('Merci pour vos commentaires !');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 animate-fade-in">
            <div ref={modalRef} className="relative w-full max-w-lg bg-[#f0f2f5] dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-md z-10"
                    aria-label="Fermer la fenêtre"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">Laisser un commentaire</h2>
                <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="feedback-name-modal" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Nom / Prénom (facultatif)
                        </label>
                        <input
                            id="feedback-name-modal" type="text" value={feedbackName} onChange={(e) => setFeedbackName(e.target.value)}
                            className="mt-2 w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 placeholder-slate-400 dark:placeholder-slate-500"
                            placeholder="Votre nom..."
                        />
                    </div>

                    <div>
                        <label htmlFor="feedback-message-modal" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Message
                        </label>
                        <textarea
                            id="feedback-message-modal" rows={5} value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)}
                            className="mt-2 w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 resize-y placeholder-slate-400 dark:placeholder-slate-500"
                            placeholder="Votre avis, suggestions, ou signalement de bug..." required
                        />
                    </div>

                    <div>
                        <label htmlFor="feedback-rating-modal" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Note de l'application : {feedbackRating}/20
                        </label>
                        <input
                            id="feedback-rating-modal" type="range" min="0" max="20" value={feedbackRating}
                            onChange={(e) => setFeedbackRating(parseInt(e.target.value, 10))}
                            className="mt-2 w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                    </div>

                    <div className="flex items-center pt-2">
                        <input
                            id="feedback-terms-modal" type="checkbox" checked={feedbackTerms} onChange={(e) => setFeedbackTerms(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-800" required
                        />
                        <label htmlFor="feedback-terms-modal" className="ml-3 block text-sm text-slate-700 dark:text-slate-400">
                            J'accepte les conditions de Brevet' Easy.
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-semibold text-white bg-violet-400 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!feedbackTerms || !feedbackMessage.trim()}
                    >
                        Envoyer
                    </button>
                </form>
            </div>
        </div>
    );
};

interface SettingsViewProps {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    aiSystemInstruction: string;
    onAiSystemInstructionChange: (instruction: string) => void;
    subscriptionPlan: SubscriptionPlan;
    userName: string;
    onUserNameChange: (name: string) => void;
    userAvatar: string;
    onUserAvatarChange: (avatar: string) => void;
    defaultAiModel: AiModel;
    onDefaultAiModelChange: (model: AiModel) => void;
    defaultImageModel: ImageModel;
    onDefaultImageModelChange: (model: ImageModel) => void;
    imageGenerationInstruction: string;
    onImageGenerationInstructionChange: (instruction: string) => void;
    defaultItemCount: number;
    onDefaultItemCountChange: (count: number) => void;
    defaultDifficulty: 'Facile' | 'Normal' | 'Difficile' | 'Expert';
    onDefaultDifficultyChange: (difficulty: 'Facile' | 'Normal' | 'Difficile' | 'Expert') => void;
    defaultLevel: string;
    onDefaultLevelChange: (level: string) => void;
}

const SettingSection: React.FC<{ title: string; description: string; children: React.ReactNode; className?: string }> = ({ title, description, children, className }) => (
    <div className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-lg ${className ?? ''}`}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
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
            <label key={value} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${selectedValue === value ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:border-slate-400/50'}`}>
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

// StyledDropdown component copied from SubjectOptionsView.tsx
interface StyledDropdownProps<T extends string | number> {
    label: string;
    options: readonly T[];
    value: T;
    onChange: (value: T) => void;
    renderOption?: (option: T) => React.ReactNode;
    disabled?: boolean;
}

const StyledDropdown = <T extends string | number>({ label, options, value, onChange, renderOption, disabled = false }: StyledDropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelect = (option: T) => {
        onChange(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div>
            <label className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">{label}</label>
            <div className={`relative ${isOpen ? 'z-20' : ''}`} ref={dropdownRef}>
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`relative w-full rounded-xl bg-slate-100 dark:bg-slate-900/70 py-3 pl-4 pr-10 text-left shadow-sm border border-slate-300/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    disabled={disabled}
                >
                    <span className="block truncate text-slate-900 dark:text-slate-100">{renderOption ? renderOption(value) : value}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className={`h-5 w-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </button>
                {isOpen && !disabled && (
                    <ul
                        className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none"
                        tabIndex={-1}
                        role="listbox"
                    >
                        {options.map((option) => (
                            <li
                                key={String(option)}
                                onClick={() => handleSelect(option)}
                                className={`cursor-pointer select-none relative py-2 pl-4 pr-10 text-slate-900 dark:text-slate-100 hover:bg-indigo-100 dark:hover:bg-indigo-900/50`}
                                role="option"
                                aria-selected={value === option}
                            >
                                <span className={`block truncate ${value === option ? 'font-semibold' : 'font-normal'}`}>{renderOption ? renderOption(option) : option}</span>
                                {value === option && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-500 dark:text-sky-300">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};


export const SettingsView: React.FC<SettingsViewProps> = ({
    theme,
    onThemeChange,
    aiSystemInstruction,
    onAiSystemInstructionChange,
    subscriptionPlan,
    userName,
    onUserNameChange,
    userAvatar,
    onUserAvatarChange,
    defaultAiModel,
    onDefaultAiModelChange,
    defaultImageModel,
    onDefaultImageModelChange,
    imageGenerationInstruction,
    onImageGenerationInstructionChange,
    defaultItemCount,
    onDefaultItemCountChange,
    defaultDifficulty,
    onDefaultDifficultyChange,
    defaultLevel,
    onDefaultLevelChange,
}) => {
    const isFree = subscriptionPlan === 'free';
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const ITEM_COUNT_OPTIONS = useMemo(() => {
        if (subscriptionPlan === 'max') {
            return [5, 10, 15, 20, 25];
        }
         // Pro and Free users can't set a default count, so the options don't matter as much,
         // but we provide a sensible list.
        return [5, 10, 15, 20];
    }, [subscriptionPlan]);

    // This effect ensures that if the plan changes, the default item count is still a valid choice.
    useEffect(() => {
        if (subscriptionPlan !== 'max' && defaultItemCount > 5) {
             onDefaultItemCountChange(5);
        } else if (!ITEM_COUNT_OPTIONS.includes(defaultItemCount)) {
            onDefaultItemCountChange(ITEM_COUNT_OPTIONS[0]);
        }
    }, [subscriptionPlan, defaultItemCount, onDefaultItemCountChange, ITEM_COUNT_OPTIONS]);


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

    const LEVELS = ['CM2', '6ème', '5ème', '4ème', '3ème', 'Brevet'];
    const DIFFICULTIES = ['Facile', 'Normal', 'Difficile', 'Expert'] as const;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-10">Paramètres</h1>
            <div className="space-y-8">
                <SettingSection className="z-[70]" title="Apparence" description="Choisissez le thème visuel de l'application.">
                    <RadioGroup name="theme" options={themeOptions} selectedValue={theme} onChange={onThemeChange} />
                </SettingSection>

                <SettingSection className="z-[60]" title="Profil" description="Ces informations permettent de personnaliser votre expérience.">
                     <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Votre prénom
                        </label>
                        <input
                            id="user-name"
                            type="text"
                            value={userName}
                            onChange={(e) => onUserNameChange(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
                            placeholder="Entrez votre prénom..."
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Votre avatar
                        </label>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                             {AVATAR_ICON_KEYS.map(key => (
                                <button 
                                    key={key} 
                                    onClick={() => onUserAvatarChange(key)}
                                    className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 aspect-square border-2 ${userAvatar === key ? 'bg-indigo-500/80 border-indigo-500 text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:border-indigo-400 text-slate-700 dark:text-slate-300'}`}
                                    aria-label={`Select icon ${key}`}
                                >
                                    {React.cloneElement(AVATAR_ICONS[key], { className: "w-7 h-7" })}
                                </button>
                            ))}
                        </div>
                    </div>
                </SettingSection>

                <SettingSection className="z-[50]" title="Personnalisation de l'IA" description="Modifiez le comportement de l'IA pour qu'elle corresponde à vos besoins.">
                    <div className="relative">
                        <label htmlFor="ai-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Instruction système pour BrevetAI
                        </label>
                        <textarea
                            id="ai-instruction"
                            rows={4}
                            value={aiSystemInstruction}
                            onChange={(e) => onAiSystemInstructionChange(e.target.value)}
                            className={`w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`}
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

                <SettingSection className="z-[40]" title="Paramètres de génération par défaut" description="Choisissez les options par défaut pour la génération de contenu.">
                    <div className="relative">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StyledDropdown<string>
                                label="Niveau"
                                options={LEVELS}
                                value={defaultLevel}
                                onChange={onDefaultLevelChange}
                                disabled={subscriptionPlan !== 'max'}
                            />
                            <StyledDropdown<'Facile' | 'Normal' | 'Difficile' | 'Expert'>
                                label="Difficulté"
                                options={DIFFICULTIES}
                                value={defaultDifficulty}
                                onChange={onDefaultDifficultyChange}
                                disabled={subscriptionPlan !== 'max'}
                            />
                             <StyledDropdown<number>
                                label="Nombre d'éléments"
                                options={ITEM_COUNT_OPTIONS}
                                value={defaultItemCount}
                                onChange={onDefaultItemCountChange}
                                renderOption={(option) => `${option} élément${option > 1 ? 's' : ''}`}
                                disabled={subscriptionPlan !== 'max'}
                            />
                        </div>
                        {subscriptionPlan !== 'max' && <PremiumBadge requiredPlan="max" />}
                    </div>
                </SettingSection>
                
                 <SettingSection className="z-[30]" title="Génération d'images" description="Personnalisez le comportement de FaceAI.">
                    <div className="relative">
                        <label htmlFor="image-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Instruction de style globale
                        </label>
                        <textarea
                            id="image-instruction"
                            rows={3}
                            value={imageGenerationInstruction}
                            onChange={(e) => onImageGenerationInstructionChange(e.target.value)}
                             className={`w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`}
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

                <SettingSection className="z-[20]" title="À propos" description="Informations sur l'application et les mises à jour.">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">26-3.0</span>
                        <a 
                            href="https://github.com/mAI-mAIPlatform/breveteasy-geministudio-off/releases/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                        >
                            Notes de version
                        </a>
                    </div>
                </SettingSection>
                
                <SettingSection className="z-[10]" title="Commentaires" description="Aidez-nous à améliorer Brevet' Easy en nous envoyant vos retours.">
                   <button
                        onClick={() => setIsFeedbackModalOpen(true)}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
                    >
                        Laisser un commentaire
                    </button>
                </SettingSection>

            </div>

            {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}
        </div>
    );
};