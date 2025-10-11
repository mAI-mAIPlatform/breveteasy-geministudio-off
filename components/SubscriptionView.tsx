import React, { useState } from 'react';
import type { SubscriptionPlan } from '../types';

interface SubscriptionViewProps {
  onBack: () => void;
  currentPlan: SubscriptionPlan;
  onUpgrade: (code: string) => boolean;
}

const CheckmarkIcon: React.FC = () => (
    <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const PlanCard: React.FC<{
    planKey: SubscriptionPlan;
    title: string;
    features: string[];
    isCurrent: boolean;
    onSelectUpgrade: (plan: SubscriptionPlan) => void;
    isRecommended?: boolean;
}> = ({ planKey, title, features, isCurrent, onSelectUpgrade, isRecommended }) => (
    <div className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col ${isCurrent ? 'border-sky-400 bg-sky-400/10 shadow-lg' : 'border-slate-700 bg-slate-800/60'}`}>
        {isRecommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full shadow-md">Populaire</div>}
        <h3 className="text-2xl font-bold text-slate-100 mb-4">{title}</h3>
        <ul className="space-y-3 text-slate-800 dark:text-slate-300 flex-grow">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckmarkIcon />
                    <span className="ml-3">{feature}</span>
                </li>
            ))}
        </ul>
        {isCurrent ? (
            <div className="mt-6 text-sm font-semibold text-sky-300 text-center">Votre forfait actuel</div>
        ) : (
            planKey !== 'free' && (
                <button
                    onClick={() => onSelectUpgrade(planKey)}
                    className="mt-6 w-full px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all"
                >
                    Passer à {title}
                </button>
            )
        )}
    </div>
);


export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onBack, currentPlan, onUpgrade }) => {
    const [code, setCode] = useState('');
    const [planToUpgrade, setPlanToUpgrade] = useState<SubscriptionPlan | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            const success = onUpgrade(code.trim());
            if (success) {
                setCode('');
                setPlanToUpgrade(null);
            }
        }
    };

    const handleSelectUpgrade = (plan: SubscriptionPlan) => {
        setPlanToUpgrade(plan);
        setCode('');
    };

    const planFeatures = {
        free: [
            "Niveau : Brevet uniquement",
            "Quiz & exercices : 5 questions max",
            "Difficulté : Normale uniquement",
            "Chat avec BrevetAI : 15 messages / jour",
            "Générations : 5 quiz ou fiches / jour",
        ],
        pro: [
            "Tous les niveaux & difficultés",
            "Quiz & exercices : jusqu'à 20 questions",
            "Chat avec BrevetAI : 100 messages / jour",
            "Générations : 50 quiz ou fiches / jour",
            "Instructions personnalisées pour l'IA",
        ],
        max: [
            "Tous les avantages du forfait Pro",
            "Quiz, exercices, chat & générations illimités",
            "Accès en avant-première aux nouveautés (Bêta)",
            "Support prioritaire",
        ]
    };
    
    const planTitleMap: Record<SubscriptionPlan, string> = {
        free: "Brevet' Easy",
        pro: "Brevet Pro",
        max: "Brevet Max",
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
                <header className="flex items-center justify-between pb-4 border-b border-white/20 dark:border-slate-700 mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Brevet +</h2>
                    <button onClick={onBack} title="Fermer" className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-slate-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <div className="text-center mb-8">
                    <p className="text-lg text-slate-700 dark:text-slate-300">
                        Votre forfait actuel est <span className="font-bold text-sky-400">{planTitleMap[currentPlan]}</span>.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">Passez à un forfait supérieur pour débloquer plus de fonctionnalités.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <PlanCard planKey="free" title={planTitleMap.free} features={planFeatures.free} isCurrent={currentPlan === 'free'} onSelectUpgrade={handleSelectUpgrade} />
                    <PlanCard planKey="pro" title={planTitleMap.pro} features={planFeatures.pro} isCurrent={currentPlan === 'pro'} onSelectUpgrade={handleSelectUpgrade} isRecommended />
                    <PlanCard planKey="max" title={planTitleMap.max} features={planFeatures.max} isCurrent={currentPlan === 'max'} onSelectUpgrade={handleSelectUpgrade} />
                </div>
                
                {planToUpgrade && (
                    <div className="mt-8 p-6 bg-black/20 dark:bg-slate-800/60 rounded-2xl border border-white/10 dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-center text-slate-800 dark:text-slate-200 mb-4">
                            Activer {planTitleMap[planToUpgrade]}
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full sm:w-64 px-4 py-3 bg-white/20 dark:bg-slate-700/60 backdrop-blur-lg border border-white/20 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-600 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center font-semibold tracking-widest uppercase"
                                placeholder="Entrez votre code"
                                autoFocus
                            />
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all"
                                >
                                    Activer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlanToUpgrade(null)}
                                    className="w-full sm:w-auto px-8 py-3 bg-black/20 dark:bg-slate-700 text-white font-medium rounded-xl hover:bg-black/30 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};