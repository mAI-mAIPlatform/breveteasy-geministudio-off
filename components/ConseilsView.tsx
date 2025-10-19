import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SUBJECTS } from '../constants';
import type { SubscriptionPlan, ConseilsAiModel } from '../types';
import { PremiumBadge } from './PremiumBadge';
import { useLocalization } from '../hooks/useLocalization';

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const ShareIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;

const ShareConseilsModal: React.FC<{ isOpen: boolean; onClose: () => void; conseils: string; subject: string; }> = ({ isOpen, onClose, conseils, subject }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const stripHtml = (html: string): string => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const shareText = `Voici quelques super conseils pour réviser en ${subject} sur Brevet' Easy ! 🚀\n\n${stripHtml(conseils)}\n\n#Brevet2025 #Révisions #IA`;
    const encodedShareText = encodeURIComponent(shareText);
    const shareUrl = "https://gemini.google.com/studio"; // placeholder
    const encodedUrl = encodeURIComponent(shareUrl);
    const shareTitle = `Conseils de révision pour ${subject} sur Brevet' Easy`;
    const encodedTitle = encodeURIComponent(shareTitle);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedShareText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShareText}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${shareText}`,
    };
    
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        const handleClickOutside = (event: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div ref={modalRef} className="relative w-full max-w-md bg-[#f0f2f5] dark:bg-slate-900/80 dark:backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8">
                <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-md z-10" aria-label="Fermer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">Partager ces conseils</h2>
                
                <div className="p-4 bg-white/50 dark:bg-slate-800/60 rounded-xl mb-6 max-h-40 overflow-y-auto">
                    <p className="text-slate-800 dark:text-slate-300 text-sm whitespace-pre-wrap">{shareText}</p>
                </div>

                 <button onClick={handleCopy} className="w-full flex items-center justify-center p-3 mb-6 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-700/60 transition-colors">
                    {copied ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    {copied ? 'Copié !' : 'Copier le texte'}
                </button>
                
                <div className="flex justify-center items-center gap-4">
                     <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-black/80 text-white rounded-full hover:bg-black/100 transition-colors" title="Partager sur X">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:bg-[#166fe5] transition-colors" title="Partager sur Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" /></svg>
                    </a>
                    <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#0A66C2] text-white rounded-full hover:bg-[#0077B5] transition-colors" title="Partager sur LinkedIn">
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zm-11 5H5v10h3V8zm-1.5-2.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18 18h-3v-4.5c0-1.04-.02-2.37-1.45-2.37-1.45 0-1.67 1.13-1.67 2.29V18h-3V8h2.88v1.31h.04c.4-.76 1.38-1.55 2.84-1.55 3.03 0 3.59 1.99 3.59 4.58V18z"/></svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

interface ConseilsViewProps {
    onGenerate: (subject: string, level: string, model: ConseilsAiModel) => void;
    isLoading: boolean;
    conseils: string | null;
    onClear: () => void;
    subscriptionPlan: SubscriptionPlan;
    defaultConseilsAiModel: ConseilsAiModel;
}

const LEVELS = ['CM2', '6ème', '5ème', '4ème', '3ème', 'Brevet'];

// Dropdown component for UI consistency
interface StyledDropdownProps {
    label: string;
    options: { value: string, label: string }[];
    value: string;
    onChange: (value: string) => void;
}

const StyledDropdown: React.FC<StyledDropdownProps> = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="relative w-full rounded-xl bg-slate-100 dark:bg-slate-900/70 py-3 pl-4 pr-10 text-left shadow-sm border border-slate-300/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <span className="block truncate text-slate-900 dark:text-slate-100">{options.find(o => o.value === value)?.label || ''}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className={`h-5 w-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </span>
                </button>
                {isOpen && (
                    <ul className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5">
                        {options.map((option) => (
                            <li key={option.value} onClick={() => { onChange(option.value); setIsOpen(false); }} className="cursor-pointer select-none relative py-2 pl-4 pr-10 text-slate-900 dark:text-slate-100 hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                                <span className="block truncate">{option.label}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const ModelSelector: React.FC<{
    selectedModel: ConseilsAiModel;
    onModelChange: (model: ConseilsAiModel) => void;
    subscriptionPlan: SubscriptionPlan;
}> = ({ selectedModel, onModelChange, subscriptionPlan }) => {
    const modelNames: Record<ConseilsAiModel, string> = {
        conseilsai: 'ConseilsAI',
        'conseilsai-pro': 'ConseilsAI Pro',
        'conseilsai-max': 'ConseilsAI Max',
    };
    const models = useMemo(() => [
        { id: 'conseilsai' as ConseilsAiModel, requiredPlan: 'free' as const },
        { id: 'conseilsai-pro' as ConseilsAiModel, requiredPlan: 'pro' as const },
        { id: 'conseilsai-max' as ConseilsAiModel, requiredPlan: 'max' as const },
    ], []);

    return (
        <div>
            <label className="block text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">Modèle</label>
            <div className="flex flex-wrap gap-2">
                {models.map(modelInfo => {
                    const isLocked = (modelInfo.requiredPlan === 'pro' && subscriptionPlan === 'free') || (modelInfo.requiredPlan === 'max' && subscriptionPlan !== 'max');
                    const isSelected = selectedModel === modelInfo.id;
                    return (
                        <div key={modelInfo.id} className="relative flex-1">
                            <button
                                onClick={() => !isLocked && onModelChange(modelInfo.id)}
                                disabled={isLocked}
                                className={`w-full text-center px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold ${
                                    isLocked ? 'opacity-60 cursor-not-allowed bg-white/10 dark:bg-slate-800/40 border-transparent' :
                                    isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/20 dark:bg-slate-800/60 border-transparent hover:border-slate-400/50'
                                }`}
                            >
                                {modelNames[modelInfo.id]}
                            </button>
                            {isLocked && <PremiumBadge requiredPlan={modelInfo.requiredPlan as 'pro' | 'max'} size="small" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const ConseilsView: React.FC<ConseilsViewProps> = ({ onGenerate, isLoading, conseils, onClear, subscriptionPlan, defaultConseilsAiModel }) => {
    // Fix: Import useLocalization to translate subject keys.
    const { t } = useLocalization();
    // Fix: Use translated subject name for options and initial state.
    const subjectOptions = SUBJECTS.map(s => ({ value: t(s.nameKey), label: t(s.nameKey) }));
    // Fix: Initialize state with translated name from subjectOptions.
    const [subject, setSubject] = useState(subjectOptions[0].value);
    const [level, setLevel] = useState('Brevet');
    const [model, setModel] = useState<ConseilsAiModel>(defaultConseilsAiModel);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const levelOptions = LEVELS.map(l => ({ value: l, label: l }));

    const handleGenerate = () => {
        onGenerate(subject, level, model);
    };
    
    const stripHtml = (html: string): string => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };
    
    const handleCopy = () => {
        if (!conseils) return;
        const text = stripHtml(conseils);
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = (format: 'html' | 'txt') => {
        if (!conseils) return;
        
        const content = format === 'txt' ? stripHtml(conseils) : conseils;
        const blob = new Blob([content], { type: format === 'txt' ? 'text/plain;charset=utf-8' : 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `conseils_${subject.replace(/\s/g, '_')}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="text-center p-8">
                <div className="w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-slate-600 dark:text-slate-400">L'IA prépare ses meilleurs conseils...</p>
            </div>
        );
    }

    if (conseils) {
        return (
            <>
                <div className="w-full max-w-2xl mx-auto animate-fade-in">
                    <div 
                        className="prose prose-lg dark:prose-invert max-w-none bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl"
                        dangerouslySetInnerHTML={{ __html: conseils }}
                    />
                    <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
                        <button 
                            onClick={onClear} 
                            className="px-6 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transform hover:scale-105 transition-all"
                        >
                            Nouveaux Conseils
                        </button>
                         <button 
                            onClick={handleCopy} 
                            className="px-6 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                           {copied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <CopyIcon className="h-5 w-5"/>} {copied ? 'Copié !' : 'Copier le texte'}
                        </button>
                        <button 
                            onClick={() => setIsShareModalOpen(true)}
                            className="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                           <ShareIcon /> Partager
                        </button>
                    </div>
                </div>
                 <ShareConseilsModal 
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    conseils={conseils}
                    subject={subject}
                />
            </>
        );
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Conseils de Pro</h1>
                <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">Recevez des stratégies de révision par matière.</p>
            </div>

            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-700 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StyledDropdown label="Matière" options={subjectOptions} value={subject} onChange={setSubject} />
                    <StyledDropdown label="Niveau" options={levelOptions} value={level} onChange={setLevel} />
                </div>
                 <ModelSelector selectedModel={model} onModelChange={setModel} subscriptionPlan={subscriptionPlan} />
                <button
                    onClick={handleGenerate}
                    className="w-full py-3 px-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 18.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0zM3 12h1m16 0h1M5.636 6.364l.707.707m12.728 12.728l.707.707" /></svg>
                    Obtenir des conseils
                </button>
            </div>
        </div>
    );
};
