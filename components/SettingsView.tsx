import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { SubscriptionPlan, AiModel, ImageModel, CanvasModel, FlashAiModel, PlanningAiModel, ConseilsAiModel, Language, GamesAiModel } from '../types';
import { AVATAR_ICONS, AVATAR_ICON_KEYS } from '../constants';
import { PremiumBadge } from './PremiumBadge';
import { useLocalization } from '../hooks/useLocalization';

type Theme = 'light' | 'dark' | 'system';

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

const ShareIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
const TwitterIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FacebookIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" /></svg>;
const WhatsAppIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.54 2 2.08 6.46 2.08 11.96c0 1.77.46 3.49 1.32 5l-1.4 5.2 5.3-1.4c1.47.8 3.12 1.24 4.88 1.24h.02c5.5 0 9.96-4.46 9.96-9.96c0-5.5-4.46-9.96-9.96-9.96zM17.1 13.5c-.28-.14-1.65-.81-1.9-.9c-.25-.1-.43-.15-.61.15c-.18.3-.72.9-.88 1.08c-.16.18-.32.2-.6.06c-.28-.14-1.18-.43-2.25-1.39c-.83-.75-1.39-1.66-1.55-1.94c-.16-.28-.02-.43.12-.57c.13-.13.28-.34.42-.51c.14-.17.18-.28.28-.47s.05-.36-.02-.51c-.08-.15-.61-1.47-.83-2.02c-.22-.55-.45-.48-.61-.48c-.16 0-.34-.05-.53-.05c-.18 0-.48.07-.72.37c-.25.3-.95.92-1.22 2.22c-.28 1.3.62 2.72.71 2.92c.1.2 1.2 1.8 2.9 2.54c1.7.74 2.22.95 2.9.83c.68-.12 1.65-.68 1.88-1.32c.23-.64.23-1.18.16-1.32c-.07-.14-.25-.22-.53-.36z"/></svg>;
const LinkedInIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zm-11 5H5v10h3V8zm-1.5-2.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18 18h-3v-4.5c0-1.04-.02-2.37-1.45-2.37-1.45 0-1.67 1.13-1.67 2.29V18h-3V8h2.88v1.31h.04c.4-.76 1.38-1.55 2.84-1.55 3.03 0 3.59 1.99 3.59 4.58V18z"/></svg>;
const RedditIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5,12.01c0-1.48-0.78-2.76-1.94-3.48c-0.2-1.3-0.81-2.48-1.72-3.39c-0.91-0.91-2.09-1.52-3.39-1.72 C14.77,2.78,13.48,2,12.01,2c-1.48,0-2.76,0.78-3.48,1.94c-1.3,0.2-2.48,0.81-3.39,1.72c-0.91-0.91-1.52,2.09-1.72,3.39 C2.78,9.25,2,10.53,2,12.01c0,1.48,0.78,2.76,1.94,3.48c0.2,1.3,0.81,2.48,1.72,3.39c0.91,0.91,2.09,1.52,3.39,1.72 c0.72,1.16,2,1.94,3.48,1.94c1.48,0,2.76-0.78,3.48-1.94c1.3-0.2,2.48-0.81,3.39-1.72c0.91-0.91,1.52-2.09,1.72-3.39 C21.72,14.77,22.5,13.48,22.5,12.01z M7.76,12.72c0-0.83,0.67-1.5,1.5-1.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5 C8.42,14.22,7.76,13.55,7.76,12.72z M12.01,17.48c-1.89,0-3.48-1.01-4.22-2.45c-0.12-0.23-0.03-0.53,0.2-0.65 c0.23-0.12,0.53-0.03,0.65,0.2c0.6,1.19,1.9,2,3.37,2c1.47,0,2.77-0.81,3.37-2c0.12-0.23,0.42-0.32,0.65-0.2 c0.23,0.12,0.32,0.42,0.2,0.65C15.49,16.47,13.9,17.48,12.01,17.48z M14.75,14.22c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5 c0.83,0,1.5,0.67,1.5,1.5S15.58,14.22,14.75,14.22z"/></svg>;
const CheckIconSmall: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

const ShareAppModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { t } = useLocalization();
    const modalRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const shareUrl = "https://github.com/mAI-mAIPlatform/breveteasy-geministudio-off/releases/";
    const shareText = t('settings_share_modal_text');
    const fullTextWithUrl = `${shareText} ${shareUrl}`;
    
    const encodedShareText = encodeURIComponent(fullTextWithUrl);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(t('home_title'));

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedShareText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShareText}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${shareText}`,
        reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedShareText}`,
    };
    
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(fullTextWithUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div ref={modalRef} className="relative w-full max-w-md bg-[#f0f2f5] dark:bg-slate-900/80 dark:backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8">
                <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-md z-10" aria-label={t('close')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">{t('settings_share_modal_title')}</h2>
                
                <div className="p-4 bg-white/50 dark:bg-slate-800/60 rounded-xl mb-6">
                    <p className="text-slate-800 dark:text-slate-300 text-sm">{fullTextWithUrl}</p>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleCopy} className="w-full flex items-center justify-center p-3 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-700/60 transition-colors">
                        {copied ? <CheckIconSmall className="w-5 h-5 text-green-500 mr-2"/> : <CopyIcon className="w-5 h-5 mr-2"/>}
                        {copied ? 'Copié !' : 'Copier'}
                    </button>
                </div>
                
                <div className="flex justify-center items-center gap-4">
                     <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-black/80 text-white rounded-full hover:bg-black/100 transition-colors" title="Partager sur X">
                        <TwitterIcon />
                    </a>
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:bg-[#166fe5] transition-colors" title="Partager sur Facebook">
                        <FacebookIcon />
                    </a>
                    <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#0A66C2] text-white rounded-full hover:bg-[#0077B5] transition-colors" title="Partager sur LinkedIn">
                        <LinkedInIcon />
                    </a>
                    <a href={shareLinks.reddit} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#FF4500] text-white rounded-full hover:bg-[#ff5700] transition-colors" title="Partager sur Reddit">
                        <RedditIcon />
                    </a>
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#25D366] text-white rounded-full hover:bg-[#1ebe59] transition-colors" title="Partager sur WhatsApp">
                        <WhatsAppIcon />
                    </a>
                </div>
            </div>
        </div>
    );
};

