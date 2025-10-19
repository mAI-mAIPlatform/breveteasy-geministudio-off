import React, { useState } from 'react';
import type { SubscriptionPlan } from '../types';

interface SubscriptionViewProps {
  currentPlan: SubscriptionPlan;
  onUpgrade: (code: string) => boolean;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-green-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start gap-3">
        <CheckIcon className="h-5 w-5 mt-1 flex-shrink-0" />
        <span className="text-slate-800 dark:text-slate-200">{children}</span>
    </li>
);

interface PlanCardProps {
    planName: string;
    planKey: SubscriptionPlan;
    features: string[];
    isRecommended?: boolean;
    isCurrent: boolean;
    onUpgrade: (code: string) => boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ planName, planKey, features, isRecommended, isCurrent, onUpgrade }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            const success = onUpgrade(code);
            if (success) {
                setCode('');
            }
        }
    };

    const cardBg = "bg-white/5 dark:bg-slate-900/60";
    const isFree = planKey === 'free';
    
    const borderColor = isRecommended ? 'border-indigo-500' : 'border-white/20 dark:border-slate-700/80';
    const textColor = planKey === 'pro' ? 'text-slate-900 dark:text-cyan-300' : planKey === 'max' ? 'text-slate-900 dark:text-purple-300' : 'text-slate-900 dark:text-white';

    return (
        <div className={`relative flex flex-col p-8 ${cardBg} rounded-3xl border-2 ${borderColor} shadow-2xl backdrop-blur-lg`}>
            {isRecommended && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 text-white text-sm font-bold rounded-full shadow-lg">
                    Recommandé
                </div>
            )}
            <h3 className={`text-3xl font-bold mb-6 text-center ${textColor}`}>{planName}</h3>
            <ul className="space-y-4 mb-8 flex-grow">
                {features.map((feature, index) => (
                    <PlanFeature key={index}>{feature}</PlanFeature>
                ))}
            </ul>
            <div className="mt-auto">
                {isCurrent ? (
                    <div className="text-center font-bold py-3 px-6 rounded-xl border-2 border-green-500 text-green-500 dark:text-green-400">
                        Votre forfait actuel
                    </div>
                ) : isFree ? null : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                         <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full text-center px-4 py-3 bg-white/20 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 transition"
                            placeholder="Code d'activation"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 px-6 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all disabled:opacity-50"
                            disabled={!code.trim()}
                        >
                            Activer
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};


export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ currentPlan, onUpgrade }) => {
    
    const plans = {
        free: {
            name: 'Gratuit',
            features: [
                "Chat avec BrevetAI (Standard)",
                "5 Générations / jour (Quiz, Exercices)",
                "Max 5 éléments par génération",
                "2 FaceAI / jour (Images Standard)",
                "Accès aux fonctionnalités de base",
            ]
        },
        pro: {
            name: 'Brevet Pro',
            recommended: true,
            features: [
                "Tous les avantages du forfait Gratuit",
                "Accès à BrevetAI Pro (plus intelligent)",
                "50 Générations / jour",
                "Max 10 éléments par génération",
                "Génération de Cours & Fiches",
                "5 FaceAI Pro / jour (Images HD)",
                "Personnalisation de l'IA (Instructions)",
            ]
        },
        max: {
            name: 'Brevet Max',
            features: [
                "Tous les avantages du forfait Pro",
                "Accès illimité à BrevetAI Max",
                "Générations & Images Illimitées",
                "Max 10 éléments par génération",
                "Accès à CanvasAI Pro & Max",
                "Recherche Web dans BrevetAI",
                "Support prioritaire",
            ]
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <header className="text-center mb-12">
                <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white">Brevet' Easy</h2>
                <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">
                    La meilleure expérience pour réussir votre brevet.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                 <PlanCard
                    planName={plans.free.name}
                    planKey="free"
                    features={plans.free.features}
                    isCurrent={currentPlan === 'free'}
                    onUpgrade={onUpgrade}
                />
                <PlanCard
                    planName={plans.pro.name}
                    planKey="pro"
                    features={plans.pro.features}
                    isRecommended={plans.pro.recommended}
                    isCurrent={currentPlan === 'pro'}
                    onUpgrade={onUpgrade}
                />
                <PlanCard
                    planName={plans.max.name}
                    planKey="max"
                    features={plans.max.features}
                    isCurrent={currentPlan === 'max'}
                    onUpgrade={onUpgrade}
                />
            </div>
        </div>
    );
};