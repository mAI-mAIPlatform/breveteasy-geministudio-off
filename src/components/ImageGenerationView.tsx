
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { SubscriptionPlan, ImageModel } from '@/lib/types';
import { PremiumBadge } from './PremiumBadge';

interface ImageGenerationViewProps {
  onGenerate: (prompt: string, model: ImageModel, style: string, format: 'jpeg' | 'png', aspectRatio: string, negativePrompt: string) => void;
  isGenerating: boolean;
  generatedImage: { data: string; mimeType: string } | null;
  remainingGenerations: number;
  defaultImageModel: ImageModel;
  subscriptionPlan: SubscriptionPlan;
}

interface StyledDropdownProps<T extends string> {
    label: string;
    options: readonly T[];
    value: T;
    onChange: (value: T) => void;
    renderOption?: (option: T) => React.ReactNode;
    disabled?: boolean;
}

const StyledDropdown = <T extends string>({ label, options, value, onChange, renderOption, disabled = false }: StyledDropdownProps<T>) => {
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
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`relative w-full rounded-xl bg-slate-100 dark:bg-slate-900/70 py-3 pl-4 pr-10 text-left shadow-sm border border-slate-300/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
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
                    <ul className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
                        {options.map((option) => (
                            <li
                                key={String(option)}
                                onClick={() => { onChange(option); setIsOpen(false); }}
                                className="cursor-pointer select-none relative py-2 pl-4 pr-10 text-slate-900 dark:text-slate-100 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                            >
                                <span className={`block truncate ${value === option ? 'font-semibold' : 'font-normal'}`}>{renderOption ? renderOption(option) : option}</span>
                                {value === option && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-500 dark:text-sky-300"><svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const STYLES_OPTIONS: { value: string; label: string }[] = [
    { value: 'none', label: 'Aucun' },
    { value: 'photographie', label: 'Photographie' },
    { value: 'cinematic', label: 'Cinématique' },
    { value: 'minimaliste', label: 'Minimaliste' },
    { value: 'art-digital', label: 'Art Numérique' },
    { value: 'origami', label: 'Origami' },
    { value: 'pixel-art', label: 'Pixel Art' },
];

export const ImageGenerationView: React.FC<ImageGenerationViewProps> = ({ onGenerate, isGenerating, generatedImage, remainingGenerations, defaultImageModel, subscriptionPlan }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>(defaultImageModel);
  const [style, setStyle] = useState('none');
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');

  const isModelLocked =
    (model === 'faceai-pro' && subscriptionPlan === 'free') ||
    (model === 'faceai-max' && subscriptionPlan !== 'max');

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating || isModelLocked) return;
    onGenerate(prompt, model, style, format, aspectRatio, negativePrompt);
  };
  
  const FORMATS = ['jpeg', 'png'] as const;
  const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'] as const;
  
  const imageModelDisplayNames: Record<ImageModel, string> = {
    'faceai': 'FaceAI',
    'faceai-pro': 'FaceAI Pro',
    'faceai-max': 'FaceAI Max',
  };
  
  const modelOptions = useMemo(() => {
    const options: ImageModel[] = ['faceai'];
    if (subscriptionPlan === 'pro' || subscriptionPlan === 'max') {
        options.push('faceai-pro');
    }
    if (subscriptionPlan === 'max') {
        options.push('faceai-max');
    }
    return options;
  }, [subscriptionPlan]);

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left column: Controls */}
        <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
             <div className="space-y-6">
                <div>
                    <label htmlFor="image-prompt" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">Votre description</label>
                    <textarea id="image-prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 text-slate-900 dark:text-slate-100 placeholder-slate-500"
                        placeholder="Ex: Un astronaute surfant sur une vague cosmique..."
                    />
                </div>
                
                <div className="relative">
                    <StyledDropdown<ImageModel> 
                        label="Modèle" 
                        options={modelOptions} 
                        value={model} 
                        onChange={setModel}
                        renderOption={(option) => imageModelDisplayNames[option]}
                    />
                    {isModelLocked && <PremiumBadge requiredPlan={model === 'faceai-pro' ? 'pro' : 'max'} />}
                </div>

                <div className="pt-4 border-t border-slate-300/50 dark:border-slate-700/50">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Paramètres</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <StyledDropdown<string> 
                                label="Style" 
                                options={STYLES_OPTIONS.map(opt => opt.value)} 
                                value={style} 
                                onChange={setStyle}
                                renderOption={val => STYLES_OPTIONS.find(opt => opt.value === val)?.label ?? val}
                            />
                        </div>
                        <div>
                           <StyledDropdown<string> label="Ratio" options={RATIOS} value={aspectRatio} onChange={setAspectRatio} />
                       </div>
                       <div>
                          <StyledDropdown<'jpeg' | 'png'> label="Format" options={FORMATS} value={format} onChange={setFormat} />
                       </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="negative-prompt" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">Prompt négatif (facultatif)</label>
                    <textarea id="negative-prompt" rows={2} value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
                        className="w-full p-3 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 text-slate-900 dark:text-slate-100 placeholder-slate-500"
                        placeholder="Ex: flou, texte, couleurs ternes..."
                    />
                </div>
                
                <button onClick={handleSubmit} disabled={isGenerating || !prompt.trim() || isModelLocked}
                    className="w-full py-4 px-6 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                    {isGenerating ? 'Génération en cours...' : 'Générer l\'image'}
                </button>
                 <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                    {isFinite(remainingGenerations) ? `${remainingGenerations} générations restantes aujourd'hui.` : 'Générations illimitées.'}
                </p>
             </div>
        </div>

        {/* Right column: Image display */}
        <div className="aspect-square bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-dashed border-white/20 dark:border-slate-800 rounded-3xl flex items-center justify-center text-slate-600 dark:text-slate-400 p-4">
            {isGenerating ? (
                 <div className="text-center">
                    <div className="w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>L'IA dessine votre image...</p>
                 </div>
            ) : generatedImage ? (
                <img src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} alt="Generated by AI" className="w-full h-full object-contain rounded-2xl" />
            ) : (
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>Votre image apparaîtra ici.</p>
                </div>
            )}
        </div>
    </div>
  );
};
