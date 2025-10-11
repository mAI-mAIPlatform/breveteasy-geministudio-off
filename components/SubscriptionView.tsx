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

const PlanCard: React.FC<{ title: string; features: string[]; isCurrent: boolean; isRecommended?: boolean; }> = ({ title, features, isCurrent, isRecommended }) => (
    <div className={`relative p-6 rounded-3xl border transition-all duration-300 ${isCurrent ? 'border-sky-400 bg-sky-400/10 shadow-lg' : 'border-white/20 bg-black/10'}`}>
        {isRecommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full shadow-md">Populaire</div>}
        <h3 className="text-2xl font-bold text-gray-100 mb-4">{title}</h3>
        <ul className="space-y-3 text-gray-300">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckmarkIcon />
                    <span className="ml-3">{feature}</span>
                </li>
            ))}
        </ul>
        {isCurrent && <div className="mt-4 text-sm font-semibold text-sky-300">Votre forfait actuel</div>}
    </div>
);


export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onBack, currentPlan, onUpgrade }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            const success = onUpgrade(code.trim());
            if (success) {
                setCode('');
            }
        }
    };

    const planFeatures = {
        free: [
            "Quiz & exercices (5 questions max)",
            "Chat avec BrevetAI (10 messages/session)",
            "Historique des conversations"
        ],
        pro: [
            "Quiz & exercices (jusqu'à 15 questions)",
            "Chat avec BrevetAI (illimité)",
            "Instructions personnalisées pour l'IA",
            "Historique des conversations"
        ],
        max: [
            "Tous les avantages du forfait Pro",
            "Accès en avant-première aux nouveautés",
            "Support prioritaire"
        ]
    };
    
    const planTitleMap: Record<SubscriptionPlan, string> = {
        free: "Brevet' Easy",
        pro: "Brevet Pro",
        max: "Brevet Max",
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-xl">
                <header className="flex items-center justify-between pb-4 border-b border-white/20 dark:border-white/10 mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nos Forfaits</h2>
                    <button onClick={onBack} title="Fermer" className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <div className="text-center mb-8">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                        Votre forfait actuel est <span className="font-bold text-sky-400">{planTitleMap[currentPlan]}</span>.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Passez à un forfait supérieur pour débloquer plus de fonctionnalités.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <PlanCard title={planTitleMap.free} features={planFeatures.free} isCurrent={currentPlan === 'free'} />
                    <PlanCard title={planTitleMap.pro} features={planFeatures.pro} isCurrent={currentPlan === 'pro'} isRecommended />
                    <PlanCard title={planTitleMap.max} features={planFeatures.max} isCurrent={currentPlan === 'max'} />
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">Activer un code</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full sm:w-64 px-4 py-3 bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl shadow-sm placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center font-semibold tracking-widest uppercase"
                            placeholder="Entrez votre code"
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transform hover:scale-105 transition-all"
                        >
                            Activer
                        </button>
                    </form>
                    <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">
                        Codes de test : <code className="bg-black/20 p-1 rounded">BVTPRO</code>, <code className="bg-black/20 p-1 rounded">BVTMAX</code>
                    </p>
                </div>
            </div>
        </div>
    );
};
