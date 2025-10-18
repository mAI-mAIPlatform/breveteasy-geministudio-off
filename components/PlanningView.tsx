import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Planning, PlanningTask, SubscriptionPlan, PlanningAiModel } from '../types';
import { PremiumBadge } from './PremiumBadge';

const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DAY_NAMES = ["lu", "ma", "me", "je", "ve", "sa", "di"];

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


const SharePlanningModal: React.FC<{ isOpen: boolean; onClose: () => void; planning: Planning; }> = ({ isOpen, onClose, planning }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const formatPlanningAsText = (planning: Planning): string => {
        let text = `${planning.title}\n\n`;
        planning.schedule.forEach(day => {
            const [year, month, dayOfMonth] = day.date.split('-').map(Number);
            const date = new Date(Date.UTC(year, month - 1, dayOfMonth));
            const dateString = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
            text += `--- ${dateString} ---\n`;
            day.tasks.forEach(task => { text += `- ${task}\n`; });
            text += '\n';
        });
        return text;
    };

    const shareText = `Voici mon planning de révision généré par PlanningAI sur Brevet' Easy 🚀:\n\n${formatPlanningAsText(planning)}`;
    const encodedShareText = encodeURIComponent(shareText);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        const handleClickOutside = (event: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose(); };
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
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">Partager le planning</h2>
                <div className="p-4 bg-white/50 dark:bg-slate-800/60 rounded-xl mb-6 max-h-40 overflow-y-auto">
                    <p className="text-slate-800 dark:text-slate-300 text-sm whitespace-pre-wrap">{shareText}</p>
                </div>
                 <button onClick={handleCopy} className="w-full flex items-center justify-center p-3 mb-6 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-700/60 transition-colors">
                    {copied ? <CheckIcon className="w-5 h-5 text-green-500 mr-2"/> : <CopyIcon className="w-5 h-5 mr-2"/>}
                    {copied ? 'Copié !' : 'Copier le texte'}
                </button>
            </div>
        </div>
    );
};


