import React, { useRef, useState, useEffect } from 'react';
import type { Quiz } from '@/lib/types';

interface ResultsViewProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  quiz: Quiz | null;
  userAnswers: (string | null)[];
}

const CheckIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const CrossIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.607a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const InfoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
const ShareIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
const TwitterIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FacebookIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" /></svg>;
const WhatsAppIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.54 2 2.08 6.46 2.08 11.96c0 1.77.46 3.49 1.32 5l-1.4 5.2 5.3-1.4c1.47.8 3.12 1.24 4.88 1.24h.02c5.5 0 9.96-4.46 9.96-9.96c0-5.5-4.46-9.96-9.96-9.96zM17.1 13.5c-.28-.14-1.65-.81-1.9-.9c-.25-.1-.43-.15-.61.15c-.18.3-.72.9-.88 1.08c-.16.18-.32.2-.6.06c-.28-.14-1.18-.43-2.25-1.39c-.83-.75-1.39-1.66-1.55-1.94c-.16-.28-.02-.43.12-.57c.13-.13.28-.34.42-.51c.14-.17.18-.28.28-.47s.05-.36-.02-.51c-.08-.15-.61-1.47-.83-2.02c-.22-.55-.45-.48-.61-.48c-.16 0-.34-.05-.53-.05c-.18 0-.48.07-.72.37c-.25.3-.95.92-1.22 2.22c-.28 1.3.62 2.72.71 2.92c.1.2 1.2 1.8 2.9 2.54c1.7.74 2.22.95 2.9.83c.68-.12 1.65-.68 1.88-1.32c.23-.64.23-1.18.16-1.32c-.07-.14-.25-.22-.53-.36z"/></svg>;
const LinkedInIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zm-11 5H5v10h3V8zm-1.5-2.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18 18h-3v-4.5c0-1.04-.02-2.37-1.45-2.37-1.45 0-1.67 1.13-1.67 2.29V18h-3V8h2.88v1.31h.04c.4-.76 1.38-1.55 2.84-1.55 3.03 0 3.59 1.99 3.59 4.58V18z"/></svg>;
const RedditIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5,12.01c0-1.48-0.78-2.76-1.94-3.48c-0.2-1.3-0.81-2.48-1.72-3.39c-0.91-0.91-2.09-1.52-3.39-1.72 C14.77,2.78,13.48,2,12.01,2c-1.48,0-2.76,0.78-3.48,1.94c-1.3,0.2-2.48,0.81-3.39,1.72c-0.91-0.91-1.52,2.09-1.72,3.39 C2.78,9.25,2,10.53,2,12.01c0,1.48,0.78,2.76,1.94,3.48c0.2,1.3,0.81,2.48,1.72,3.39c0.91,0.91,2.09,1.52,3.39,1.72 c0.72,1.16,2,1.94,3.48,1.94c1.48,0,2.76-0.78,3.48-1.94c1.3-0.2,2.48-0.81,3.39-1.72c0.91-0.91,1.52-2.09,1.72-3.39 C21.72,14.77,22.5,13.48,22.5,12.01z M7.76,12.72c0-0.83,0.67-1.5,1.5-1.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5 C8.42,14.22,7.76,13.55,7.76,12.72z M12.01,17.48c-1.89,0-3.48-1.01-4.22-2.45c-0.12-0.23-0.03-0.53,0.2-0.65 c0.23-0.12,0.53-0.03,0.65,0.2c0.6,1.19,1.9,2,3.37,2c1.47,0,2.77-0.81,3.37-2c0.12-0.23,0.42-0.32,0.65-0.2 c0.23,0.12,0.32,0.42,0.2,0.65C15.49,16.47,13.9,17.48,12.01,17.48z M14.75,14.22c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5 c0.83,0,1.5,0.67,1.5,1.5S15.58,14.22,14.75,14.22z"/></svg>;
const CopyIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIconSmall: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const DiscordIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4464.8245-.6667 1.3039-2.516-1.032-5.1408-.9562-7.5383.25-1.3978.6946-2.5857 1.63-3.5615 2.7844a.0732.0732 0 0 0-.0042.0832c.1894.4815.394.9458.6143 1.3853a18.29 18.29 0 0 0-1.6348 3.5342.0737.0737 0 0 0 .041.0872c1.472.6377 2.9495.9619 4.418.9619-2.0084.6644-3.6262 1.933-4.6362 3.6377a.0732.0732 0 0 0 .0181.0962c.9229.6245 1.933 1.1176 3.0294 1.4582.0741.023.1504-.014.1919-.0772-2.14-2.203-2.618-5.056-1.802-7.7803.6245.24 1.2575.457 1.9077.6245a.0732.0732 0 0 0 .0832-.0181c.316-.24.6143-.5032.8988-.7893a.0737.0737 0 0 0 .014-.0832c-.1263-.2315-.244-.457-.3575-.6826a.0732.0732 0 0 0-.0697-.0371c-.3286-.0697-.6572-.146-.9772-.2315a.0732.0732 0 0 0-.0872.0496c-.5717 1.19-1.074 2.449-1.4925 3.7573a.0737.0737 0 0 0 .0181.0872c.457.316.9229.6058 1.4016.8606a.0732.0732 0 0 0 .0915-.0042c.3074-.1894.6058-.3855.8817-.5972a.0737.0737 0 0 0 .014-.0915c-.1894-.2988-.3753-.5972-.5442-.8988a.0732.0732 0 0 0-.0832-.0496c-.3425-.0872-.6851-.1808-1.0276-.2853a.0741.0741 0 0 0-.0872.0496c-.146.3372-.2807.676-.4112 1.0185a.0737.0737 0 0 0 .0276.0872c.2673.1663.5347.3286.802.4815.0741.0371.159.014.204-.0496.316-.4815.6143-.9718.8988-1.4621a.0732.0732 0 0 0-.0042-.0872c-.1723-.2315-.353-.457-.5347-.676a.0732.0732 0 0 0-.0915-.023c-.3286.0872-.6572.1663-.9815.24a.0737.0737 0 0 0-.0741.0832c.1894.757.316 1.5368.3709 2.33.0187.29-.0957.567-.2828.7618-1.741 1.81-4.57 2.652-7.868 2.052-1.723-.3074-3.268-1.0185-4.59-2.075a.0741.0741 0 0 0-.041-.0187l-.014.0042-.0042.0042-.0042.0042-.0042.0042-.0042.0042-.0042.0042-.0042.0042-.0042.0042-.0042.0042-.0042.0042-.0042.0042c-1.3978-1.1213-2.5857-2.4533-3.5287-3.966a.0741.0741 0 0 0-.0042-.0832c.1637-.4655.3372-.9272.5161-1.3853.0741-.1894.0187-.4112-.1121-.5442-1.6348-1.6348-2.618-3.6653-2.828-5.864-.0496-1.0507.0371-2.1057.25-3.146.0371-.1765-.0276-.3639-.1765-.4815-1.154-1.2229-2.0084-2.63-2.5436-4.144a.0737.0737 0 0 0-.0085-.0832c.316-.7612.6946-1.4892 1.1399-2.1824.0371-.0611.1078-.0915.1808-.0832.9562.0957 1.8892.2988 2.7844.6058.0732.0276.1547-.0085.1962-.0741a20.44 20.44 0 0 1 5.513-3.268c.0832-.0371.1637-.0276.24.014.4815.2225.9562.4655 1.4154.7294.0741.0371.159.0371.2315 0a19.7828 19.7828 0 0 1 6.5447-1.103c.1894-.0085.353.1121.394.2988.24.8692.4112 1.7613.5075 2.6658.014.1808.1808.316.3639.316.3372.0085.676.014 1.0185.014.1894 0 .353-.1263.3855-.316.0872-.4815.1547-.9619.1962-1.4485a.0737.0737 0 0 0-.0741-.0832c-.3639-.0697-.7294-.146-1.0944-.2225-.159-.0371-.2485-.1894-.211-.353a19.13 19.13 0 0 0-2.4393-5.2813.0732.0732 0 0 0-.0785-.0371Z"/></svg>

