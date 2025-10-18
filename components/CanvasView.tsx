import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { CanvasVersion, SubscriptionPlan, CanvasModel } from '../types';
import { PremiumBadge } from './PremiumBadge';

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const GenerateIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 18.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0zM3 12h1m16 0h1M5.636 6.364l.707.707m12.728 12.728l.707.707" /></svg>;


const PromptSuggestion: React.FC<{onClick: () => void, children: React.ReactNode, icon: React.ReactNode}> = ({ onClick, children, icon }) => (
    <button onClick={onClick} className="text-left p-3 bg-white/10 dark:bg-slate-800/60 rounded-lg flex items-center gap-3 hover:bg-white/20 dark:hover:bg-slate-800 transition-colors text-sm">
        <span className="text-indigo-400">{icon}</span>
        <span className="flex-1 text-slate-800 dark:text-slate-300">{children}</span>
    </button>
);


const ModelSelector: React.FC<{
    selectedModel: CanvasModel;
    onModelChange: (model: CanvasModel) => void;
    subscriptionPlan: SubscriptionPlan;
}> = ({ selectedModel, onModelChange, subscriptionPlan }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const modelNames: Record<CanvasModel, string> = {
        canvasai: 'CanvasAI',
        'canvasai-pro': 'CanvasAI Pro',
        'canvasai-max': 'CanvasAI Max',
    };
    const models: { id: CanvasModel; requiredPlan: 'free' | 'pro' | 'max' }[] = [
        { id: 'canvasai', requiredPlan: 'free' },
        { id: 'canvasai-pro', requiredPlan: 'max' },
        { id: 'canvasai-max', requiredPlan: 'max' },
    ];

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
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modèle</label>
            <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between gap-1.5 rounded-lg px-3 py-2 text-md font-semibold transition-colors bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 hover:bg-white/30 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200">
                <span className="flex-grow text-left">{modelNames[selectedModel]}</span>
                <svg className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full rounded-xl bg-white dark:bg-slate-800/90 backdrop-blur-lg shadow-2xl border border-white/20 dark:border-slate-700 z-10 p-1">
                    {models.map((model) => {
                         const isLocked = subscriptionPlan !== 'max' && model.requiredPlan === 'max';
                        return (
                            <div key={model.id} className="relative">
                                <button onClick={() => { if (!isLocked) { onModelChange(model.id); setIsOpen(false); }}} disabled={isLocked} className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-800 dark:text-slate-200 hover:bg-indigo-500/80 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                                    {modelNames[model.id]}
                                </button>
                                {/* Fix: Add a type guard to ensure requiredPlan is not 'free' before passing to PremiumBadge */}
                                {isLocked && model.requiredPlan !== 'free' && <PremiumBadge requiredPlan={model.requiredPlan} className="rounded-lg" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


interface CanvasViewProps {
  versions: CanvasVersion[];
  activeVersionId: string | null;
  onGenerate: (prompt: string, model: CanvasModel) => void;
  onSelectVersion: (versionId: string) => void;
  isGenerating: boolean;
  subscriptionPlan: SubscriptionPlan;
  defaultCanvasModel: CanvasModel;
}

export const CanvasView: React.FC<CanvasViewProps> = ({ versions, activeVersionId, onGenerate, onSelectVersion, isGenerating, subscriptionPlan, defaultCanvasModel }) => {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<CanvasModel>(defaultCanvasModel);

  const activeVersion = useMemo(() => {
    return versions.find(v => v.id === activeVersionId);
  }, [versions, activeVersionId]);

  const sortedVersionsForDisplay = useMemo(() => {
      return [...versions].sort((a, b) => b.createdAt - a.createdAt);
  }, [versions]);

  const versionNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    [...versions]
        .sort((a, b) => a.createdAt - b.createdAt)
        .forEach((v, i) => map.set(v.id, i + 1));
    return map;
  }, [versions]);


  const handleGenerate = () => {
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt, model);
      setPrompt('');
    }
  };

  const handleCopy = () => {
      if (!activeVersion) return;
      navigator.clipboard.writeText(activeVersion.htmlContent).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleDownload = () => {
      if (!activeVersion) return;
      const blob = new Blob([activeVersion.htmlContent], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `canvasai-v${versionNumberMap.get(activeVersion.id)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const suggestionPrompts = {
      quiz: "Crée un quiz interactif sur la Seconde Guerre mondiale avec 5 questions à choix multiples. Affiche le score à la fin.",
      exercices: "Crée une page d'exercices sur les équations du premier degré, avec 3 équations à résoudre et un bouton pour afficher la solution de chaque équation.",
      simulation: "Crée une petite simulation de système solaire avec le soleil, la terre et la lune qui tournent en utilisant uniquement du CSS et du Javascript. La page doit être responsive.",
      landingPage: "Crée une page de destination (landing page) pour une application mobile fictive de fitness. Elle doit avoir un en-tête, une section 'features' et un pied de page.",
      portfolio: "Crée une page de portfolio simple pour un photographe, avec une grille d'images et une section 'à propos'.",
      calculator: "Crée une calculatrice simple avec les opérations de base (+, -, *, /).",
      countdown: "Crée une page avec un compte à rebours jusqu'à une date spécifique.",
      dataViz: "Crée une page qui affiche un graphique à barres simple en utilisant des div HTML et du CSS, basé sur un objet de données Javascript."
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left Panel: Controls & Versions */}
      <aside className="w-full lg:max-w-[450px] flex-shrink-0 flex flex-col gap-6 h-full">
        {/* Prompt section */}
        <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">CanvasAI</h2>
          
           <ModelSelector 
            selectedModel={model}
            onModelChange={setModel}
            subscriptionPlan={subscriptionPlan}
          />

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez la page web, le quiz ou l'exercice interactif que vous souhaitez créer..."
            className="w-full h-40 p-3 mt-4 bg-white/20 dark:bg-slate-800/60 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none text-slate-900 dark:text-slate-100 placeholder-slate-600 dark:placeholder-slate-400"
            disabled={isGenerating}
          />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4">
              <PromptSuggestion onClick={() => setPrompt(suggestionPrompts.quiz)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                  Quiz interactif
              </PromptSuggestion>
              <PromptSuggestion onClick={() => setPrompt(suggestionPrompts.exercices)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}>
                  Exercices à compléter
              </PromptSuggestion>
               <PromptSuggestion onClick={() => setPrompt(suggestionPrompts.simulation)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>}>
                  Simulation physique
              </PromptSuggestion>
              <PromptSuggestion onClick={() => setPrompt(suggestionPrompts.landingPage)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
                  Page de destination
              </PromptSuggestion>
               <PromptSuggestion onClick={() => setPrompt(suggestionPrompts.portfolio)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                  Portfolio d'artiste
              </PromptSuggestion>
              <PromptSuggestion onClick={() => setPrompt(suggestionPrompts.dataViz)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}>
                  Visualisation de données
              </PromptSuggestion>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full mt-2 py-3 px-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <GenerateIcon className="h-5 w-5" />
            {isGenerating ? 'Génération en cours...' : 'Générer'}
          </button>
        </div>

        {/* Versions section */}
        <div className="flex-grow bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col min-h-0">
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Versions</h3>
          <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-3">
            {sortedVersionsForDisplay.length === 0 ? (
              <p className="text-sm text-center text-slate-600 dark:text-slate-400 py-4">Aucune version générée.</p>
            ) : (
              sortedVersionsForDisplay.map(version => (
                <button
                  key={version.id}
                  onClick={() => onSelectVersion(version.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors border-2 ${activeVersionId === version.id ? 'bg-indigo-500/20 border-indigo-500/50' : 'border-transparent hover:bg-white/20 dark:hover:bg-slate-800'}`}
                >
                  <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">Version {versionNumberMap.get(version.id)}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{version.prompt}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Right Panel: Preview */}
      <main className="w-full h-full flex-grow flex flex-col min-h-0">
        <div className="h-full aspect-square bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl border border-white/10 dark:border-slate-800 rounded-3xl shadow-lg flex flex-col overflow-hidden items-center justify-center text-center p-4">
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Génération de votre page...</h3>
                </div>
            ) : activeVersion ? (
                <div className="w-full h-full flex flex-col">
                     <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 italic">Version {versionNumberMap.get(activeVersion.id)}</p>
                        <div className="flex items-center gap-2">
                             <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-300/50 dark:hover:bg-slate-600/50 transition-colors">
                                {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                                {copied ? 'Copié' : 'Copier'}
                            </button>
                            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors">
                                <DownloadIcon className="h-4 w-4" />
                                Télécharger
                            </button>
                        </div>
                     </div>
                     <iframe 
                        title="CanvasAI Preview"
                        srcDoc={activeVersion.htmlContent}
                        className="w-full h-full bg-white"
                        sandbox="allow-scripts allow-same-origin"
                     />
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Aperçu de la page</h3>
                    <p className="max-w-md mt-1 text-slate-600 dark:text-slate-400">Générez une page pour la prévisualiser ici.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};
