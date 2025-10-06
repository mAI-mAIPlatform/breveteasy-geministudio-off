
import React from 'react';
import type { Subject } from './types';

export const SUBJECTS: Subject[] = [
  {
    name: "Français",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.22-6.065h10.44M4.5 12.016h.01M3.75 6.253a2.25 2.25 0 014.5 0v11.494a2.25 2.25 0 01-4.5 0V6.253zm16.5 0a2.25 2.25 0 00-4.5 0v11.494a2.25 2.25 0 004.5 0V6.253z" /></svg>,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    name: "Mathématiques",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3.333M9 17v-3.333M12 7V4M12 10.333l3.333-3.333M12 10.333L8.667 7M15 17H9" /></svg>,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    name: "Histoire-Géo-EMC",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-6-4.5-6-9a6 6 0 0112 0c0 4.5-6 9-6 9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a3 3 0 100-6 3 3 0 000 6z" /></svg>,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    name: "Sciences",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2.25 2.25 0 003.182-3.182l-8.25-8.25a2.25 2.25 0 00-3.182 0l-8.25 8.25a2.25 2.25 0 103.182 3.182L12 9.364l7.428 6.064z" /></svg>,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];
