import React, { useState, useMemo } from 'react';
import type { Subject, PremadeGame, GamesAiModel, SubscriptionPlan } from '../types';
import { PREMADE_GAMES } from '../constants';
import { useLocalization } from '../hooks/useLocalization';
import { PremiumBadge } from './PremiumBadge';

interface JeuxDetailViewProps {
  subject: Subject;
  onSelectPremadeGame: (game: PremadeGame) => void;
  onGenerateAIGame: (subject: Subject, prompt: string, model: GamesAiModel) => void;
  subscriptionPlan: SubscriptionPlan;
  defaultGamesAiModel: GamesAiModel;
}

const GameCard: React.FC<{
  title: string;
  description: string;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ title, description, onClick, icon }) => (
  <button
    onClick={onClick}
    className="group w-full text-left p-6 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl shadow-lg transition-all duration-300 ease-in-out flex items-center space-x-5 hover:shadow-2xl hover:-translate-y-1 hover:border-sky-300/70 dark:hover:border-sky-400/70"
  >
    <div className="p-3 bg-lime-500/20 text-lime-500 dark:text-lime-300 rounded-full">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-lime-500 dark:group-hover:text-lime-300 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-slate-700 dark:text-slate-400 mt-1">{description}</p>
    </div>
  </button>
);

const RadioGroup: React.FC<{
    options: { value: string; label: string; disabled?: boolean; requiredPlan?: 'pro' | 'max' }[];
    selectedValue: string;
    onChange: (value: any) => void;
    name: string;
}> = ({ options, selectedValue, onChange, name }) => (
    <div className="flex flex-wrap gap-3">
        {options.map(({ value, label, disabled, requiredPlan }) => (
            <div key={value} className="relative flex-1 min-w-[100px]">
                <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                     disabled 
                        ? 'opacity-60 bg-white/10 dark:bg-slate-800/40 border-transparent'
                        : selectedValue === value 
                            ? 'bg-indigo-500 border-indigo-500 text-white' 
                            : 'bg-white/20 dark:bg-slate-800/60 border-transparent hover:border-slate-400/50'
                 } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                        type="radio"
                        name={name}
                        value={value}
                        checked={selectedValue === value}
                        onChange={() => { if (!disabled) onChange(value) }}
                        disabled={disabled}
                        className="sr-only"
                    />
                    <span className="font-semibold text-sm">{label}</span>
                </label>
                {disabled && requiredPlan && <PremiumBadge requiredPlan={requiredPlan} size="small" />}
            </div>
        ))}
    </div>
);

export const JeuxDetailView: React.FC<JeuxDetailViewProps> = ({ subject, onSelectPremadeGame, onGenerateAIGame, subscriptionPlan, defaultGamesAiModel }) => {
  const { t } = useLocalization();
  const [customPrompt, setCustomPrompt] = useState('');
  const [model, setModel] = useState<GamesAiModel>(defaultGamesAiModel);

  const premadeGamesForSubject = PREMADE_GAMES.filter(game => game.subjectNameKey === subject.nameKey);
  const gamesAiModelOptions = useMemo(() => [
      { value: 'gamesai', label: 'GamesAI' },
      { value: 'gamesai-pro', label: 'GamesAI Pro', disabled: subscriptionPlan === 'free', requiredPlan: 'pro' as const },
      { value: 'gamesai-max', label: 'GamesAI Max', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const },
  ], [subscriptionPlan]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <header className="text-center mb-12">
        <div className="flex justify-center items-center gap-4">
          <div className={`p-3 rounded-full ${subject.bgColor}`}>
            {React.cloneElement(subject.icon, { className: `h-10 w-10 ${subject.color}` })}
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-slate-100">
            {t('games_detail_title')} {t(subject.nameKey)}
          </h1>
        </div>
      </header>

      <main className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('games_premade_title')}</h2>
          {premadeGamesForSubject.length > 0 ? (
            <div className="space-y-4">
              {premadeGamesForSubject.map(game => (
                <GameCard
                  key={game.nameKey}
                  title={t(game.nameKey)}
                  description={t(game.descriptionKey)}
                  onClick={() => onSelectPremadeGame(game)}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 text-center py-4">
              Aucun jeu prédéfini pour cette matière pour le moment.
            </p>
          )}
        </div>

        <div className="bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl p-6 space-y-4">
           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('games_generate_title')}</h2>
           <div>
                <label htmlFor="custom-prompt" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">
                   {t('games_ai_instructions_label')}
                </label>
                <textarea
                    id="custom-prompt"
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full p-3 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 transition"
                    placeholder={t('games_ai_instructions_placeholder')}
                />
            </div>
            <div>
                <label className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">
                    {t('games_ai_model_label')}
                </label>
                <RadioGroup name="gamemodel" options={gamesAiModelOptions} selectedValue={model} onChange={setModel} />
            </div>
           <button
                onClick={() => onGenerateAIGame(subject, customPrompt, model)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-600 transition-colors"
                title="Générer un jeu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 18.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0zM3 12h1m16 0h1M5.636 6.364l.707.707m12.728 12.728l.707.707" /></svg>
                <span>{t('games_generate_button')}</span>
            </button>
        </div>
      </main>
    </div>
  );
};