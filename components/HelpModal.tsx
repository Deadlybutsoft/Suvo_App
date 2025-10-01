import React, { useState, useEffect } from 'react';
import { CloseIcon, SparklesIcon, CodeIcon, LinkIcon, ArrowLeftIcon } from './icons';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpSection: React.FC<{ title: string; children: React.ReactNode; icon: React.FC<{className?: string}> }> = ({ title, children, icon: Icon }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
            <Icon className="w-6 h-6 text-zinc-400" />
        </div>
        <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <div className="mt-1 text-sm text-zinc-400 space-y-2 prose prose-sm prose-invert prose-p:my-0 prose-ul:my-0">
                {children}
            </div>
        </div>
    </div>
);

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
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
                className={`relative w-full max-w-2xl bg-black border border-zinc-700 shadow-2xl text-white transition-all duration-300 overflow-hidden rounded-xl max-h-[90vh] flex flex-col ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-6 border-b border-zinc-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Help & Tips</h2>
                    <button onClick={handleClose} className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-800 z-20">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-8 space-y-8">
                    <HelpSection title="Writing Effective Prompts" icon={SparklesIcon}>
                        <p>To get the best results, be specific and clear in your requests.</p>
                        <ul>
                            <li>Instead of "add a button", try "add a primary call-to-action button with a blue background and white text that says 'Get Started'".</li>
                            <li>Mention specific technologies or libraries you want to use, like "create a responsive navigation bar using Tailwind CSS".</li>
                            <li>You can also describe user interactions: "when the user clicks the toggle, the sidebar should slide in from the left".</li>
                        </ul>
                    </HelpSection>

                    <HelpSection title="Working with Code" icon={CodeIcon}>
                        <p>Suvo generates complete, runnable code based on a Vite + React + TypeScript stack.</p>
                        <ul>
                            <li>Use the file explorer and code viewer in the "Code" tab to see the current state of your project.</li>
                            <li>The AI will incrementally update files. It's best to make small, iterative changes.</li>
                            <li>If something goes wrong, you can ask the AI to fix it or describe the error you're seeing in the preview.</li>
                        </ul>
                    </HelpSection>
                    
                    <HelpSection title="Undoing Changes" icon={ArrowLeftIcon}>
                        <p>Made a change you don't like? You can easily go back.</p>
                        <ul>
                            <li>Each set of code changes from the AI creates a version block in the chat.</li>
                            <li>Click the "Undo" button on a version block to revert the entire project's file system to that point in time.</li>
                        </ul>
                    </HelpSection>

                    <HelpSection title="Cloning a Website" icon={LinkIcon}>
                        <p>You can clone the look and feel of an existing website from the home page.</p>
                         <ul>
                            <li>Provide a URL, and Suvo will take a screenshot and build a new single-page application that looks identical.</li>
                            <li>This is a great way to quickly scaffold a UI or get inspiration for a design.</li>
                        </ul>
                    </HelpSection>
                </main>
            </div>
        </div>
    );
};