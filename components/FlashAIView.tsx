import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Question, SubscriptionPlan, FlashAiModel } from '../types';
import { PremiumBadge } from './PremiumBadge';


interface FlashAIViewProps {
  onGenerate: (level: string, model: FlashAiModel) => void;
  isLoading: boolean;
  question: Question | null;
  onClear: () => void;
  subscriptionPlan: SubscriptionPlan;
  defaultFlashAiModel: FlashAiModel;
}

const LEVELS = ['CM2', '6ème', '5ème', '4ème', '3ème', 'Brevet'];

// --- Confetti Component & Logic ---
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  endX: number;
  endY: number;
}

const Confetti: React.FC<{ particles: ConfettiParticle[] }> = ({ particles }) => (
  <div className="fixed inset-0 pointer-events-none z-[9999]">
    {particles.map(p => (
      <div
        key={p.id}
        className="confetti"
        style={{
          left: `${p.x}px`,
          top: `${p.y}px`,
          backgroundColor: p.color,
          // @ts-ignore
          '--x-end': `${p.endX}px`,
          '--y-end': `${p.endY}px`,
        }}
      />
    ))}
  </div>
);


// --- Styled Dropdown Component ---
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

    const handleToggle = () => { if (!disabled) { setIsOpen(!isOpen); } };
    const handleSelect = (option: T) => { onChange(option); setIsOpen(false); };

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
                <button type="button" onClick={handleToggle} className={`relative w-full rounded-xl bg-slate-100 dark:bg-slate-900/70 py-3 pl-4 pr-10 text-left shadow-sm border border-slate-300/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`} aria-haspopup="listbox" aria-expanded={isOpen} disabled={disabled} >
                    <span className="block truncate text-slate-900 dark:text-slate-100">{renderOption ? renderOption(value) : value}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className={`h-5 w-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </span>
                </button>
                {isOpen && !disabled && (
                    <ul className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none" tabIndex={-1} role="listbox" >
                        {options.map((option) => (
                            <li key={String(option)} onClick={() => handleSelect(option)} className={`cursor-pointer select-none relative py-2 pl-4 pr-10 text-slate-900 dark:text-slate-100 hover:bg-indigo-100 dark:hover:bg-indigo-900/50`} role="option" aria-selected={value === option}>
                                <span className={`block truncate ${value === option ? 'font-semibold' : 'font-normal'}`}>{renderOption ? renderOption(option) : option}</span>
                                {value === option && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-500 dark:text-sky-300">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
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

const ModelSelector: React.FC<{
    selectedModel: FlashAiModel;
    onModelChange: (model: FlashAiModel) => void;
    subscriptionPlan: SubscriptionPlan;
}> = ({ selectedModel, onModelChange, subscriptionPlan }) => {

    const modelNames: Record<FlashAiModel, string> = {
        flashai: 'FlashAI',
        'flashai-pro': 'FlashAI Pro',
        'flashai-max': 'FlashAI Max',
    };
    const models = useMemo(() => [
        { id: 'flashai' as FlashAiModel, requiredPlan: 'free' as const },
        { id: 'flashai-pro' as FlashAiModel, requiredPlan: 'pro' as const },
        { id: 'flashai-max' as FlashAiModel, requiredPlan: 'max' as const },
    ], []);

    return (
         <StyledDropdown<FlashAiModel>
            label="Modèle"
            options={models.map(m => m.id)}
            value={selectedModel}
            onChange={onModelChange}
            renderOption={(option) => (
                <div className="flex items-center justify-between">
                    <span>{modelNames[option]}</span>
                    {((models.find(m => m.id === option)?.requiredPlan === 'pro' && subscriptionPlan === 'free') ||
                     (models.find(m => m.id === option)?.requiredPlan === 'max' && subscriptionPlan !== 'max')) && (
                        <span className="text-xs opacity-70">
                            <PremiumBadge requiredPlan={models.find(m => m.id === option)!.requiredPlan as 'pro' | 'max'} size="small" />
                        </span>
                    )}
                </div>
            )}
        />
    );
};


export const FlashAIView: React.FC<FlashAIViewProps> = ({
  onGenerate,
  isLoading,
  question,
  onClear,
  subscriptionPlan,
  defaultFlashAiModel
}) => {
  const [level, setLevel] = useState<string>('Brevet');
  const [model, setModel] = useState<FlashAiModel>(defaultFlashAiModel);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  const triggerConfetti = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    const newParticles: ConfettiParticle[] = Array.from({ length: 40 }).map((_, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const velocity = Math.random() * 80 + 50;
      return {
        id: Date.now() + i,
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        color: ['#a5b4fc', '#7dd3fc', '#f472b6', '#4ade80'][Math.floor(Math.random() * 4)],
        endX: Math.cos(angle) * velocity,
        endY: Math.sin(angle) * velocity + 100,
      }
    });

    setConfetti(prev => [...prev, ...newParticles]);

    setTimeout(() => {
        setConfetti(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 2000);
  };
  
  const handleAnswerSelect = (option: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!showAnswer) {
        setSelectedAnswer(option);
        if (option === question?.correctAnswer) {
             triggerConfetti(e);
        }
    }
  };

  const handleGenerate = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    onGenerate(level, model);
  };
  
  const handleNewQuestion = () => {
      onClear();
      setShowAnswer(false);
      setSelectedAnswer(null);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Confetti particles={confetti} />
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white">FlashAI</h1>
        <p className="text-xl text-slate-700 dark:text-slate-400 mt-2">Générez une question aléatoire pour un test rapide.</p>
      </div>

      {!question && !isLoading && (
        <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StyledDropdown<string>
                label="Niveau"
                options={LEVELS}
                value={level}
                onChange={setLevel}
            />
            <ModelSelector selectedModel={model} onModelChange={setModel} subscriptionPlan={subscriptionPlan} />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Générer une question
          </button>
        </div>
      )}

      {isLoading && (
          <div className="text-center p-8">
              <div className="w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-slate-600 dark:text-slate-400">Génération de la question...</p>
          </div>
      )}

      {question && !isLoading && (
        <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Question Flash</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{question.questionText}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, index) => {
                  const isCorrect = option === question.correctAnswer;
                  const isSelected = option === selectedAnswer;

                  let buttonClass = '';
                  if (showAnswer) {
                      if (isCorrect) {
                          buttonClass = 'bg-green-500/80 text-white border-transparent scale-105 shadow-lg';
                      } else if (isSelected && !isCorrect) {
                          buttonClass = 'bg-red-500/80 text-white border-transparent scale-105 shadow-lg';
                      } else {
                          buttonClass = 'bg-white/10 dark:bg-slate-800/40 border-transparent opacity-60';
                      }
                  } else {
                      if (isSelected) {
                          buttonClass = 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-[0_0_20px_rgba(167,139,250,0.5)] scale-105';
                      } else {
                          buttonClass = 'bg-white/20 dark:bg-slate-800/60 border-white/30 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-400';
                      }
                  }

                return (
                  <button 
                    key={index}
                    onClick={(e) => handleAnswerSelect(option, e)}
                    className={`p-4 rounded-2xl text-left text-lg transition-all duration-300 border ${buttonClass}`}
                    disabled={showAnswer}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {showAnswer && (
            <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl animate-fade-in">
                <h4 className="font-bold text-sky-800 dark:text-sky-300">Explication</h4>
                <p className="text-sky-900 dark:text-sky-200 mt-1">{question.explanation}</p>
            </div>
          )}
            
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button onClick={handleNewQuestion} className="w-full py-3 px-4 bg-white/20 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors">
                Nouvelle question
            </button>
            {!showAnswer && (
                 <button 
                    onClick={() => setShowAnswer(true)} 
                    className="w-full py-3 px-4 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    disabled={!selectedAnswer}
                 >
                    Révéler la réponse
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};