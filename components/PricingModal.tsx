import React, { useState, useEffect } from 'react';
import { CloseIcon, CheckIcon } from './icons';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start gap-3">
        <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
        <span>{children}</span>
    </li>
);

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div
                className={`relative w-full max-w-4xl bg-black border border-zinc-700 shadow-2xl text-white transition-all duration-300 overflow-hidden rounded-xl ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-500 hover:bg-zinc-800 z-20">
                    <CloseIcon className="w-5 h-5" />
                </button>

                <div className="relative z-10 p-8 sm:p-12 overflow-y-auto max-h-[90vh]">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Plans & Billing</h2>
                        <p className="mt-2 text-zinc-400 max-w-xl mx-auto">Choose the plan that's right for you. Unlock more power and features.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                        {/* Free Plan */}
                        <div className="bg-black p-8 flex flex-col h-full border border-zinc-700 rounded-lg">
                            <h3 className="text-2xl font-semibold">Free</h3>
                            <p className="mt-2 text-zinc-400">For getting started & personal projects.</p>
                            <div className="mt-6">
                                <span className="text-5xl font-bold">$0</span>
                                <span className="text-zinc-400 text-lg"> / month</span>
                            </div>
                            <button className="w-full mt-8 py-3 px-6 font-semibold bg-zinc-900 border border-zinc-600 text-zinc-400 transition-colors rounded-md cursor-default">
                                Your Current Plan
                            </button>
                            <ul className="space-y-4 text-zinc-300 mt-8 text-left flex-grow">
                                <PlanFeature>Access to all features</PlanFeature>
                                <PlanFeature>30 AI chats per month</PlanFeature>
                            </ul>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-black p-8 flex flex-col relative border-2 border-white rounded-lg">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full">
                                Most Popular
                            </div>
                            <h3 className="text-2xl font-semibold">Pro</h3>
                             <p className="mt-2 text-zinc-400">For professionals and teams who need more.</p>
                            <div className="mt-6">
                                <span className="text-5xl font-bold">$25</span>
                                <span className="text-zinc-400 text-lg"> / month</span>
                            </div>
                            <button className="w-full mt-8 py-3 px-6 font-semibold bg-white hover:bg-zinc-200 text-black transition-colors rounded-md">
                                Upgrade to Pro
                            </button>
                            <ul className="space-y-4 text-zinc-300 mt-8 text-left flex-grow">
                                <PlanFeature>250 AI chats per month</PlanFeature>
                                <PlanFeature>All paid features</PlanFeature>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};