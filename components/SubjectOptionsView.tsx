// Fix: Provide the implementation for the SubjectOptionsView component.
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Subject, SubscriptionPlan } from '../types';

interface SubjectOptionsViewProps {
  subject: Subject;
  onGenerateQuiz: (customPrompt: string, count: number, difficulty: string, level: string) => void;
  onGenerateExercises: (customPrompt: string, count: number, difficulty: string, level: string) => void;
  onBack: () => void;
  subscriptionPlan: SubscriptionPlan;
}

const OptionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full text-left p-6 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center space-x-5"
    >
        <div className="p-3 bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 dark:group-hover:text-sky-300 transition-colors duration-300">
                {title}
            </h3>
            <p className="text-slate-700 dark:text-slate-400 mt-1">{description}</p>
        </div>
    </button>
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
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`relative w-full rounded-xl bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg py-3 pl-4 pr-10 text-left shadow-md border border-white/20 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    disabled={disabled}
                >
                    <span className="block truncate">{renderOption ? renderOption(value) : value}</span>
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


export const SubjectOptionsView: React.FC<SubjectOptionsViewProps> = ({ subject, onGenerateQuiz, onGenerateExercises, onBack, subscriptionPlan }) => {
  const isFreePlan = subscriptionPlan === 'free';

  const [customPrompt, setCustomPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Moyen');
  const [level, setLevel] = useState<string>('Brevet');

  const ITEM_COUNTS = useMemo(() => {
    if (subscriptionPlan === 'max') return [5, 10, 15, 20, 25];
    if (subscriptionPlan === 'pro') return [5, 10, 15, 20];
    return [5]; // free
  }, [subscriptionPlan]);

  const [itemCount, setItemCount] = useState<number>(ITEM_COUNTS[0]);
  
  useEffect(() => {
    if (!ITEM_COUNTS.includes(itemCount)) {
        setItemCount(ITEM_COUNTS[0]);
    }
  }, [itemCount, ITEM_COUNTS]);

  const LEVELS = ['CM2', '6ème', '5ème', '4ème', '3ème', 'Brevet'];
  const DIFFICULTIES = ['Facile', 'Moyen', 'Difficile'] as const;

  const currentLevel = isFreePlan ? 'Brevet' : level;
  const currentDifficulty = isFreePlan ? 'Moyen' : difficulty;

  const handleGenerateQuizClick = () => {
    onGenerateQuiz(customPrompt, itemCount, currentDifficulty, currentLevel);
  };

  const handleGenerateExercisesClick = () => {
    onGenerateExercises(customPrompt, itemCount, currentDifficulty, currentLevel);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="relative text-center mb-10">
            <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/5 dark:bg-slate-800/60 hover:bg-slate-900/10 dark:hover:bg-slate-700/60 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100">
                {subject.name}
            </h1>
            <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">Que souhaitez-vous faire ?</p>
        </div>
        
        <div className="relative z-10 bg-black/5 dark:bg-slate-900/60 backdrop-blur-xl border border-white/10 dark:border-slate-800 rounded-3xl p-6 mb-8">
            <div className="mb-6">
                <label htmlFor="custom-prompt" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">
                    Instructions spécifiques (facultatif)
                </label>
                <textarea
                    id="custom-prompt"
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full p-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base placeholder-slate-500 dark:placeholder-slate-500 transition"
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
                    renderOption={(option) => `${option} questions`}
                />
                <StyledDropdown<string>
                    label="Niveau"
                    options={LEVELS}
                    value={currentLevel}
                    onChange={setLevel}
                    disabled={isFreePlan}
                />
                <StyledDropdown<'Facile' | 'Moyen' | 'Difficile'>
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
                title="Générer un Quiz"
                description={`Testez vos connaissances avec un quiz de ${itemCount} questions.`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                onClick={handleGenerateQuizClick}
            />
             <OptionCard
                title="Générer des Exercices"
                description={`Recevez une fiche de ${itemCount} exercices avec corrigés.`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                onClick={handleGenerateExercisesClick}
            />
        </main>
    </div>
  );
};