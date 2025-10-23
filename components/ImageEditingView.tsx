import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface ImageEditingViewProps {
  onGenerate: (base64Data: string, mimeType: string, prompt: string) => void;
  isGenerating: boolean;
  generatedImage: { data: string; mimeType: string } | null;
  onClear: () => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const ImageEditingView: React.FC<ImageEditingViewProps> = ({ onGenerate, isGenerating, generatedImage, onClear }) => {
    const { t } = useLocalization();
    const [sourceImage, setSourceImage] = useState<{ file: File, base64: string, url: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileSelect = async (file: File | null) => {
        if (!file) return;
        onClear();
        const base64 = await fileToBase64(file);
        setSourceImage({ file, base64, url: URL.createObjectURL(file) });
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-indigo-500');
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        }
    };

    const handleGenerate = () => {
        if (!sourceImage || !prompt.trim() || isGenerating) return;
        onGenerate(sourceImage.base64, sourceImage.file.type, prompt);
    };

    const handleStartOver = () => {
        setSourceImage(null);
        setPrompt('');
        onClear();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const promptSuggestions = [
        "Ajoute un filtre retro",
        "Rend le ciel étoilé",
        "Change l'ambiance en crépuscule",
        "Enlève la voiture rouge",
        "Transforme en peinture à l'huile",
    ];

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-slate-900 dark:text-white">{t('home_editionai')}</h1>
                <p className="text-xl text-slate-700 dark:text-slate-400 mt-2">{t('editionai_subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                    <div>
                        <label htmlFor="image-edit-prompt" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">{t('editionai_prompt_label')}</label>
                        <textarea id="image-edit-prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-3 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 text-slate-900 dark:text-slate-100 placeholder-slate-500"
                            placeholder={t('editionai_prompt_placeholder')}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-2">{t('editionai_suggestions')}</p>
                        <div className="flex flex-wrap gap-2">
                            {promptSuggestions.map(p => (
                                <button key={p} onClick={() => setPrompt(p)} className="px-3 py-1 bg-white/10 dark:bg-slate-800/60 rounded-full text-sm hover:bg-white/20 dark:hover:bg-slate-700/60 transition-colors">
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10 dark:border-slate-800/50">
                        <button onClick={handleStartOver} disabled={isGenerating} className="w-full px-4 py-3 bg-white/20 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors">
                            {t('editionai_start_over')}
                        </button>
                        <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim() || !sourceImage}
                            className="w-full py-3 px-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                            {isGenerating ? t('image_generation_button_generating') : t('editionai_generate_button')}
                        </button>
                    </div>
                </div>
                {/* Image Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-center font-semibold text-slate-600 dark:text-slate-400">Original</h3>
                        <div 
                            className="aspect-square bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-dashed border-white/20 dark:border-slate-700 rounded-3xl flex items-center justify-center text-slate-600 dark:text-slate-400 p-4 relative transition-colors" 
                            onDrop={handleDrop} 
                            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500'); }}
                            onDragLeave={e => e.currentTarget.classList.remove('border-indigo-500')}
                        >
                            {sourceImage ? (
                                 <img src={sourceImage.url} alt="Source" className="w-full h-full object-contain rounded-2xl" />
                            ) : (
                                 <div className="text-center cursor-pointer p-4" onClick={() => fileInputRef.current?.click()}>
                                    <UploadIcon />
                                    <p className="font-semibold">{t('editionai_upload_cta')}</p>
                                    <p className="text-sm">{t('editionai_upload_formats')}</p>
                                 </div>
                            )}
                             <input type="file" ref={fileInputRef} onChange={e => handleFileSelect(e.target.files?.[0] || null)} accept="image/*" className="hidden" />
                        </div>
                    </div>
                     <div className="flex flex-col gap-2">
                        <h3 className="text-center font-semibold text-slate-600 dark:text-slate-400">Modifiée</h3>
                        <div className="aspect-square bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-dashed border-white/20 dark:border-slate-800 rounded-3xl flex items-center justify-center text-slate-600 dark:text-slate-400 p-4 relative">
                            {isGenerating ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p>{t('editionai_generating')}</p>
                                </div>
                            ) : generatedImage ? (
                                <>
                                    <img src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} alt="Generated by AI" className="w-full h-full object-contain rounded-2xl" />
                                    <button onClick={handleDownload} className="absolute bottom-4 right-4 flex items-center px-3 py-2 bg-slate-900/60 text-white rounded-full text-sm font-semibold backdrop-blur-md hover:bg-slate-900/80 transition-colors">
                                        <DownloadIcon />
                                        {t('download')}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p>{t('editionai_result_placeholder')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};