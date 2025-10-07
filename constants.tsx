
import React from 'react';
import type { Subject } from './types';

export const SUBJECTS: Subject[] = [
  {
    name: "Français",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    name: "Mathématiques",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h.01M9 19h6m-6-8a1 1 0 01-1-1V8a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1m-6 0a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1v-2a1 1 0 00-1-1m-6 0H6.75A.75.75 0 006 11.25v1.5c0 .414.336.75.75.75H9m6 0h.75a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75H15m0 0v-2m0 2v2" /></svg>,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    name: "Histoire-Géo-EMC",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.75 15.75l.25.25A.5.5 0 008.354 16h7.292a.5.5 0 00.353-.146l.25-.25M12 10.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5c-1.355 0-2.617.29-3.75.823M15.75 10.5c-1.133-.533-2.395-.823-3.75-.823m0 0V3m0 18v-5.25" /></svg>,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    name: "Sciences",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 21a2.25 2.25 0 01-2.25-2.25v-8.384a2.25 2.25 0 00-.5-1.488l-2.438-2.925A2.25 2.25 0 0012.75 5.25h-1.5a2.25 2.25 0 00-1.562.653L7.25 8.838a2.25 2.25 0 00-.5 1.488v8.384a2.25 2.25 0 01-2.25 2.25h-1.5a.75.75 0 01-.75-.75V8.25a.75.75 0 01.75-.75h1.5a2.25 2.25 0 002.25-2.25V3.75A.75.75 0 018.25 3h7.5a.75.75 0 01.75.75v1.5a2.25 2.25 0 002.25 2.25h1.5a.75.75 0 01.75.75v12a.75.75 0 01-.75-.75h-1.5z" /></svg>,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];
