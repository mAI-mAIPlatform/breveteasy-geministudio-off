import React from 'react';

const SparklesIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

interface PremiumBadgeProps {
  requiredPlan: 'pro' | 'max';
  className?: string;
  size?: 'small' | 'normal';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ requiredPlan, className = '', size = 'normal' }) => {
    const sizeClasses = size === 'small'
        ? 'px-2 py-0.5 text-xs gap-1'
        : 'px-4 py-2 text-sm gap-2';
    const iconSize = size === 'small' ? 'h-3 w-3' : 'h-4 w-4';

    return (
        <div className={`absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl ${className}`} title={`Fonctionnalité ${requiredPlan === 'pro' ? 'Pro' : 'Max'}`}>
            <div className={`flex items-center bg-white text-slate-900 font-bold rounded-full shadow-lg ${sizeClasses}`}>
                <SparklesIcon className={`${iconSize} ${requiredPlan === 'max' ? 'text-purple-500' : 'text-indigo-500'}`}/>
                <span>{requiredPlan.toUpperCase()}</span>
            </div>
        </div>
    );
};