interface DatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: string | null) => void;
    initialDate: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ isOpen, onClose, onSelectDate, initialDate }) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const initial = new Date(initialDate + 'T00:00:00Z');

    const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(initial.getUTCFullYear(), initial.getUTCMonth(), 1)));
    const modalRef = useRef<HTMLDivElement>(null);

    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();

    const firstDayOfMonth = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7; // 0 = Lundi
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        const handleClickOutside = (event: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(Date.UTC(year, month + delta, 1)));
    };

    const handleDateClick = (day: number) => {
        const selected = new Date(Date.UTC(year, month, day));
        onSelectDate(selected.toISOString().split('T')[0]);
        onClose();
    };

    const handleClear = () => {
        onSelectDate(null);
        onClose();
    };

    const handleToday = () => {
        onSelectDate(today.toISOString().split('T')[0]);
        onClose();
    };
    
    const getCalendarDays = () => {
        const days = [];
        const daysInPrevMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }
        const remaining = 42 - days.length; // Ensure 6 rows
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isCurrentMonth: false });
        }
        return days;
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
            <div ref={modalRef} className="w-full max-w-xs bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                     <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Mois précédent">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">{MONTH_NAMES[month]} {year}</div>
                     <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Mois suivant">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                    {DAY_NAMES.map(day => <div key={day} className="font-semibold capitalize">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map(({ day, isCurrentMonth }, index) => {
                        const isSelected = isCurrentMonth && day === initial.getUTCDate() && month === initial.getUTCMonth() && year === initial.getUTCFullYear();
                        return (
                            <button
                                key={index}
                                onClick={() => isCurrentMonth && handleDateClick(day)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-sm ${
                                    isSelected 
                                        ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 font-bold' 
                                        : isCurrentMonth 
                                            ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700' 
                                            : 'text-slate-400 dark:text-slate-500'
                                }`}
                                disabled={!isCurrentMonth}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={handleClear} className="text-sm font-semibold text-indigo-500 hover:text-indigo-600">Effacer</button>
                    <button onClick={handleToday} className="text-sm font-semibold text-indigo-500 hover:text-indigo-600">Aujourd'hui</button>
                </div>
            </div>
        </div>
    );
};

const PlanningCalendar: React.FC<{ 
    planning: Planning;
    onUpdate: (planning: Planning) => void; 
}> = ({ planning, onUpdate }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<{ dayIndex: number; taskIndex: number; text: string } | null>(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');

    const tasksByDate = useMemo(() => {
        const map = new Map<string, string[]>();
        planning.schedule.forEach(item => {
            map.set(item.date, item.tasks);
        });
        return map;
    }, [planning]);

    const firstDateStr = planning.schedule.length > 0 ? planning.schedule[0].date : new Date().toISOString().split('T')[0];
    const firstDate = new Date(firstDateStr + 'T00:00:00Z');
    
    const [currentMonth, setCurrentMonth] = useState(new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), 1)));

    const year = currentMonth.getUTCFullYear();
    const month = currentMonth.getUTCMonth();

    const firstDayOfMonth = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    const calendarDays = useMemo(() => {
        const days = [];
        const daysInPrevMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isCurrentMonth: false });
        }
        return days;
    }, [year, month, firstDayOfMonth, daysInMonth]);

    const changeMonth = (delta: number) => {
        setCurrentMonth(new Date(Date.UTC(year, month + delta, 1)));
    };

    const handleUpdate = (dayIndex: number, newTasks: string[]) => {
        const newPlanning = JSON.parse(JSON.stringify(planning));
        if (newTasks.length > 0) {
            newPlanning.schedule[dayIndex].tasks = newTasks;
        } else {
            newPlanning.schedule.splice(dayIndex, 1);
            setSelectedDate(null);
        }
        onUpdate(newPlanning);
    };

    const handleSaveTask = () => {
        if (!editingTask) return;
        const newTasks = [...planning.schedule[editingTask.dayIndex].tasks];
        newTasks[editingTask.taskIndex] = editingTask.text;
        handleUpdate(editingTask.dayIndex, newTasks);
        setEditingTask(null);
    };
    
    const handleDeleteTask = (dayIndex: number, taskIndex: number) => {
        const newTasks = planning.schedule[dayIndex].tasks.filter((_, i) => i !== taskIndex);
        handleUpdate(dayIndex, newTasks);
    };

    const handleAddTask = () => {
        if (!newTaskText.trim() || !selectedDate) return;
        const dayIndex = planning.schedule.findIndex(d => d.date === selectedDate);
        if (dayIndex === -1) return;
        
        const newTasks = [...planning.schedule[dayIndex].tasks, newTaskText.trim()];
        handleUpdate(dayIndex, newTasks);
        setNewTaskText('');
        setIsAddingTask(false);
    };
    
    const selectedDayIndex = selectedDate ? planning.schedule.findIndex(d => d.date === selectedDate) : -1;
    const selectedTasks = selectedDayIndex !== -1 ? planning.schedule[selectedDayIndex].tasks : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/10 dark:border-slate-800/80 p-6 rounded-2xl shadow-lg">
                 <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100/10" aria-label="Mois précédent">&larr;</button>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 capitalize">{MONTH_NAMES[month]} {year}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100/10" aria-label="Mois suivant">&rarr;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                    {DAY_NAMES.map(day => <div key={day} className="font-semibold capitalize">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(({ day, isCurrentMonth }, index) => {
                        const dateStr = isCurrentMonth ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                        const hasTasks = isCurrentMonth && tasksByDate.has(dateStr);
                        const isSelected = selectedDate === dateStr;

                        return (
                            <button
                                key={index}
                                onClick={() => isCurrentMonth && hasTasks && setSelectedDate(dateStr)}
                                className={`h-12 flex flex-col items-center justify-center rounded-lg transition-colors text-sm p-1 ${
                                    !isCurrentMonth ? 'text-slate-400/50 dark:text-slate-600/50' :
                                    isSelected ? 'bg-indigo-500 text-white font-bold' :
                                    hasTasks ? 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-500/20 cursor-pointer' :
                                    'text-slate-800 dark:text-slate-200'
                                }`}
                                disabled={!hasTasks}
                            >
                                <span>{day}</span>
                                {hasTasks && <div className="w-1.5 h-1.5 rounded-full bg-current mt-1"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="md:col-span-1">
                 <div className="sticky top-28 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/10 dark:border-slate-800/80 p-6 rounded-2xl shadow-lg min-h-[300px]">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Tâches du jour</h4>
                    {selectedTasks ? (
                        <>
                        <ul className="space-y-3 text-slate-800 dark:text-slate-200">
                            {selectedTasks.map((task, i) => (
                                <li key={i} className="group flex items-center gap-2">
                                    {editingTask?.dayIndex === selectedDayIndex && editingTask?.taskIndex === i ? (
                                        <input 
                                            type="text"
                                            value={editingTask.text}
                                            onChange={e => setEditingTask({...editingTask, text: e.target.value})}
                                            onBlur={handleSaveTask}
                                            onKeyDown={e => e.key === 'Enter' && handleSaveTask()}
                                            autoFocus
                                            className="flex-1 bg-white/20 dark:bg-slate-700/60 p-1 rounded-md outline-none ring-2 ring-indigo-400"
                                        />
                                    ) : (
                                        <>
                                        <span className="flex-1">{task}</span>
                                        <button onClick={() => setEditingTask({dayIndex: selectedDayIndex, taskIndex: i, text: task})} className="opacity-0 group-hover:opacity-100 transition-opacity p-1"><EditIcon className="w-4 h-4 text-slate-500 hover:text-indigo-400"/></button>
                                        <button onClick={() => handleDeleteTask(selectedDayIndex, i)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1"><TrashIcon className="w-4 h-4 text-slate-500 hover:text-red-400"/></button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                         {isAddingTask ? (
                            <div className="mt-4">
                                <input 
                                    type="text"
                                    value={newTaskText}
                                    onChange={e => setNewTaskText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                    autoFocus
                                    className="w-full bg-white/20 dark:bg-slate-700/60 p-2 rounded-md outline-none ring-2 ring-indigo-400"
                                    placeholder="Nouvelle tâche..."
                                />
                                <div className="flex gap-2 mt-2 justify-end">
                                    <button onClick={() => setIsAddingTask(false)} className="text-xs font-semibold px-2 py-1">Annuler</button>
                                    <button onClick={handleAddTask} className="text-xs font-semibold px-2 py-1 bg-indigo-500 text-white rounded-md">Ajouter</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingTask(true)} className="w-full mt-4 text-sm font-semibold text-indigo-500 dark:text-indigo-300 hover:bg-indigo-500/10 p-2 rounded-lg transition-colors">
                                + Ajouter une tâche
                            </button>
                        )}
                        </>
                    ) : (
                         <p className="text-sm text-slate-600 dark:text-slate-400">Sélectionnez une date sur le calendrier pour voir les tâches.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

const ModelSelector: React.FC<{
    selectedModel: PlanningAiModel;
    onModelChange: (model: PlanningAiModel) => void;
    subscriptionPlan: SubscriptionPlan;
}> = ({ selectedModel, onModelChange, subscriptionPlan }) => {
    const modelNames: Record<PlanningAiModel, string> = {
        planningai: 'PlanningAI',
        'planningai-pro': 'PlanningAI Pro',
        'planningai-max': 'PlanningAI Max',
    };
    const models = useMemo(() => [
        { id: 'planningai' as PlanningAiModel, requiredPlan: 'free' as const },
        { id: 'planningai-pro' as PlanningAiModel, requiredPlan: 'pro' as const },
        { id: 'planningai-max' as PlanningAiModel, requiredPlan: 'max' as const },
    ], []);

    return (
        <div>
            <label className="block text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">Modèle</label>
            <div className="flex flex-wrap gap-2">
                {models.map(modelInfo => {
                    const isLocked = (modelInfo.requiredPlan === 'pro' && subscriptionPlan === 'free') || (modelInfo.requiredPlan === 'max' && subscriptionPlan !== 'max');
                    const isSelected = selectedModel === modelInfo.id;
                    return (
                        <div key={modelInfo.id} className="relative flex-1">
                            <button
                                onClick={() => !isLocked && onModelChange(modelInfo.id)}
                                disabled={isLocked}
                                className={`w-full text-center px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold ${
                                    isLocked ? 'opacity-60 cursor-not-allowed bg-white/10 dark:bg-slate-800/40 border-transparent' :
                                    isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/20 dark:bg-slate-800/60 border-transparent hover:border-slate-400/50'
                                }`}
                            >
                                {modelNames[modelInfo.id]}
                            </button>
                            {isLocked && <PremiumBadge requiredPlan={modelInfo.requiredPlan as 'pro' | 'max'} size="small" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const PlanningView: React.FC<{
    onGenerate: (task: string, dueDate: string, model: PlanningAiModel) => void;
    isLoading: boolean;
    planning: Planning | null;
    onClear: () => void;
    subscriptionPlan: SubscriptionPlan;
    defaultPlanningAiModel: PlanningAiModel;
    onUpdate: (updatedPlanning: Planning) => void;
}> = ({ onGenerate, isLoading, planning, onClear, subscriptionPlan, defaultPlanningAiModel, onUpdate }) => {
    const [task, setTask] = useState('');
    const [dueDate, setDueDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
    const [model, setModel] = useState<PlanningAiModel>(defaultPlanningAiModel);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    const formatPlanningAsText = (p: Planning): string => {
        let text = `${p.title}\n\n`;
        p.schedule.forEach(day => {
            const date = new Date(day.date + 'T00:00:00Z');
            const dateString = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
            text += `--- ${dateString} ---\n`;
            day.tasks.forEach(task => { text += `- ${task}\n`; });
            text += '\n';
        });
        return text;
    };

     const formatPlanningAsHtml = (p: Planning): string => {
        let html = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${p.title}</title>
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 20px auto; padding: 20px; }
                    h1 { color: #2c3e50; }
                    h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-top: 40px; }
                    ul { list-style-type: '✔ '; padding-left: 20px; }
                    li { margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <h1>${p.title}</h1>
        `;
        p.schedule.forEach(day => {
            const date = new Date(day.date + 'T00:00:00Z');
            const dateString = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
            html += `<h2>${dateString}</h2><ul>`;
            day.tasks.forEach(task => { html += `<li>${task}</li>`; });
            html += `</ul>`;
        });
        html += '</body></html>';
        return html;
    };

    const handleGenerate = () => {
        if (task.trim() && dueDate && !isLoading) {
            onGenerate(task, dueDate, model);
        }
    };
    
    const handleCopy = () => {
        if (!planning) return;
        navigator.clipboard.writeText(formatPlanningAsText(planning));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

     const handleDownload = () => {
        if (!planning) return;
        const htmlContent = formatPlanningAsHtml(planning);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${planning.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (isLoading) {
        return (
             <div className="text-center p-8">
                <div className="w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-slate-600 dark:text-slate-400">L'IA organise votre planning...</p>
            </div>
        );
    }

    if (planning) {
        return (
            <>
            <div className="w-full max-w-5xl mx-auto animate-fade-in">
                 <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{planning.title}</h2>
                </div>
                <PlanningCalendar planning={planning} onUpdate={onUpdate} />
                 <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
                    <button onClick={onClear} className="px-6 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transform hover:scale-105 transition-all">
                        Nouveau Planning
                    </button>
                    <button onClick={handleCopy} className="px-6 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                        {copied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <CopyIcon className="h-5 w-5"/>} {copied ? 'Copié !' : 'Copier'}
                    </button>
                     <button onClick={() => setIsShareModalOpen(true)} className="px-6 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <ShareIcon className="h-5 w-5"/> Partager
                    </button>
                    <button onClick={handleDownload} className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <DownloadIcon className="h-5 w-5"/> Télécharger (HTML)
                    </button>
                </div>
            </div>
            {planning && <SharePlanningModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} planning={planning} />}
            </>
        );
    }
    
    return (
        <>
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-slate-900 dark:text-white">PlanningAI</h1>
                    <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">Organisez vos révisions et devoirs intelligemment.</p>
                </div>

                <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-700 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                    <div>
                        <label htmlFor="task-desc" className="block text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            Que devez-vous faire ?
                        </label>
                        <textarea id="task-desc" rows={4} value={task} onChange={(e) => setTask(e.target.value)}
                            className="w-full p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 placeholder-slate-600 dark:placeholder-slate-400"
                            placeholder="Ex: Révisez le chapitre 5 d'histoire sur la Guerre Froide et faites les exercices de la page 85."
                        />
                    </div>
                     <div>
                        <label htmlFor="due-date" className="block text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            Pour quand ?
                        </label>
                        <button
                            id="due-date"
                            onClick={() => setIsPickerOpen(true)}
                            className="w-full text-left p-3 bg-white/20 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400"
                        >
                            {dueDate ? new Date(dueDate  + 'T00:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : <span className="text-slate-500">Choisir une date...</span>}
                        </button>
                    </div>
                    <ModelSelector selectedModel={model} onModelChange={setModel} subscriptionPlan={subscriptionPlan} />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !task.trim() || !dueDate}
                        className="w-full py-3 px-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        Générer mon planning
                    </button>
                </div>
            </div>
            {dueDate && <DatePickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelectDate={setDueDate}
                initialDate={dueDate}
            />}
        </>
    );
};