// Fix: Provide the implementation for the constants.
import React from 'react';
import type { Subject } from './types';

export const SUBJECTS: Subject[] = [
  {
    name: "Français",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
    color: "text-blue-500 dark:text-blue-300",
    bgColor: "bg-blue-500/20",
  },
  {
    name: "Mathématiques",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="12" y1="10" x2="12" y2="18"></line><line x1="8" y1="10" x2="8" y2="18"></line><line x1="8" y1="14" x2="12" y2="14"></line></svg>,
    color: "text-red-500 dark:text-red-300",
    bgColor: "bg-red-500/20",
  },
  {
    name: "Histoire-Géo-EMC",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
    color: "text-yellow-500 dark:text-yellow-300",
    bgColor: "bg-yellow-500/20",
  },
   {
    name: "Anglais",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>,
    color: "text-purple-500 dark:text-purple-300",
    bgColor: "bg-purple-500/20",
  },
  {
    name: "Espagnol",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 22V12"/><path d="M4 12h16"/></svg>,
    color: "text-orange-500 dark:text-orange-300",
    bgColor: "bg-orange-500/20",
  },
  {
    name: "SVT",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="5" />
        <path d="M12 14v8" />
        <path d="M9 19h6" />
        <path d="M15.5 5.5L20 1" />
        <path d="M20 5V1h-4" />
      </svg>
    ),
    color: "text-green-500 dark:text-green-300",
    bgColor: "bg-green-500/20",
  },
  {
    name: "Physique-Chimie",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>,
    color: "text-teal-500 dark:text-teal-300",
    bgColor: "bg-teal-500/20",
  },
  {
    name: "Technologie",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
    color: "text-slate-500 dark:text-slate-300",
    bgColor: "bg-slate-500/20",
  },
];


// Fix: Update type definition to allow 'className' prop for styling with React.cloneElement.
export const AVATAR_ICONS: Record<string, React.ReactElement<{ className?: string }>> = {
    'user': <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    'folder': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5a2 2 0 0 1 2-2h5l2 2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9"/></svg>,
    'book': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    'lightbulb': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a5 5 0 0 1 5 5c0 2-2 4-2 4H9s-2-2-2-4a5 5 0 0 1 5-5z"/></svg>,
    'flask': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M12 3v7l-3 7h12l-3-7V3M6 17h16"/></svg>,
    'globe': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 1 1 0 20 15 15 0 0 1 0-20"/></svg>,
    'graduation-cap': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>,
    'terminal': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6M12 19h8"/></svg>,
    'brain': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5zM12 12a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0v-1a5 5 0 0 0-5-5zM4 12a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1M20 12a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1"/></svg>,
    'atom': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.4-2.4 2.4-6.3 0-8.7s-6.3-2.4-8.7 0-2.4 6.3 0 8.7 6.3 2.4 8.7 0z"/><path d="M3.8 3.8c-2.4 2.4-2.4 6.3 0 8.7s6.3 2.4 8.7 0 2.4-6.3 0-8.7-6.3-2.4-8.7 0z"/></svg>,
    'dna': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4c0 4 4 4 4 8s-4 4-4 8M20 4c0 4-4 4-4 8s4 4 4 8M8 8h8M8 16h8"/></svg>,
    'scroll': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8a2 2 0 0 0 2-2v-2H6v2a2 2 0 0 0 2 2z"/><path d="M4 3h12a2 2 0 0 1 2 2v12H4V5a2 2 0 0 1 2-2zM16 3v18"/></svg>,
    'map': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z"/><path d="M8 2v16M16 6v16"/></svg>,
    'palette': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M7 7c2-2 5-2 7 0M7 17c2 2 5 2 7 0"/></svg>,
    'music': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    'chart-bar': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 12h4m-4 4h9m-9-8h2"/></svg>,
    'check': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
    'pin': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    'flame': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z"/></svg>,
    'target': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    'rocket': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 11.5L12 2l7.5 9.5-7.5 9.5zM12 22V2"/></svg>,
    'sparkles': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8 L19.25 5.25 L22 4 L19.25 2.75 L18 0 L16.75 2.75 L14 4 L16.75 5.25 Z M10 22 L11.25 19.25 L14 18 L11.25 16.75 L10 14 L8.75 16.75 L6 18 L8.75 19.25 Z M18 22 L16.75 19.25 L14 18 L16.75 16.75 L18 14 L19.25 16.75 L22 18 L19.25 19.25 Z M4 8 L2.75 5.25 L0 4 L2.75 2.75 L4 0 L5.25 2.75 L8 4 L5.25 5.25 Z"/></svg>,
};

// Fix: Add missing export for avatar icon keys, used in SettingsView.
export const AVATAR_ICON_KEYS = Object.keys(AVATAR_ICONS);