import React from 'react';

interface SuvoChatSuggestionsProps {
    // This component no longer shows suggestions, so no props are needed.
}

export const SuvoChatSuggestions: React.FC<SuvoChatSuggestionsProps> = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 select-none">
            <h1 className="text-5xl font-bold text-slate-100 dark:text-zinc-800 font-logo mt-4">Suvo</h1>
        </div>
    );
};