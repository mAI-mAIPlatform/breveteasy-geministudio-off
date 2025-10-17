// Fix: Provide the implementation for the SubjectOptionsView component.
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Subject, SubscriptionPlan } from '@/lib/types';
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
                        tab