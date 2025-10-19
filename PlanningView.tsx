import React, { useState, useMemo } from 'react';
import type { Planning, SubscriptionPlan, PlanningAiModel } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { PremiumBadge } from './PremiumBadge';

interface PlanningViewProps {
  onGenerate: (task: string, dueDate: string, model: PlanningAiModel) => void;
  isLoading: boolean;
  planning: Planning | null;
  onClear: () => void;
  subscriptionPlan: SubscriptionPlan;
  defaultPlanningAiModel: PlanningAiModel;
  onUpdate: (updatedPlanning: Planning) => void;
}

const formatPlanningAsHtml = (p: Planning): string => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${p.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #343a40; text-align: center; border-bottom: 2px solid #4a90e2; padding-bottom: 15px; margin-bottom: 30px; }
        h2 { color: #4a90e2; margin-top: 40px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; }
        ul { list-style-type: none; padding-left: 0; }
        li { background-color: #f1f3f5; margin-bottom: 10px; padding: 15px; border-radius: 8px; border-left: 5px solid #4a90e2; display: flex; align-items: center; }
        li::before { content: '✓'; color: #4a90e2; font-weight: bold; margin-right: 15px; font-size: 1.2em; }
        footer { text-align: center; margin-top: 40px; font-size: 0.8em; color: #868e96; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${p.title}</h1>
        ${p.schedule.map(day => {
            const date = new Date(day.date + 'T00:00:00Z');
            const dateString = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
            return `
                <div>
                    <h2>${dateString}</h2>
                    <ul>
                        ${day.tasks.map(task => `<li>${task}</li>`).join('')}
                    </ul>
                </div>
            `;
        }).join('')}
        <footer>Généré par Brevet' Easy</footer>
    </div>
</body>
</html>
`;

export const PlanningView: React.FC<PlanningViewProps> = ({ onGenerate, isLoading, planning, onClear, subscriptionPlan, defaultPlanningAiModel, onUpdate }) => {
    const { t } = useLocalization();
    const [task, setTask] = useState('');
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [model, setModel] = useState<PlanningAiModel>(defaultPlanningAiModel);

    const handleDownload = () => {
        if (!planning) return;
        const htmlContent = formatPlanningAsHtml(planning);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `planning_${planning.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (planning) {
        return (
            <div className="w-full max-w-4xl mx-auto animate-fade-in p-6 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl">
                <h2 className="text-3xl font-bold text-center mb-6 text-slate-900 dark:text-white">{planning.title}</h2>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                    {planning.schedule.map(day => (
                        <div key={day.date} className="pb-4 border-b border-white/10 dark:border-slate-800/50">
                            <h3 className="font-bold text-lg text-indigo-500 dark:text-sky-300">{new Date(day.date + 'T00:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                            <ul className="mt-2 space-y-2">
                                {day.tasks.map((t, i) => 
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 mt-1 flex-shrink-0 rounded-full border-2 border-indigo-400/50 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                    </div>
                                    <span className="text-slate-800 dark:text-slate-200">{t}</span>
                                </li>)}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={onClear} className="px-6 py-2 bg-white/20 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors">Nouveau Planning</button>
                    <button onClick={handleDownload} className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-colors">Télécharger HTML</button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-slate-900 dark:text-white">{t('home_planningai')}</h1>
                <p className="text-xl text-slate-700 dark:text-slate-400 mt-2">{t('planningai_subtitle')}</p>
            </div>
            <div className="space-y-6 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl p-8">
                <div>
                    <label htmlFor="task-input" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">{t('planningai_task_label')}</label>
                    <textarea id="task-input" value={task} onChange={e => setTask(e.target.value)} placeholder={t('planningai_task_placeholder')} rows={4} className="w-full p-3 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 text-slate-900 dark:text-slate-100 placeholder-slate-500" />
                </div>
                 <div>
                    <label htmlFor="due-date-input" className="block text-md font-semibold text-slate-800 dark:text-slate-300 mb-2">{t('planningai_due_date_label')}</label>
                    <input id="due-date-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-3 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 text-slate-900 dark:text-slate-100" />
                </div>
                <button onClick={() => onGenerate(task, dueDate, model)} disabled={isLoading || !task.trim()} className="w-full py-3 px-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading ? t('planningai_generating') : t('planningai_generate_button')}
                </button>
            </div>
        </div>
    );
};