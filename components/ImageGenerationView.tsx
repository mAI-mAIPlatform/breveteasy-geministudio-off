import React, { useState, useEffect, useRef } from 'react';
import type { ImageModel } from '../types';

interface ImageGenerationViewProps {
  onGenerate: (prompt: string, model: ImageModel, style: string, format: 'jpeg' | 'png') => void;
  isGenerating: boolean;
  generatedImage: { data: string; mimeType: string } | null;
  remainingGenerations: number;
  defaultImageModel: ImageModel;
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

export const ImageGenerationView: React.FC<ImageGenerationViewProps> = ({ onGenerate, isGenerating, generatedImage, remainingGenerations, defaultImageModel }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>(defaultImageModel);
  const [style, setStyle] = useState('realiste');
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModel(defaultImageModel);
  }, [defaultImageModel]);

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onGenerate(prompt, model, style, format);
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

            <SettingRow label="Style">
                <SegmentedControl
                    options={[
                        { value: 'realiste', label: 'Réaliste' },
                        { value: 'dessin-anime', label: 'Dessin' },
                        { value: 'peinture-huile', label: 'Peinture' },
                        { value: 'art-numerique', label: 'Numérique' }
                    ]}
                    value={style}
                    onChange={setStyle as any}
                />
            </SettingRow>

            <SettingRow label="Format">
                <SegmentedControl<'jpeg' | 'png'>
                    options={[{ value: 'jpeg', label: 'JPEG' }, { value: 'png', label: 'PNG' }]}
                    value={format}
                    onChange={setFormat}
                />
            </SettingRow>

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
