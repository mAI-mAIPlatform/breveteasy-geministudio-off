import React from 'react';
import type { Subject } from './types';

export const SUBJECTS: Subject[] = [
  {
    name: "Français",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    name: "Mathématiques",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="12" y1="10" x2="12" y2="18"></line><line x1="8" y1="10" x2="8" y2="18"></line><line x1="8" y1="14" x2="12" y2="14"></line></svg>,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    name: "Histoire-Géo-EMC",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
   {
    name: "Anglais",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 2.05a10 10 0 0 0-8.95 8.95" />
            <path d="M21.95 11a10 10 0 0 0-8.95-8.95" />
            <path d="M2.05 13a10 10 0 0 0 8.95 8.95" />
            <path d="M13 21.95a10 10 0 0 0 8.95-8.95" />
            <path d="m2.92 8.5 5.58-5.58" />
            <path d="m4.34 11 6.66-6.66" />
            <path d="m6.5 11 4.5-4.5" />
            <path d="m15.5 2.92 5.58 5.58" />
            <path d="m13 4.34 6.66 6.66" />
            <path d="m13 6.5 4.5 4.5" />
            <path d="m2.92 15.5 5.58 5.58" />
            <path d="m4.34 13 6.66 6.66" />
            <path d="m6.5 13 4.5 4.5" />
            <path d="m15.5 21.08 5.58-5.58" />
            <path d="m13 19.66 6.66-6.66" />
            <path d="m13 17.5 4.5-4.5" />
        </svg>,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    name: "Espagnol",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 22V12"/><path d="M4 12h16"/></svg>,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    name: "SVT",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M12 20V4"/><path d="M12 4c-2.25 2.25-2.25 5-4 5"/><path d="M12 4c2.25 2.25 2.25 5 4 5"/></svg>,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    name: "Physique-Chimie",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    name: "Technologie",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
];