const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; scoreOutOf20: string; subject: string; }> = ({ isOpen, onClose, scoreOutOf20, subject }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const shareText = `J'ai obtenu un score de ${scoreOutOf20}/20 en ${subject} sur Brevet' Easy ! 🚀 Venez tester vos connaissances ! #Brevet2025 #Révisions #IA`;
    const encodedShareText = encodeURIComponent(shareText);
    const shareUrl = "https://gemini.google.com/studio"; // placeholder
    const encodedUrl = encodeURIComponent(shareUrl);
    const shareTitle = `Résultat du quiz sur Brevet' Easy`;
    const encodedTitle = encodeURIComponent(shareTitle);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedShareText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShareText}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedShareText}`,
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
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">Partager votre résultat</h2>
                
                <div className="p-4 bg-white/50 dark:bg-slate-800/60 rounded-xl mb-6">
                    <p className="text-slate-800 dark:text-slate-300 text-sm">{shareText}</p>
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
                    <button onClick={handleCopy} className="w-12 h-12 flex items-center justify-center bg-[#5865F2] text-white rounded-full hover:bg-[#4752c4] transition-colors" title="Copier pour Discord">
                        <DiscordIcon />
                    </button>
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

export const ResultsView: React.FC<ResultsViewProps> = ({ score, totalQuestions, onRestart, quiz, userAnswers }) => {
  const correctionRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const scoreOutOf20 = totalQuestions > 0 ? ((score / totalQuestions) * 20).toFixed(1) : "0.0";

  const getFeedback = () => {
    if (percentage >= 80) {
      return { message: "Excellent travail !", color: "text-green-500 dark:text-green-400", stroke: "stroke-green-500" };
    }
    if (percentage >= 50) {
      return { message: "Bien joué, continuez comme ça !", color: "text-sky-500 dark:text-sky-400", stroke: "stroke-sky-500" };
    }
    return { message: "Ne baissez pas les bras, la persévérance paie !", color: "text-red-500 dark:text-red-400", stroke: "stroke-red-500" };
  };

  const feedback = getFeedback();

  const scrollToCorrection = () => {
    correctionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        scoreOutOf20={scoreOutOf20} 
        subject={quiz?.subject || ''} 
      />
      <div className="flex flex-col items