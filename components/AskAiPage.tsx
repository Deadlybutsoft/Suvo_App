import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from './icons';

export const AskAiPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let widget: { cleanup: () => void } | null = null;
    let intervalId: number | undefined;

    const initializeInkeep = () => {
      const targetElement = document.getElementById('ikp-embedded-chat-target');
      // Fix: Check for both the Inkeep function and the target element before proceeding.
      if (window.Inkeep?.EmbeddedChat && targetElement) {
        // Force-clear the target element before initializing. This is crucial for re-navigation
        // as the Inkeep widget may not clean up its DOM mutations perfectly on its own.
        targetElement.innerHTML = '';
        
        const config = {
          baseSettings: {
            apiKey: "b85a3c263723a817424684b0595301e74b33b7336f322744", // Public example key
            organizationDisplayName: "Suvo",
            primaryBrandColor: "#FBBF24", // amber-400
          },
          aiChatSettings: {
            aiAssistantName: "Suvo Assistant",
            botAvatar: {
              svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="4"/><path d="M30 70C30 50 70 50 70 30" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
              shape: 'circle',
            },
          },
        };

        // Initialize the widget
        widget = window.Inkeep.EmbeddedChat("#ikp-embedded-chat-target", config);
      }
    };

    // Use an interval to check for Inkeep, as the script is loaded asynchronously.
    intervalId = window.setInterval(() => {
      if (window.Inkeep?.EmbeddedChat) {
        clearInterval(intervalId);
        initializeInkeep();
      }
    }, 100);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (widget && typeof widget.cleanup === 'function') {
        widget.cleanup();
      }
      // Also manually clean up the target div on unmount for good measure.
      const targetElement = document.getElementById('ikp-embedded-chat-target');
      if (targetElement) {
          targetElement.innerHTML = '';
      }
    };
  }, []); // The empty dependency array is correct because the key prop on the Route handles re-mounting.

  return (
    <div className="h-full w-full bg-black flex flex-col">
      <div className="flex-shrink-0 bg-black border-b border-zinc-700 flex items-center px-4 h-12">
        <button
          onClick={() => navigate('/w')}
          className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors rounded-md"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Editor</span>
        </button>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-shrink-0 text-center py-8 px-4">
            <h1 className="text-3xl font-bold text-white">Ask Suvo AI</h1>
            <p className="mt-2 text-lg text-zinc-400">Get Help From human users and ai agents</p>
        </div>
        <div className="flex-1 h-full w-full max-w-4xl mx-auto min-h-0">
            <div id="ikp-embedded-chat-target" className="h-full w-full"></div>
        </div>
      </div>
    </div>
  );
};