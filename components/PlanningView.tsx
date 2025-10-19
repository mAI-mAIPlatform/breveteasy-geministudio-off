import React, { useState } from 'react';
import type { Planning, SubscriptionPlan, PlanningAiModel } from '../types';

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
    const [task, setTask] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
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
            <div className="w-full max-w-4xl mx-auto animate-fade-in">
                <h2 className="text-3xl font-bold text-center mb-6">{planning.title}</h2>
                <div className="space-y-4">
                    {planning.schedule.map(day => (
                        <div key={day.date}>
                            <h3 className="font-semibold text-lg">{new Date(day.date + 'T00:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                            <ul className="list-disc pl-5">
                                {day.tasks.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={onClear}>Nouveau Planning</button>
                    <button onClick={handleDownload}>Télécharger HTML</button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">PlanningAI</h1>
                <p>Organisez vos révisions.</p>
            </div>
            <div className="space-y-4">
                <textarea value={task} onChange={e => setTask(e.target.value)} placeholder="Tâche à planifier..." rows={4} className="w-full p-2 border rounded" />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border rounded" />
                <button onClick={() => onGenerate(task, dueDate, model)} disabled={isLoading} className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-blue-300">
                    {isLoading ? 'Génération...' : 'Générer le planning'}
                </button>
            </div>
        </div>
    );
};