
import React, { useState } from 'react';
import type { SubscriptionPlan } from '@/lib/types';

interface SubscriptionViewProps {
  currentPlan: SubscriptionPlan;
  onUpgrade: (code: string) => boolean;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <CheckIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
        <span className="text-slate-300">{children}</span>
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

    const cardBg = "bg-slate-800";
    const isFree = planKey === 'free';

    return (
        <div className={`relative flex flex-col p-8 ${cardBg} rounded-3xl border border-slate-700 shadow-2xl`}>
            {isRecommended && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 text-white text-sm font-bold rounded-full shadow-lg">
                    Recommandé
                </div>
            )}
            <h3 className={`text-3xl font-bold mb-6 text-center ${planKey === 'pro' ? 'text-cyan-300' : planKey === 'max' ? 'text-purple-300' : 'text-white'}`}>{planName}</h3>
            <ul className="space-y-4 mb-8 flex-grow">
                {features.map((feature, index) => (
                    <PlanFeature key={index}>{feature}</PlanFeature>
                ))}
            </ul>
            <div className="mt-auto">
                {isCurrent ? (
                    <div className="text-center font-bold py-3 px-6 rounded-xl border-2 border-green-500 text-green-400">
                        Votre forfait actuel
                    </div>
                ) : isFree ? null : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                         <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full text-center px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-base text-slate-100 placeholder-slate-500 transition"
                            placeholder="Code d'activation"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 px-6 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all disabled:opacity-50"
                            disabled={!code.trim()}
                        >
                            Entrer le code
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
                "Chat avec BrevetAI (modèle standard)",
                "Générations (Quiz, Exercices) : 5 / jour",
                "Max 5 questions/exercices par génération",
                "Génération d'images FaceAI : 2 / jour",
            ]
        },
        pro: {
            name: 'Brevet Pro',
            recommended: true,
            features: [
                "Tous les avantages du forfait Gratuit, et...",
                "Accès à BrevetAI Pro (100 messages / jour)",
                "Générations (Quiz, Cours...) : 50 / jour",
                "Max 20 questions/exercices par génération",
                "Accès à tous les niveaux & difficultés",
                "Instructions personnalisées pour l'IA",
                "Accès à FaceAI Pro (5 images / jour)",
            ]
        },
        max: {
            name: 'Brevet Max',
            features: [
                "Tous les avantages du forfait Pro",
                "Accès illimité à BrevetAI Max & FaceAI Max",
                "Générations, Chat & Images illimités",
                "Support prioritaire",
            ]
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <header className="text-center mb-12">
                <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white">Brevet' Easy</h2>
                <p className="text-xl text-slate-700 dark:text-slate-300 mt-2">
                    Choisissez le forfait qui vous convient le mieux pour réussir votre brevet.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
