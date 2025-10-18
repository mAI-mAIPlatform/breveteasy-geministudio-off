import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Planning, PlanningTask, SubscriptionPlan, PlanningAiModel } from '../types';
import { PremiumBadge } from './PremiumBadge';

const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DAY_NAMES = ["lu", "ma", "me", "je", "ve", "sa", "di"];

interface DatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: string | null) => void;
    initialDate: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ isOpen, onClose, onSelectDate, initialDate }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const initial = initialDate ? new Date(initialDate) : today;

    const [currentDate, setCurrentDate] = useState(initial);
    const modalRef = useRef<HTMLDivElement>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Lundi
    const daysInMonth = new Date(year, month + 1, 0).getDate();

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
        setCurrentDate(new Date(year, month + delta, 1));
    };

    const handleDateClick = (day: number) => {
        const selected = new Date(year, month, day);
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
        const daysInPrevMonth = new Date(year, month, 0).getDate();
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
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">{MONTH_NAMES[month]} {year}</div>
                     <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Mois suivant">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                    {DAY_NAMES.map(day => <div key={day} className="font-semibold capitalize">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map(({ day, isCurrentMonth }, index) => {
                        const isSelected = isCurrentMonth && day === initial.getDate() && month === initial.getMonth() && year === initial.getFullYear();
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

const PlanningCalendar: React.FC<{ planning: Planning }> = ({ planning }) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const tasksByDate = useMemo(() => {
        const map = new Map<string, string[]>();
        planning.schedule.forEach(item => {
            map.set(item.date, item.tasks);
        });
        return map;
    }, [planning]);

    const firstDate = planning.schedule.length > 0 ? new Date(planning.schedule[0].date) : new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = useMemo(() => {
        const days = [];
        const daysInPrevMonth = new Date(year, month, 0).getDate();
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
        setCurrentMonth(new Date(year, month + delta, 1));
    };
    
    const selectedTasks = selectedDate ? tasksByDate.get(selectedDate) : null;

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
                        <ul className="space-y-3 list-disc list-inside text-slate-800 dark:text-slate-200">
                            {selectedTasks.map((task, i) => <li key={i}>{task}</li>)}
                        </ul>
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
                            {isLocked && <PremiumBadge requiredPlan={modelInfo.requiredPlan as 'pro' | 'max'} />}
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
}> = ({ onGenerate, isLoading, planning, onClear, subscriptionPlan, defaultPlanningAiModel }) => {
    const [task, setTask] = useState('');
    const [dueDate, setDueDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
    const [model, setModel] = useState<PlanningAiModel>(defaultPlanningAiModel);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    
    const handleGenerate = () => {
        if (task.trim() && dueDate && !isLoading) {
            onGenerate(task, dueDate, model);
        }
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
            <div className="w-full max-w-5xl mx-auto animate-fade-in">
                 <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{planning.title}</h2>
                </div>
                <PlanningCalendar planning={planning} />
                 <div className="mt-8 flex justify-center">
                    <button 
                        onClick={onClear} 
                        className="px-8 py-3 bg-white/20 dark:bg-slate-800/60 backdrop-blur-lg border border-white/30 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transform hover:scale-105 transition-all"
                    >
                        Créer un autre planning
                    </button>
                </div>
            </div>
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
                            {dueDate ? new Date(dueDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-slate-500">Choisir une date...</span>}
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
            <DatePickerModal 
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelectDate={setDueDate}
                initialDate={dueDate!}
            />
        </>
    );
};