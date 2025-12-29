
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { BrevetSubject } from '../types';

interface Brevet2026ViewProps {
    onGenerate: (subject: string, pages: number) => void;
    isLoading: boolean;
    brevetSubject: BrevetSubject | null;
    onClear: () => void;
}

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export const Brevet2026View: React.FC<Brevet2026ViewProps> = ({ onGenerate, isLoading, brevetSubject, onClear }) => {
    const { t } = useLocalization();
    const [subject, setSubject] = useState('Mathématiques');
    const [pages, setPages] = useState(2);
    const [activeTab, setActiveTab] = useState<'subject' | 'correction'>('subject');

    const subjects = ['Français', 'Mathématiques', 'Histoire-Géographie-EMC', 'Sciences (Physique-Chimie / SVT / Techno)'];

    const handleGenerate = () => {
        onGenerate(subject, pages);
    };

    const handleDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="text-center p-8">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-slate-600 dark:text-slate-400">{t('brevet2026_generating')}</p>
            </div>
        );
    }

    if (brevetSubject) {
        return (
            <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Brevet Blanc 2026 - {subject}</h2>
                    <button onClick={onClear} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        {t('new')}
                    </button>
                </div>

                <div className="flex space-x-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('subject')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'subject' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        {t('brevet2026_tab_subject')}
                    </button>
                    <button
                        onClick={() => setActiveTab('correction')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'correction' ? 'bg-white dark:bg-slate-600 shadow-sm text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        {t('brevet2026_tab_correction')}
                    </button>
                </div>

                <div className="flex-grow bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden relative">
                    <iframe
                        title="Content"
                        srcDoc={activeTab === 'subject' ? brevetSubject.subjectHtml : brevetSubject.correctionHtml}
                        className="w-full h-full"
                        sandbox="allow-scripts"
                    />
                    <div className="absolute bottom-6 right-6">
                        <button
                            onClick={() => handleDownload(activeTab === 'subject' ? brevetSubject.subjectHtml : brevetSubject.correctionHtml, `brevet2026_${subject}_${activeTab}.html`)}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            {activeTab === 'subject' ? t('brevet2026_download_subject') : t('brevet2026_download_correction')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-bold text-slate-900 dark:text-white">{t('brevet2026_title')}</h1>
                <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">{t('brevet2026_subtitle')}</p>
            </div>

            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-700 p-8 rounded-3xl shadow-xl space-y-8">
                <div>
                    <label className="block text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">{t('brevet2026_subject_label')}</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                        {t('brevet2026_pages_label', { count: pages })}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={pages}
                        onChange={(e) => setPages(parseInt(e.target.value))}
                        className="w-full h-3 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-sm text-slate-500 mt-2">
                        <span>1 page (Rapide)</span>
                        <span>5 pages (Complet)</span>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all"
                >
                    {t('brevet2026_generate_button')}
                </button>
            </div>
        </div>
    );
};
