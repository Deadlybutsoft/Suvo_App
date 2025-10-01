import React, { useEffect } from 'react';

const InkeepChatButton: React.FC = () => {
  useEffect(() => {
    let chatButton: { open: () => void; cleanup: () => void } | null = null;

    // Use an interval to check for Inkeep, as the script is loaded asynchronously.
    const intervalId = setInterval(() => {
      // Fix: Check for the specific ChatButton method to align with the centralized global type.
      if (window.Inkeep?.ChatButton) {
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
          chatButtonSettings: {
            isHidden: true,
          },
        };

        // Fix: Call ChatButton which is now correctly typed globally.
        chatButton = window.Inkeep.ChatButton(config);
        
        if (chatButton) {
          window.inkeep = {
            open: () => {
              chatButton?.open();
            }
          };
        }
      }
    }, 100); // Check every 100ms

    return () => {
      clearInterval(intervalId);
      // Clean up the Inkeep instance when the component unmounts
      if (chatButton && typeof chatButton.cleanup === 'function') {
        chatButton.cleanup();
      }
      if (window.inkeep) {
        delete (window as any).inkeep;
      }
    };
  }, []);

  return null; // This component does not render any JSX itself.
};

export default InkeepChatButton;
