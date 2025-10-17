// Fix: Provide the implementation for the SubjectOptionsView component.
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Subject, SubscriptionPlan } from '../types';
import { PremiumBadge } from './PremiumBadge';

interface SubjectOptionsViewProps {
  subject: Subject;
  onGenerateQuiz: (customPrompt: string, count: number, difficulty: string, level: string) => void;
  onGenerateExercises: (customPrompt: string, count: number, difficulty: string, level: string) => void;
  onGenerateCours: (customPrompt: string, count: number, difficulty: string, level: string) => void;
  onGenerateFicheRevisions: (customPrompt: string, count: number, difficulty: string, level: string) => void;
  subscriptionPlan: SubscriptionPlan;
  defaultItemCount: number;
  defaultDifficulty: 'Facile' | 'Normal' | 'Difficile' | 'Expert';
  defaultLevel: string;
}

const OptionCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    onClick: () => void; 
    isProFeature?: boolean;
}> = ({ title, description, icon, onClick, isProFeature = false }) => (
    <div className="relative">
        <button
            onClick={onClick}
            disabled={isProFeature}
            className={`group w-full text-left p-6 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-lg transition-all duration-300 ease-in-out flex items-center space-x-5 ${
                isProFeature 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-2xl hover:-translate-y-1'
            }`}
        >
            <div className="p-3 bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className={`text-xl font-bold text-slate-900 dark:text-slate-100 ${!isProFeature && 'group-hover:text-indigo-500 dark:group-hover:text-sky-300 transition-colors duration-300'}`}>
                    {title}
                </h3>
                <p className="text-slate-700 dark:text-slate-400 mt-1">{description}</p>
            </div>
        </button>
        {isProFeature && (
             <PremiumBadge requiredPlan="pro" />
        )}
    </div>
);


// New StyledDropdown component
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


export const SubjectOptionsView: React.FC<SubjectOptionsViewProps> = ({ subject, onGenerateQuiz, onGenerateExercises, onGenerateCours, onGenerateFicheRevisions, subscriptionPlan, defaultItemCount, defaultDifficulty, defaultLevel }) => {
  const isFreePlan = subscriptionPlan === 'free';
  const isFicheRevisionsLocked = subscriptionPlan === 'free';

  const [customPrompt, setCustomPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'Facile' | 'Normal' | 'Difficile' | 'Expert'>(defaultDifficulty);
  const [level, setLevel] = useState<string>(defaultLevel);

  const ITEM_COUNTS = useMemo(() => {
    let counts: number[];
    if (subscriptionPlan === 'max') {
        counts = [5, 10, 15, 20, 25];
    } else if (subscriptionPlan === 'pro') {
        counts = [5, 10, 15, 20];
    } else {
        counts = [5];
    }
    
    // For paying users, if their custom default isn't in the standard list,
    // add it so their preference is respected and available as an option.
    if (subscriptionPlan !== 'free' && !counts.includes(defaultItemCount)) {
        counts.push(defaultItemCount);
        counts.sort((a, b) => a - b);
    }
    return counts;
  }, [subscriptionPlan, defaultItemCount]);

  const [itemCount, setItemCount] = useState<number>(defaultItemCount);
  
  useEffect(() => {
    if (!ITEM_COUNTS.includes(itemCount)) {
        setItemCount(ITEM_COUNTS[0]);
    }
  }, [itemCount, ITEM_COUNTS]);

  const LEVELS = ['CM2', '6ème', '5ème', '4ème', '3ème', 'Brevet'];
  const DIFFICULTIES = ['Facile', 'Normal', 'Difficile', 'Expert'] as const;

  const currentLevel = isFreePlan ? 'Brevet' : level;
  const currentDifficulty = isFreePlan ? 'Normal' : difficulty;

  const handleGenerateQuizClick = () => {
    onGenerateQuiz(customPrompt, itemCount, currentDifficulty, currentLevel);
  };

  const handleGenerateExercisesClick = () => {
    onGenerateExercises(customPrompt, itemCount, currentDifficulty, currentLevel);
  };
  
  const handleGenerateCoursClick = () => {
    onGenerateCours(customPrompt, itemCount, currentDifficulty, currentLevel);
  };

  const handleGenerateFicheRevisionsClick = () => {
    onGenerateFicheRevisions(customPrompt, itemCount, currentDifficulty, currentLevel);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="relative text-center mb-10">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">
                {subject.name}
            </h1>
        </div>
        
        <div className="relative z-10 bg-slate-100/60 dark:bg-black/40 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/50 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
            <div className="mb-6">
                <label htmlFor="custom-prompt" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">
                    Instructions spécifiques (facultatif)
                </label>
                <textarea
                    id="custom-prompt"
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full p-3 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 transition"
                    placeholder={`ex: "Concentre-toi sur la Première Guerre mondiale"`}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Laissez vide pour un contenu général sur le sujet.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StyledDropdown<number>
                    label="Nombre"
                    options={ITEM_COUNTS}
                    value={itemCount}
                    onChange={setItemCount}
                    renderOption={(option) => `${option} éléments`}
                />
                <StyledDropdown<string>
                    label="Niveau"
                    options={LEVELS}
                    value={currentLevel}
                    onChange={setLevel}
                    disabled={isFreePlan}
                />
                <StyledDropdown<'Facile' | 'Normal' | 'Difficile' | 'Expert'>
                    label="Difficulté"
                    options={DIFFICULTIES}
                    value={currentDifficulty}
                    onChange={setDifficulty}
                    disabled={isFreePlan}
                />
            </div>
        </div>


        <main className="space-y-6">
            <OptionCard
                title="Générer un quiz"
                description={`Testez vos connaissances avec un quiz de ${itemCount} questions.`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                onClick={handleGenerateQuizClick}
            />
             <OptionCard
                title="Générer des exercices"
                description={`Recevez une fiche de ${itemCount} exercices avec corrigés.`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}
                onClick={handleGenerateExercisesClick}
            />
            <OptionCard
                title="Générer un cours"
                description={`Obtenez une fiche de cours structurée sur ${itemCount} concepts clés.`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>}
                onClick={handleGenerateCoursClick}
                isProFeature={isFreePlan}
            />
            <OptionCard
                title="Générer une fiche de révisions"
                description="Un résumé des points clés à savoir pour le brevet."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                onClick={handleGenerateFicheRevisionsClick}
                isProFeature={isFicheRevisionsLocked}
            />
        </main>
    </div>
  );
};