import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Planning, SubscriptionPlan, PlanningAiModel, PlanningDay, PlanningTask } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { PremiumBadge } from './PremiumBadge';

// --- ICONS ---
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

interface PlanningViewProps {
  onGenerate: (task: string, dueDate: string, model: PlanningAiModel) => void;
  isLoading: boolean;
  planning: Planning | null;
  onClear: () => void;
  subscriptionPlan: SubscriptionPlan;
  defaultPlanningAiModel: PlanningAiModel;
  onUpdate: (updatedPlanning: Planning) => void;
}

const Calendar: React.FC<{
    schedule: PlanningDay[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
    month: number;
    year: number;
    setMonth: (month: number) => void;
    setYear: (year: number) => void;
}> = ({ schedule, selectedDate, onDateSelect, month, year, setMonth, setYear }) => {
    const { t } = useLocalization();
    const taskDays = useMemo(() => new Set(schedule.map(d => d.date)), [schedule]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon
    const startDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // 0=Mon, 6=Sun
    const today = new Date().toISOString().split('T')[0];

    const monthNames = [ "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december" ].map(m => t(`month_${m}`));
    const dayNames = [ "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday" ].map(d => t(`day_short_${d}`));

    const changeMonth = (delta: number) => {
        const newDate = new Date(year, month + delta, 1);
        setMonth(newDate.getMonth());
        setYear(newDate.getFullYear());
    };

    return (
        <div className="p-4 bg-white/5 dark:bg-black/20 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-500/10"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{monthNames[month]} {year}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-500/10"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                {dayNames.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                    const isSelected = date === selectedDate;
                    const isToday = date === today;
                    const hasTasks = taskDays.has(date);

                    let classes = "w-full aspect-square rounded-full flex items-center justify-center cursor-pointer transition-colors text-sm ";
                    if (isSelected) {
                        classes += 'bg-indigo-500 text-white font-bold ';
                    } else {
                        classes += 'hover:bg-slate-500/20 ';
                        if (isToday) {
                            classes += 'ring-2 ring-sky-500 ';
                        }
                    }

                    return (
                        <div key={day} className="relative" onClick={() => onDateSelect(date)}>
                            <button className={classes}>{day + 1}</button>
                            {hasTasks && <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></div>}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const formatPlanningToHtml = (planning: Planning): string => {
    const title = planning.title;
    const scheduleHtml = planning.schedule
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(day => {
            const date = new Date(day.date + 'T12:00:00Z');
            const formattedDate = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const tasksHtml = day.tasks.map(task => `
                <li class="${task.isCompleted ? 'completed' : ''}">
                    <span class="checkbox">${task.isCompleted ? '☑' : '☐'}</span>
                    <span class="text">${task.text}</span>
                </li>
            `).join('');
            return `
                <div class="day">
                    <h3>${formattedDate}</h3>
                    <ul>${tasksHtml}</ul>
                </div>
            `;
        }).join('');

    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Planning: ${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Poppins', sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #343a40; text-align: center; border-bottom: 2px solid #4a90e2; padding-bottom: 15px; margin-bottom: 30px; }
            h3 { color: #4a90e2; margin-top: 30px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; }
            ul { list-style-type: none; padding-left: 0; }
            li { background-color: #f1f3f5; margin-bottom: 10px; padding: 15px; border-radius: 8px; border-left: 5px solid #4a90e2; display: flex; align-items: center; }
            li.completed { border-left-color: #28a745; }
            li.completed .text { text-decoration: line-through; color: #6c757d; }
            .checkbox { margin-right: 15px; font-size: 1.2em; }
            footer { text-align: center; margin-top: 40px; font-size: 0.8em; color: #868e96; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${title}</h1>
            ${scheduleHtml}
            <footer>Généré par Brevet' Easy</footer>
        </div>
    </body>
    </html>`;
};

export const PlanningView: React.FC<PlanningViewProps> = ({ onGenerate, isLoading, planning, onClear, subscriptionPlan, defaultPlanningAiModel, onUpdate }) => {
    const { t } = useLocalization();
    const [task, setTask] = useState('');
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [model, setModel] = useState<PlanningAiModel>(defaultPlanningAiModel);
    
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const [editingTask, setEditingTask] = useState<PlanningTask | null>(null);
    const [newTaskText, setNewTaskText] = useState('');
    const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    const selectedDayData = useMemo(() => {
        return planning?.schedule.find(day => day.date === selectedDate);
    }, [planning, selectedDate]);
    
    useEffect(() => {
        if (editingTask && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingTask]);
    
    const handleUpdate = (newSchedule: PlanningDay[]) => {
        if (!planning) return;
        onUpdate({ ...planning, schedule: newSchedule });
    };

    const handleAddTask = () => {
        if (!newTaskText.trim() || !planning) return;
        const newTask: PlanningTask = {
            id: `task_${Date.now()}_${Math.random()}`,
            text: newTaskText.trim(),
            isCompleted: false,
        };
        const scheduleExists = planning.schedule.some(d => d.date === selectedDate);
        let newSchedule: PlanningDay[];
        if (scheduleExists) {
            newSchedule = planning.schedule.map(d => d.date === selectedDate ? { ...d, tasks: [...d.tasks, newTask] } : d);
        } else {
            newSchedule = [...planning.schedule, { date: selectedDate, tasks: [newTask] }];
        }
        handleUpdate(newSchedule);
        setNewTaskText('');
    };

    const handleToggleTask = (taskId: string) => {
        const newSchedule = planning!.schedule.map(day => {
            if (day.date !== selectedDate) return day;
            return { ...day, tasks: day.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) };
        });
        handleUpdate(newSchedule);
    };

    const handleUpdateTask = () => {
        if (!editingTask) return;
        const newSchedule = planning!.schedule.map(day => ({
            ...day,
            tasks: day.tasks.map(t => t.id === editingTask.id ? { ...t, text: editingTask.text } : t),
        }));
        handleUpdate(newSchedule);
        setEditingTask(null);
    };
    
    const handleDeleteTask = (taskId: string) => {
        const newSchedule = planning!.schedule.map(day => {
            if (day.date !== selectedDate) return day;
            return { ...day, tasks: day.tasks.filter(t => t.id !== taskId) };
        }).filter(day => day.tasks.length > 0); // Remove day if it becomes empty
        handleUpdate(newSchedule);
    };
    
    const handleCopyTask = (text: string, taskId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedTaskId(taskId);
        setTimeout(() => setCopiedTaskId(null), 1500);
    };

    const handleDownload = () => {
        if (!planning) return;
        const htmlContent = formatPlanningToHtml(planning);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `planning_${planning.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (isLoading) {
        return (
            <div className="text-center p-8">
                <div className="w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-slate-600 dark:text-slate-400">{t('planningai_generating')}</p>
            </div>
        );
    }

    if (planning) {
        return (
            <div className="w-full max-w-4xl mx-auto animate-fade-in p-6 bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white truncate">{planning.title}</h2>
                    <div className="flex items-center gap-2">
                         <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition-colors text-sm">
                            <DownloadIcon className="w-5 h-5"/> {t('download')} (HTML)
                        </button>
                        <button onClick={onClear} className="px-4 py-2 bg-white/20 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-bold rounded-xl shadow-lg hover:bg-white/40 dark:hover:bg-slate-700/60 transition-colors text-sm">{t('planningai_new_planning_button')}</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Calendar 
                        schedule={planning.schedule} 
                        selectedDate={selectedDate} 
                        onDateSelect={setSelectedDate}
                        month={currentMonth}
                        year={currentYear}
                        setMonth={setCurrentMonth}
                        setYear={setCurrentYear}
                    />
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">{t('planningai_tasks_of_the_day')}</h3>
                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                            {selectedDayData && selectedDayData.tasks.length > 0 ? (
                                selectedDayData.tasks.map(task => (
                                    <div key={task.id} className="group flex items-start gap-3 p-3 bg-white/5 dark:bg-black/20 rounded-lg">
                                        <input type="checkbox" id={`task-${task.id}`} checked={task.isCompleted} onChange={() => handleToggleTask(task.id)} className="mt-1 h-5 w-5 rounded border-slate-400 text-indigo-500 focus:ring-indigo-500 cursor-pointer"/>
                                        {editingTask?.id === task.id ? (
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                value={editingTask.text}
                                                onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                                onBlur={handleUpdateTask}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTask()}
                                                className="flex-1 bg-transparent border-b-2 border-indigo-400 focus:outline-none text-slate-800 dark:text-slate-200"
                                            />
                                        ) : (
                                            <label htmlFor={`task-${task.id}`} className={`flex-1 text-slate-800 dark:text-slate-200 cursor-pointer transition-colors ${task.isCompleted ? 'line-through text-slate-500 dark:text-slate-500' : ''}`}>
                                                {task.text}
                                            </label>
                                        )}
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingTask(task)} className="p-1 text-slate-500 hover:text-indigo-500"><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleCopyTask(task.text, task.id)} className="p-1 text-slate-500 hover:text-sky-500">{copiedTaskId === task.id ? <CheckIcon className="w-4 h-4 text-green-500"/> : <CopyIcon className="w-4 h-4"/>}</button>
                                            <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-500 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-600 dark:text-slate-400 py-8">{t('planningai_no_tasks')}</div>
                            )}
                        </div>
                         <div className="mt-4 flex gap-2">
                            <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder={t('planningai_new_task_placeholder')} className="flex-1 p-2 text-sm bg-slate-200/40 dark:bg-slate-900/40 border border-slate-300/50 dark:border-slate-700/50 rounded-lg focus:ring-1 focus:ring-indigo-400 text-slate-900 dark:text-slate-100"/>
                            <button onClick={handleAddTask} className="px-4 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50" disabled={!newTaskText.trim()}>{t('add')}</button>
                        </div>
                    </div>
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