import React, { useEffect } from 'react';

declare global {
  interface Window {
    Inkeep?: {
      ChatButton: (config: any) => { cleanup: () => void };
    };
  }
}

const InkeepChatButton: React.FC = () => {
  useEffect(() => {
    let chatButton: { cleanup: () => void } | null = null;

    // Use an interval to check for Inkeep, as the script is loaded asynchronously.
    const intervalId = setInterval(() => {
      if (window.Inkeep) {
        clearInterval(intervalId);
        
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
          label: "Help & AI Assistant",
        };

        chatButton = window.Inkeep.ChatButton(config);
      }
    }, 100); // Check every 100ms

    return () => {
      clearInterval(intervalId);
      // Clean up the Inkeep instance when the component unmounts
      if (chatButton && typeof chatButton.cleanup === 'function') {
        chatButton.cleanup();
      }
    };
  }, []);

  return null; // This component does not render any JSX itself.
};

export default InkeepChatButton;
