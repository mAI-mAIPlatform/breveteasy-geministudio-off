import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Subject, SubscriptionPlan } from '../types';
import { PremiumBadge } from './PremiumBadge';
import { useLocalization } from '../hooks/useLocalization';

interface SubjectOptionsViewProps {
  subject: Subject;
  onGenerateQuiz: (customPrompt: string, count: number, difficulty: string, level: string, useTimer: boolean, fileContents: string[]) => void;
  onGenerateExercises: (customPrompt: string, count: number, difficulty: string, level: string, fileContents: string[]) => void;
  onGenerateCours: (customPrompt: string, count: number, difficulty: string, level: string, fileContents: string[]) => void;
  onGenerateFicheRevisions: (customPrompt: string, count: number, difficulty: string, level: string, fileContents: string[]) => void;
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
    children?: React.ReactNode;
}> = ({ title, description, icon, onClick, isProFeature = false, children }) => (
    <div className="relative">
        <button
            onClick={onClick}
            disabled={isProFeature}
            className={`group w-full text-left p-6 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl shadow-lg transition-all duration-300 ease-in-out flex items-center space-x-5 ${
                isProFeature 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-2xl hover:-translate-y-1'
            }`}
        >
            <div className="p-3 bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 rounded-full">
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className={`text-xl font-bold text-slate-900 dark:text-slate-100 ${!isProFeature && 'group-hover:text-indigo-500 dark:group-hover:text-sky-300 transition-colors duration-300'}`}>
                    {title}
                </h3>
                <p className="text-slate-700 dark:text-slate-400 mt-1">{description}</p>
            </div>
            {children}
        </button>
        {isProFeature && (
             <PremiumBadge requiredPlan="pro" />
        )}
    </div>
);


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
  const { t } = useLocalization();
  const isFreePlan = subscriptionPlan === 'free';
  const isFicheRevisionsLocked = subscriptionPlan === 'free';

  const [customPrompt, setCustomPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'Facile' | 'Normal' | 'Difficile' | 'Expert'>(defaultDifficulty);
  const [level, setLevel] = useState<string>(defaultLevel);
  const [useTimer, setUseTimer] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileContents, setFileContents] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemCount, setItemCount] = useState<number>(() => {
    const defaultCount = defaultItemCount;
    if (defaultCount > 10) return 10;
    if (defaultCount < 1) return 1;
    return defaultCount;
  });

  const LEVELS = ['CM2', '6ème', '5ème', '4ème', '3ème', 'Brevet'];
  const DIFFICULTIES = ['Facile', 'Normal', 'Difficile', 'Expert'] as const;

  const currentLevel = isFreePlan ? 'Brevet' : level;
  const currentDifficulty = isFreePlan ? 'Normal' : difficulty;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const files = Array.from(event.target.files);
        setUploadedFiles(prev => [...prev, ...files]);
        try {
            const contents = await Promise.all(
                files.map((file: File) => {
                    if (file.type.startsWith('text/')) {
                        return file.text();
                    }
                    return Promise.resolve(`[Contenu du fichier non textuel '${file.name}' ignoré]`);
                })
            );
            setFileContents(prev => [...prev, ...contents]);
        } catch (error) {
            console.error("Error reading files:", error);
            alert("Erreur lors de la lecture d'un fichier.");
        }
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFileContents(prev => prev.filter((_, i) => i !== index));
  };


  const handleGenerateQuizClick = () => {
    onGenerateQuiz(customPrompt, itemCount, currentDifficulty, currentLevel, useTimer, fileContents);
  };

  const handleGenerateExercisesClick = () => {
    onGenerateExercises(customPrompt, itemCount, currentDifficulty, currentLevel, fileContents);
  };
  
  const handleGenerateCoursClick = () => {
    onGenerateCours(customPrompt, itemCount, currentDifficulty, currentLevel, fileContents);
  };

  const handleGenerateFicheRevisionsClick = () => {
    onGenerateFicheRevisions(customPrompt, itemCount, currentDifficulty, currentLevel, fileContents);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="relative text-center mb-10">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">
                {t(subject.nameKey)}
            </h1>
        </div>
        
        <div className="relative z-10 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
            <div className="mb-6">
                <label htmlFor="custom-prompt" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">
                    {t('subject_options_specific_instructions')}
                </label>
                <textarea
                    id="custom-prompt"
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full p-3 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 transition"
                    placeholder={t('subject_options_specific_instructions_placeholder')}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('subject_options_general_content_note')}</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 dark:border-slate-700/50">
                <label className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">
                    S'inspirer de fichiers (facultatif)
                </label>
                <div className="flex items-start gap-4">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        multiple 
                        accept="text/*,.md"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-white/20 dark:bg-slate-800/60 rounded-full shadow-md hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors"
                        title="Importer des fichiers"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                        {uploadedFiles.length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-400 h-12 flex items-center">Importez des cours, des exercices, etc.</p>
                        ) : (
                            uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 bg-black/5 dark:bg-slate-900/50 p-2 rounded-lg text-sm">
                                    <span className="truncate flex-1 text-slate-800 dark:text-slate-200">{file.name}</span>
                                    <button onClick={() => removeFile(index)} className="p-1 rounded-full hover:bg-red-500/20 text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/10 dark:border-slate-700/50">
                <StyledDropdown<string>
                    label={t('level')}
                    options={LEVELS}
                    value={currentLevel}
                    onChange={setLevel}
                    disabled={isFreePlan}
                />
                <StyledDropdown<'Facile' | 'Normal' | 'Difficile' | 'Expert'>
                    label={t('difficulty')}
                    options={DIFFICULTIES}
                    value={currentDifficulty}
                    onChange={setDifficulty}
                    disabled={isFreePlan}
                />
            </div>
             <div className="pt-6">
                <label htmlFor="item-count-slider" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">{t('settings_generation_item_count', { count: itemCount })}</label>
                <input
                    id="item-count-slider"
                    type="range"
                    min="1"
                    max="10"
                    value={itemCount}
                    onChange={(e) => setItemCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-300/50 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>
        </div>


        <main className="space-y-6">
            <OptionCard
                title={t('subject_options_generate_quiz')}
                description={t('subject_options_generate_quiz_desc', { count: itemCount })}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                onClick={handleGenerateQuizClick}
            >
                <div className="flex items-center gap-2 pl-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" id="timer-checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} className="h-5 w-5 rounded text-indigo-500 focus:ring-indigo-500 border-slate-400 dark:border-slate-500 bg-white/20 dark:bg-slate-900/40" />
                    <label htmlFor="timer-checkbox" className="text-sm font-semibold text-slate-800 dark:text-slate-300 select-none">Minuteur</label>
                </div>
            </OptionCard>
             <OptionCard
                title={t('subject_options_generate_exercises')}
                description={t('subject_options_generate_exercises_desc', { count: itemCount })}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}
                onClick={handleGenerateExercisesClick}
            />
            <OptionCard
                title={t('subject_options_generate_course')}
                description={t('subject_options_generate_course_desc', { count: itemCount })}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>}
                onClick={handleGenerateCoursClick}
                isProFeature={isFreePlan}
            />
            <OptionCard
                title={t('subject_options_generate_summary')}
                description={t('subject_options_generate_summary_desc')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                onClick={handleGenerateFicheRevisionsClick}
                isProFeature={isFicheRevisionsLocked}
            />
        </main>
    </div>
  );
};