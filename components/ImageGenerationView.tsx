import React, { useState, useEffect, useRef } from 'react';
import type { ImageModel, SubscriptionPlan } from '../types';
import { PremiumBadge } from './PremiumBadge';

interface ImageGenerationViewProps {
  onGenerate: (prompt: string, model: ImageModel, style: string, format: 'jpeg' | 'png', aspectRatio: string, negativePrompt: string) => void;
  isGenerating: boolean;
  generatedImage: { data: string; mimeType: string } | null;
  remainingGenerations: number;
  defaultImageModel: ImageModel;
  subscriptionPlan: SubscriptionPlan;
}

const DownloadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const SparklesIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;


const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-300 mb-2">{label}</label>
        {children}
    </div>
);

const SegmentedControl = <T extends string>({ options, value, onChange, disabled }: { options: { value: T, label: string }[], value: T, onChange: (value: T) => void, disabled?: boolean }) => (
    <div className={`flex space-x-1 rounded-xl bg-black/10 dark:bg-slate-800 p-1 ${disabled ? 'opacity-60' : ''}`}>
        {options.map((opt) => (
            <button
                key={opt.value}
                onClick={() => !disabled && onChange(opt.value)}
                disabled={disabled}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    value === opt.value
                        ? 'bg-white dark:bg-slate-950 text-indigo-500 dark:text-sky-300 shadow-md'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

// Custom Dropdown Component for better styling
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
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-300 mb-2">{label}</label>
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`relative w-full rounded-xl bg-white/20 dark:bg-slate-800 backdrop-blur-lg py-3 pl-4 pr-10 text-left shadow-sm border border-white/20 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
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


export const ImageGenerationView: React.FC<ImageGenerationViewProps> = ({ onGenerate, isGenerating, generatedImage, remainingGenerations, defaultImageModel, subscriptionPlan }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>(defaultImageModel);
  const [style, setStyle] = useState('none');
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const isStyleLocked = subscriptionPlan !== 'max';

  const styleOptions = [
    { value: 'none', label: 'Aucun (par défaut)' },
    { value: 'realiste', label: 'Réaliste' },
    { value: 'dessin-anime', label: 'Dessin animé' },
    { value: 'peinture-huile', label: 'Peinture à l\'huile' },
    { value: 'art-numerique', label: 'Art numérique' },
  ];

  const formatOptions = [
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
  ];
  
  const aspectRatioOptions = [
    { value: '1:1', label: 'Carré (1:1)' },
    { value: '16:9', label: 'Paysage (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Standard (4:3)' },
    { value: '3:4', label: 'Vertical (3:4)' },
  ];

  useEffect(() => {
    setModel(defaultImageModel);
  }, [defaultImageModel]);

  useEffect(() => {
    if (isStyleLocked) {
      setStyle('none');
    }
  }, [isStyleLocked]);

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onGenerate(prompt, model, style, format, aspectRatio, negativePrompt);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
    link.download = `brevetai_image.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const canGenerate = remainingGenerations > 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Left side: Controls */}
        <div className="w-full lg:w-3/5 bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
            <header className="text-center pb-4 border-b border-white/20 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Générer une image</h2>
            </header>

            <SettingRow label="Modèle">
                <SegmentedControl<ImageModel>
                    options={[{ value: 'faceai', label: 'FaceAI' }, { value: 'faceai-plus', label: 'FaceAI +' }]}
                    value={model}
                    onChange={setModel}
                />
                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    FaceAI+ peut offrir de meilleurs résultats.
                </p>
            </SettingRow>

            <SettingRow label="Description (Prompt)">
                <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 bg-white/20 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base placeholder-slate-600 dark:placeholder-slate-500 transition"
                    placeholder="Ex: Un astronaute sur la lune lisant un livre..."
                    disabled={!canGenerate || isGenerating}
                />
            </SettingRow>
            
            <div className="relative">
                <StyledDropdown
                    label="Style (facultatif)"
                    options={styleOptions.map(o => o.value)}
                    value={style}
                    onChange={(val) => setStyle(val as string)}
                    renderOption={(option) => styleOptions.find(o => o.value === option)?.label}
                    disabled={isStyleLocked}
                />
                {isStyleLocked && (
                    <PremiumBadge requiredPlan="max" />
                )}
            </div>

            <StyledDropdown
                label="Ratio de l'image"
                options={aspectRatioOptions.map(o => o.value)}
                value={aspectRatio}
                onChange={(val) => setAspectRatio(val as string)}
                renderOption={(option) => aspectRatioOptions.find(o => o.value === option)?.label}
            />
            
            <SettingRow label="Prompt négatif (facultatif)">
                <textarea
                    rows={2}
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full p-3 bg-white/20 dark:bg-slate-800 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base placeholder-slate-600 dark:placeholder-slate-500 transition"
                    placeholder="Ex: texte, flou, mauvaise qualité, déformé..."
                    disabled={!canGenerate || isGenerating}
                />
            </SettingRow>


            <StyledDropdown
                label="Format de sortie"
                options={formatOptions.map(o => o.value)}
                value={format}
                onChange={(val) => setFormat(val as 'jpeg' | 'png')}
                renderOption={(option) => formatOptions.find(o => o.value === option)?.label}
            />

             <div className="pt-4 border-t border-white/20 dark:border-slate-700">
                <button
                    onClick={handleGenerateClick}
                    disabled={!prompt.trim() || isGenerating || !canGenerate}
                    className="w-full flex items-center justify-center px-8 py-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <SparklesIcon className="h-6 w-6 mr-3" />
                    {isGenerating ? 'Génération en cours...' : 'Générer'}
                </button>
                 <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-3">
                    {isFinite(remainingGenerations) ? `${remainingGenerations} génération(s) restante(s) aujourd'hui.` : 'Générations illimitées.'}
                </p>
            </div>
        </div>

        {/* Right side: Output */}
        <div ref={outputRef} className="w-full lg:w-2/5 aspect-square bg-black/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-lg flex items-center justify-center p-4">
             {isGenerating ? (
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16">
                        <svg className="w-full h-full animate-spin text-sky-400" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray="160" strokeDashoffset="100" />
                        </svg>
                    </div>
                     <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">Création de votre image...</p>
                     <p className="text-sm text-slate-600 dark:text-slate-400">Cela peut prendre un moment.</p>
                </div>
            ) : generatedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <img
                        src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`}
                        alt="Generated image"
                        className="max-w-full max-h-[80%] object-contain rounded-2xl shadow-2xl"
                    />
                    <button onClick={handleDownload} className="flex items-center justify-center px-6 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-md hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors">
                        <DownloadIcon />
                        Télécharger
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center space-y-4 text-slate-600 dark:text-slate-400">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-lg font-semibold">Votre image apparaîtra ici.</p>
                </div>
            )}
        </div>
    </div>
  );
};