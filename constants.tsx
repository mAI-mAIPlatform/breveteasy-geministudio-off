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