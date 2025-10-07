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
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M5 20h14"/><rect width="18" height="12" x="3" y="8" rx="2"/><path d="M8 12h.01"/><path d="M8 16h.01"/><path d="M12 12h.01"/><path d="M12 16h.01"/><path d="M16 12h.01"/><path d="M16 16h.01"/></svg>,
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
    name: "Sciences",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-5.91-2.81-8.74s-6.7-4.85-8.74-2.81c-2.04 2.03-.02 5.91 2.81 8.74s6.7 4.85 8.74 2.81Z"/><path d="M3.8 3.8c-2.04 2.03-.02 5.91 2.81 8.74s6.7 4.85 8.74 2.81c2.04-2.03.02-5.91-2.81-8.74s-6.7-4.85-8.74-2.81Z"/></svg>,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];