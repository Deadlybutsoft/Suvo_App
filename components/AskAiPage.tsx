import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from './icons';

export const AskAiPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let widget: { cleanup: () => void } | null = null;

    const initializeInkeep = () => {
      // Fix: Check for the specific EmbeddedChat method to align with the centralized global type.
      if (window.Inkeep?.EmbeddedChat) {
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
    const intervalId = setInterval(() => {
      // Fix: Check for the specific EmbeddedChat method.
      if (window.Inkeep?.EmbeddedChat) {
        clearInterval(intervalId);
        initializeInkeep();
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      if (widget && typeof widget.cleanup === 'function') {
        widget.cleanup();
      }
    };
  }, []);

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
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-2">
        <div className="max-h-[600px] h-full w-full max-w-4xl">
            <div id="ikp-embedded-chat-target" className="h-full w-full"></div>
        </div>
      </div>
    </div>
  );
};
