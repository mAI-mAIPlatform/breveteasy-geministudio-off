import React, { useState } from 'react';
import type { ImageModel } from '../types';

interface ImageGenerationViewProps {
  onGenerate: (prompt: string, model: ImageModel, style: string, format: 'jpeg' | 'png') => void;
  isGenerating: boolean;
  generatedImage: { data: string; mimeType: string; } | null;
  remainingGenerations: number;
  defaultImageModel: ImageModel;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-20 h-20">
        <svg className="w-full h-full animate-spin" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="spinner-gradient-img" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgb(96, 165, 250)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgb(56, 189, 248)', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#spinner-gradient-img)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="160"
                strokeDashoffset="100"
            />
        </svg>
    </div>
);

const DownloadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

const ImageModelSelectorDropdown: React.FC<{
    selectedModel: ImageModel;
    onModelChange: (model: ImageModel) => void;
}> = ({ selectedModel, onModelChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const modelDisplayNames = {
        faceai: 'FaceAI',
        'faceai-plus': 'FaceAI +',
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-base font-bold transition-colors bg-white/10 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 hover:bg-white/20 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200`}
                style={{minWidth: '120px'}}
            >
                <span className="flex-grow text-left">{modelDisplayNames[selectedModel]}</span>
                <svg
                    className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-full rounded-xl bg-white dark:bg-slate-800/90 backdrop-blur-lg shadow-2xl border border-white/20 dark:border-slate-700 z-10 p-1">
                    {(['faceai', 'faceai-plus'] as const).map((model) => (
                        <button
                            key={model}
                            onClick={() => {
                                onModelChange(model);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-800 dark:text-slate-200 hover:bg-indigo-500/80 hover:text-white transition-colors"
                        >
                            {modelDisplayNames[model]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ImageGenerationView: React.FC<ImageGenerationViewProps> = ({ onGenerate, isGenerating, generatedImage, remainingGenerations, defaultImageModel }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState<ImageModel>(defaultImageModel);
    const [selectedStyle, setSelectedStyle] = useState<string>('aucun');
    const [selectedFormat, setSelectedFormat] = useState<'jpeg' | 'png'>('jpeg');

    const styles: Record<string, string> = {
      'aucun': 'Aucun',
      'realiste': 'Réaliste',
      'dessin-anime': 'Dessin animé',
      'peinture-huile': "Peinture à l'huile",
      'art-numerique': 'Art numérique',
    };
    const formats: Record<'jpeg' | 'png', string> = {
        'jpeg': 'JPG',
        'png': 'PNG'
    };

    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onGenerate(prompt.trim(), selectedModel, selectedStyle, selectedFormat);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
        const extension = generatedImage.mimeType.split('/')[1] || 'jpeg';
        link.download = `brevetai-image-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasGenerationsLeft = remainingGenerations > 0;

    return (
        <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
            <div className="bg-slate-100/60 dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-xl flex-grow flex flex-col">
                <header className="relative flex items-center justify-center text-center pb-4 border-b border-white/20 dark:border-slate-700 mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Générer une image</h2>
                    <div className="absolute right-0">
                        <ImageModelSelectorDropdown
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                        />
                    </div>
                </header>

                <main className="flex-grow flex flex-col justify-center items-center">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-6 p-8">
                            <LoadingSpinner />
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Génération de l'image en cours...</h3>
                            <p className="text-slate-700 dark:text-slate-400 max-w-sm">BrevetAI dessine votre création. Cela peut prendre un instant.</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="w-full flex flex-col items-center gap-6">
                            <img src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} alt="Generated by BrevetAI" className="rounded-2xl shadow-lg max-w-full max-h-[50vh] object-contain" />
                            <button onClick={handleDownload} className="flex items-center justify-center px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all">
                                <DownloadIcon />
                                Télécharger
                            </button>
                        </div>
                    ) : (
                        <div className="w-full space-y-6">
                             <div>
                                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2 text-center">Format</h3>
                                <div className="flex justify-center rounded-xl bg-black/10 dark:bg-slate-800 p-1 max-w-xs mx-auto">
                                    {Object.entries(formats).map(([key, name]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedFormat(key as 'jpeg' | 'png')}
                                            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                selectedFormat === key
                                                ? 'bg-white dark:bg-slate-950 text-indigo-500 dark:text-sky-300 shadow-md'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                            }`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2 text-center">Style</h3>
                                <div className="flex flex-wrap justify-center gap-2 rounded-xl bg-black/10 dark:bg-slate-800 p-2">
                                    {Object.entries(styles).map(([key, name]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedStyle(key)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                selectedStyle === key
                                                ? 'bg-white dark:bg-slate-950 text-indigo-500 dark:text-sky-300 shadow-md'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                            }`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <p className="text-center text-slate-700 dark:text-slate-300 !mt-4">
                                Générations restantes aujourd'hui : <span className="font-bold text-indigo-500 dark:text-sky-300">{isFinite(remainingGenerations) ? remainingGenerations : 'Illimitées'}</span>
                            </p>

                            <textarea
                                rows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full p-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base placeholder-slate-600 dark:placeholder-slate-500 transition !mt-2"
                                placeholder="Décrivez l'image que vous souhaitez créer..."
                            />
                            <button
                                onClick={handleGenerateClick}
                                disabled={!prompt.trim() || !hasGenerationsLeft}
                                className="w-full px-8 py-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 !mt-4"
                            >
                                {hasGenerationsLeft ? 'Générer' : 'Limite atteinte'}
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};