const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLocalization();
    const [feedbackName, setFeedbackName] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(15);
    const [feedbackTerms, setFeedbackTerms] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [feedbackCode, setFeedbackCode] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackMessage.trim() || !feedbackTerms) {
            alert('Veuillez remplir le message et accepter les conditions.');
            return;
        }
        const code = 'BVTEY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        setFeedbackCode(code);
        setIsSubmitted(true);
    };
    
    const handleCopyCode = () => {
        navigator.clipboard.writeText(feedbackCode).then(() => {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
            <div ref={modalRef} className="relative w-full max-w-lg bg-[#f0f2f5] dark:bg-slate-900/80 dark:backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-md z-10"
                    aria-label={t('close')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {isSubmitted ? (
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 text-green-500 dark:text-green-300 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">{t('settings_feedback_modal_success')}</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{t('settings_feedback_modal_success_desc')}</p>
                        <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-800/60 rounded-xl mb-6">
                            <p className="flex-1 font-mono text-slate-800 dark:text-slate-300 text-sm text-left">{feedbackCode}</p>
                            <button onClick={handleCopyCode} className="flex items-center justify-center px-3 py-1 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-700/60 transition-colors text-xs">
                                {codeCopied ? <CheckIcon className="w-4 h-4 text-green-500 mr-1.5"/> : <CopyIcon className="w-4 h-4 mr-1.5"/>}
                                {codeCopied ? t('copied') : t('copy')}
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-semibold text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            {t('close')}
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">{t('settings_feedback_modal_title')}</h2>
                        <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="feedback-name-modal" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('settings_feedback_modal_name')}
                                </label>
                                <input
                                    id="feedback-name-modal" type="text" value={feedbackName} onChange={(e) => setFeedbackName(e.target.value)}
                                    className="mt-2 w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 placeholder-slate-400 dark:placeholder-slate-500"
                                    placeholder={t('settings_feedback_modal_name_placeholder')}
                                />
                            </div>

                            <div>
                                <label htmlFor="feedback-message-modal" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('settings_feedback_modal_message')}
                                </label>
                                <textarea
                                    id="feedback-message-modal" rows={5} value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)}
                                    className="mt-2 w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 resize-y placeholder-slate-400 dark:placeholder-slate-500"
                                    placeholder={t('settings_feedback_modal_message_placeholder')} required
                                />
                            </div>

                            <div>
                                <label htmlFor="feedback-rating-modal" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('settings_feedback_modal_rating', { rating: feedbackRating })}
                                </label>
                                <input
                                    id="feedback-rating-modal" type="range" min="0" max="20" value={feedbackRating}
                                    onChange={(e) => setFeedbackRating(parseInt(e.target.value, 10))}
                                    className="mt-2 w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                />
                            </div>

                            <div className="flex items-center pt-2">
                                <input
                                    id="feedback-terms-modal" type="checkbox" checked={feedbackTerms} onChange={(e) => setFeedbackTerms(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-800" required
                                />
                                <label htmlFor="feedback-terms-modal" className="ml-3 block text-sm text-slate-700 dark:text-slate-400">
                                    {t('settings_feedback_modal_terms')}
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-md font-semibold text-white bg-violet-400 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={!feedbackTerms || !feedbackMessage.trim()}
                            >
                                {t('send')}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

interface SettingsViewProps {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    aiSystemInstruction: string;
    onAiSystemInstructionChange: (instruction: string) => void;
    subscriptionPlan: SubscriptionPlan;
    userName: string;
    onUserNameChange: (name: string) => void;
    userAvatar: string;
    onUserAvatarChange: (avatar: string) => void;
    defaultAiModel: AiModel;
    onDefaultAiModelChange: (model: AiModel) => void;
    defaultImageModel: ImageModel;
    onDefaultImageModelChange: (model: ImageModel) => void;
    imageGenerationInstruction: string;
    onImageGenerationInstructionChange: (instruction: string) => void;
    defaultItemCount: number;
    onDefaultItemCountChange: (count: number) => void;
    defaultDifficulty: 'Facile' | 'Normal' | 'Difficile' | 'Expert';
    onDefaultDifficultyChange: (difficulty: 'Facile' | 'Normal' | 'Difficile' | 'Expert') => void;
    defaultLevel: string;
    onDefaultLevelChange: (level: string) => void;
    defaultCanvasModel: CanvasModel;
    onDefaultCanvasModelChange: (model: CanvasModel) => void;
    canvasSystemInstruction: string;
    onCanvasSystemInstructionChange: (instruction: string) => void;
    defaultFlashAiModel: FlashAiModel;
    onDefaultFlashAiModelChange: (model: FlashAiModel) => void;
    flashAiSystemInstruction: string;
    onFlashAiSystemInstructionChange: (instruction: string) => void;
    defaultPlanningAiModel: PlanningAiModel;
    onDefaultPlanningAiModelChange: (model: PlanningAiModel) => void;
    planningAiSystemInstruction: string;
    onPlanningAiSystemInstructionChange: (instruction: string) => void;
    defaultConseilsAiModel: ConseilsAiModel;
    onDefaultConseilsAiModelChange: (model: ConseilsAiModel) => void;
    conseilsAiSystemInstruction: string;
    onConseilsAiSystemInstructionChange: (instruction: string) => void;
    defaultGamesAiModel: GamesAiModel;
    onDefaultGamesAiModelChange: (model: GamesAiModel) => void;
    gamesAiSystemInstruction: string;
    onGamesAiSystemInstructionChange: (instruction: string) => void;
}

const SettingSection: React.FC<{ title: string; description: string; children: React.ReactNode; className?: string }> = ({ title, description, children, className }) => (
    <div className={`relative bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/10 dark:border-slate-800/80 p-6 rounded-2xl shadow-lg ${className ?? ''}`}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 mb-6">{description}</p>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const RadioGroup: React.FC<{
    options: { value: string; label: string; icon?: React.ReactNode; disabled?: boolean; requiredPlan?: 'pro' | 'max' }[];
    selectedValue: string;
    onChange: (value: any) => void;
    name: string;
}> = ({ options, selectedValue, onChange, name }) => (
    <div className="flex flex-wrap gap-3">
        {options.map(({ value, label, icon, disabled, requiredPlan }) => (
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
                    {icon}
                    <span className="font-semibold text-sm">{label}</span>
                </label>
                {disabled && requiredPlan && <PremiumBadge requiredPlan={requiredPlan} size="small" />}
            </div>
        ))}
    </div>
);

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
            <div className={`relative`} ref={dropdownRef}>
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

export const SettingsView: React.FC<SettingsViewProps> = (props) => {
    const { theme, onThemeChange, aiSystemInstruction, onAiSystemInstructionChange, subscriptionPlan, userName, onUserNameChange, userAvatar, onUserAvatarChange, defaultAiModel, onDefaultAiModelChange, defaultImageModel, onDefaultImageModelChange, imageGenerationInstruction, onImageGenerationInstructionChange, defaultItemCount, onDefaultItemCountChange, defaultDifficulty, onDefaultDifficultyChange, defaultLevel, onDefaultLevelChange, defaultCanvasModel, onDefaultCanvasModelChange, canvasSystemInstruction, onCanvasSystemInstructionChange, defaultFlashAiModel, onDefaultFlashAiModelChange, flashAiSystemInstruction, onFlashAiSystemInstructionChange, defaultPlanningAiModel, onDefaultPlanningAiModelChange, planningAiSystemInstruction, onPlanningAiSystemInstructionChange, defaultConseilsAiModel, onDefaultConseilsAiModelChange, conseilsAiSystemInstruction, onConseilsAiSystemInstructionChange, defaultGamesAiModel, onDefaultGamesAiModelChange, gamesAiSystemInstruction, onGamesAiSystemInstructionChange } = props;
    
    const { language, setLanguage, t } = useLocalization();
    const isFree = subscriptionPlan === 'free';
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const themeOptions = [ { value: 'light', label: t('settings_theme_light'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> }, { value: 'dark', label: t('settings_theme_dark'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> }, { value: 'system', label: t('settings_theme_system'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }, ];
    const langOptions = [ 
        { value: 'fr', label: 'Français 🇫🇷' }, { value: 'en', label: 'English 🇬🇧' }, { value: 'es', label: 'Español 🇪🇸' }, 
        { value: 'de', label: 'Deutsch 🇩🇪' }, { value: 'it', label: 'Italiano 🇮🇹' }, { value: 'pt', label: 'Português 🇵🇹' }, 
        { value: 'ja', label: '日本語 🇯🇵' }, { value: 'zh', label: '中文 🇨🇳' }, { value: 'ru', label: 'Русский 🇷🇺' }, 
        { value: 'uk', label: 'Українська 🇺🇦' }, { value: 'pl', label: 'Polski 🇵🇱' }, { value: 'nl', label: 'Nederlands 🇳🇱' }, 
        { value: 'sv', label: 'Svenska 🇸🇪' }, { value: 'hr', label: 'Hrvatski 🇭🇷' }, { value: 'hu', label: 'Magyar 🇭🇺' }
    ];
    const aiModelOptions = useMemo(() => [ { value: 'brevetai', label: 'BrevetAI', disabled: false }, { value: 'brevetai-pro', label: 'BrevetAI Pro', disabled: subscriptionPlan === 'free', requiredPlan: 'pro' as const }, { value: 'brevetai-max', label: 'BrevetAI Max', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const }, ], [subscriptionPlan]);
    const imageModelOptions = useMemo(() => [ { value: 'faceai', label: 'FaceAI', disabled: false }, { value: 'faceai-pro', label: 'FaceAI Pro', disabled: subscriptionPlan === 'free', requiredPlan: 'pro' as const }, { value: 'faceai-max', label: 'FaceAI Max', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const }, ], [subscriptionPlan]);
    const canvasModelOptions = useMemo(() => [ { value: 'canvasai', label: 'CanvasAI', disabled: false }, { value: 'canvasai-pro', label: 'CanvasAI Pro', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const }, { value: 'canvasai-max', label: 'CanvasAI Max', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const }, ], [subscriptionPlan]);
    const flashAiModelOptions = useMemo(() => [ { value: 'flashai', label: 'FlashAI' }, { value: 'flashai-pro', label: 'FlashAI Pro', disabled: subscriptionPlan === 'free', requiredPlan: 'pro' as const }, { value: 'flashai-max', label: 'FlashAI Max', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const }, ], [subscriptionPlan]);
    const planningAiModelOptions = useMemo(() => [ { value: 'planningai', label: 'PlanningAI' }, { value: 'planningai-pro', label: 'PlanningAI Pro', disabled: subscriptionPlan === 'free', requiredPlan: 'pro' as const }, { value: 'planningai-max', label: 'PlanningAI Max', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const }, ], [subscriptionPlan]);
    const conseilsAiModelOptions = useMemo(() => [ { value: 'conseilsai', label: 'ConseilsAI' }, { value: 'conseilsai-pro', label: 'ConseilsAI Pro', disabled: subscriptionPlan === 'free', requiredPlan: 'pro' as const }, { value: 'conseilsai-max', label: 'ConseilsAI Max', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const }, ], [subscriptionPlan]);
    const gamesAiModelOptions = useMemo(() => [ { value: 'gamesai', label: 'GamesAI' }, { value: 'gamesai-pro', label: 'GamesAI Pro', disabled: subscriptionPlan === 'free', requiredPlan: 'pro' as const }, { value: 'gamesai-max', label: 'GamesAI Max', disabled: subscriptionPlan !== 'max', requiredPlan: 'max' as const }, ], [subscriptionPlan]);

    const LEVELS = ['CM2', '6ème', '5ème', '4ème', '3ème', 'Brevet'];
    const DIFFICULTIES = ['Facile', 'Normal', 'Difficile', 'Expert'] as const;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-10">{t('settings_title')}</h1>
            <div className="space-y-8">
                <SettingSection className="z-[90]" title={t('settings_appearance_title')} description={t('settings_appearance_desc')}>
                    <RadioGroup name="theme" options={themeOptions} selectedValue={theme} onChange={onThemeChange} />
                    <div>
                        <StyledDropdown<Language>
                            label={t('settings_language')}
                            options={langOptions.map(o => o.value as Language)}
                            value={language}
                            onChange={setLanguage}
                            renderOption={(val) => langOptions.find(o => o.value === val)?.label}
                        />
                    </div>
                </SettingSection>
                
                <SettingSection className="z-[80]" title={t('settings_profile_title')} description={t('settings_profile_desc')}>
                     <div><label htmlFor="user-name" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_profile_name_label')}</label><input id="user-name" type="text" value={userName} onChange={(e) => onUserNameChange(e.target.value)} className="w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400" placeholder={t('settings_profile_name_placeholder')} /></div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">{t('settings_profile_avatar_label')}</label>
                        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">{AVATAR_ICON_KEYS.map(key => (<button key={key} onClick={() => onUserAvatarChange(key)} className={`flex items-center justify-center p-1 rounded-lg transition-all duration-200 aspect-square border-2 ${userAvatar === key ? 'bg-indigo-500/80 border-indigo-500 text-white scale-110' : 'bg-white/10 dark:bg-slate-800/60 border-transparent hover:border-indigo-400 text-slate-700 dark:text-slate-300'}`} aria-label={`Select icon ${key}`}>{React.cloneElement(AVATAR_ICONS[key], { className: "w-5 h-5" })}</button>))}</div>
                    </div>
                </SettingSection>

                <SettingSection className="z-[70]" title={t('settings_generation_title')} description={t('settings_generation_desc')}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <StyledDropdown<string> label={t('level')} options={LEVELS} value={defaultLevel} onChange={onDefaultLevelChange} />
                        <StyledDropdown<'Facile' | 'Normal' | 'Difficile' | 'Expert'> label={t('difficulty')} options={DIFFICULTIES} value={defaultDifficulty} onChange={onDefaultDifficultyChange} />
                    </div>
                    <div className="pt-4">
                        <label htmlFor="default-item-count-slider" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">{t('settings_generation_item_count', { count: defaultItemCount })}</label>
                        <input
                            id="default-item-count-slider"
                            type="range"
                            min="1"
                            max="10"
                            value={defaultItemCount}
                            onChange={(e) => onDefaultItemCountChange(Number(e.target.value))}
                            className="w-full h-2 bg-slate-300/50 dark:bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                </SettingSection>

                <SettingSection className="z-[60]" title={t('settings_brevetai_title')} description={t('settings_brevetai_desc')}>
                    <div className="relative">
                        <label htmlFor="ai-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_system_instruction')}</label>
                        <textarea id="ai-instruction" rows={4} value={aiSystemInstruction} onChange={(e) => onAiSystemInstructionChange(e.target.value)} className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`} placeholder={t('settings_system_instruction_placeholder')} disabled={isFree} />
                         {isFree && <PremiumBadge requiredPlan="pro" />}
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_default_model')}</label><RadioGroup name="aiModel" options={aiModelOptions} selectedValue={defaultAiModel} onChange={onDefaultAiModelChange} /></div>
                </SettingSection>
                
                 <SettingSection className="z-[50]" title={t('settings_faceai_title')} description={t('settings_faceai_desc')}>
                    <div className="relative">
                        <label htmlFor="image-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_faceai_style_instruction')}</label>
                        <textarea id="image-instruction" rows={3} value={imageGenerationInstruction} onChange={(e) => onImageGenerationInstructionChange(e.target.value)} className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`} placeholder={t('settings_faceai_style_placeholder')} disabled={isFree} />
                         {isFree && <PremiumBadge requiredPlan="pro" />}
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_default_model')}</label><RadioGroup name="imageModel" options={imageModelOptions} selectedValue={defaultImageModel} onChange={onDefaultImageModelChange} /></div>
                </SettingSection>

                <SettingSection className="z-[40]" title={t('settings_canvasai_title')} description={t('settings_canvasai_desc')}>
                    <div className="relative">
                        <label htmlFor="canvas-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_system_instruction')}</label>
                        <textarea id="canvas-instruction" rows={3} value={canvasSystemInstruction} onChange={(e) => onCanvasSystemInstructionChange(e.target.value)} className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${subscriptionPlan !== 'max' ? 'opacity-60' : ''}`} placeholder={t('settings_canvasai_placeholder')} disabled={subscriptionPlan !== 'max'} />
                         {subscriptionPlan !== 'max' && <PremiumBadge requiredPlan="max" />}
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_default_model')}</label><RadioGroup name="canvasModel" options={canvasModelOptions} selectedValue={defaultCanvasModel} onChange={onDefaultCanvasModelChange} /></div>
                </SettingSection>

                <SettingSection className="z-[30]" title={t('settings_flashai_title')} description={t('settings_flashai_desc')}>
                    <div className="relative">
                        <label htmlFor="flashai-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_system_instruction')}</label>
                        <textarea id="flashai-instruction" rows={3} value={flashAiSystemInstruction} onChange={(e) => onFlashAiSystemInstructionChange(e.target.value)} className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`} placeholder={t('settings_flashai_placeholder')} disabled={isFree} />
                         {isFree && <PremiumBadge requiredPlan="pro" />}
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_default_model')}</label><RadioGroup name="flashAiModel" options={flashAiModelOptions} selectedValue={defaultFlashAiModel} onChange={onDefaultFlashAiModelChange} /></div>
                </SettingSection>

                <SettingSection className="z-[20]" title={t('settings_planningai_title')} description={t('settings_planningai_desc')}>
                    <div className="relative">
                        <label htmlFor="planningai-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_system_instruction')}</label>
                        <textarea id="planningai-instruction" rows={3} value={planningAiSystemInstruction} onChange={(e) => onPlanningAiSystemInstructionChange(e.target.value)} className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`} placeholder={t('settings_planningai_placeholder')} disabled={isFree} />
                         {isFree && <PremiumBadge requiredPlan="pro" />}
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_default_model')}</label><RadioGroup name="planningAiModel" options={planningAiModelOptions} selectedValue={defaultPlanningAiModel} onChange={onDefaultPlanningAiModelChange} /></div>
                </SettingSection>

                 <SettingSection className="z-[10]" title={t('settings_conseilsai_title')} description={t('settings_conseilsai_desc')}>
                    <div className="relative">
                        <label htmlFor="conseilsai-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_system_instruction')}</label>
                        <textarea id="conseilsai-instruction" rows={3} value={conseilsAiSystemInstruction} onChange={(e) => onConseilsAiSystemInstructionChange(e.target.value)} className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`} placeholder={t('settings_conseilsai_placeholder')} disabled={isFree} />
                         {isFree && <PremiumBadge requiredPlan="pro" />}
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_default_model')}</label><RadioGroup name="conseilsAiModel" options={conseilsAiModelOptions} selectedValue={defaultConseilsAiModel} onChange={onDefaultConseilsAiModelChange} /></div>
                </SettingSection>

                <SettingSection title={t('settings_gamesai_title')} description={t('settings_gamesai_desc')}>
                    <div className="relative">
                        <label htmlFor="gamesai-instruction" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_system_instruction')}</label>
                        <textarea id="gamesai-instruction" rows={3} value={gamesAiSystemInstruction} onChange={(e) => onGamesAiSystemInstructionChange(e.target.value)} className={`w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${isFree ? 'opacity-60' : ''}`} placeholder={t('settings_gamesai_placeholder')} disabled={isFree} />
                         {isFree && <PremiumBadge requiredPlan="pro" />}
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('settings_default_model')}</label><RadioGroup name="gamesAiModel" options={gamesAiModelOptions} selectedValue={defaultGamesAiModel} onChange={onDefaultGamesAiModelChange} /></div>
                </SettingSection>

                <SettingSection title={t('settings_about_title')} description={t('settings_about_desc')}>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">26-3.9</span>
                        <a href="https://github.com/mAI-mAIPlatform/breveteasy-geministudio-off/releases/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl shadow-md hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors text-sm">{t('settings_about_version_notes')}</a>
                    </div>
                </SettingSection>

                <SettingSection title={t('settings_feedback_title')} description={t('settings_feedback_desc')}>
                   <button onClick={() => setIsFeedbackModalOpen(true)} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105">{t('settings_feedback_button')}</button>
                   <button onClick={() => setIsShareModalOpen(true)} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all transform hover:scale-105"><ShareIcon /> {t('settings_share_app_button')}</button>
                </SettingSection>
            </div>
            {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}
            {isShareModalOpen && <ShareAppModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />}
        </div>
    );
};