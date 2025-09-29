

import React from 'react';

// A different icon style for the settings page for a distinct visual feel.
// These are more solid/filled compared to the main outline-style icon set.

export const SettingsAccountIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
);

export const SettingsAppearanceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 3.5a1.5 1.5 0 0 1 3 0V4a1 1 0 0 0 1 1h.5a1.5 1.5 0 0 1 0 3h-.5a1 1 0 0 0-1 1v.5a1.5 1.5 0 0 1-3 0V8a1 1 0 0 0-1-1h-.5a1.5 1.5 0 0 1 0-3h.5a1 1 0 0 0 1-1v-.5ZM10 15.5a1.5 1.5 0 0 1-3 0V15a1 1 0 0 0-1-1h-.5a1.5 1.5 0 0 1 0-3h.5a1 1 0 0 0 1-1v-.5a1.5 1.5 0 0 1 3 0V11a1 1 0 0 0 1 1h.5a1.5 1.5 0 0 1 0 3h-.5a1 1 0 0 0-1 1v.5Z" />
    </svg>
);

export const SettingsIntegrationsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.49 3.17a.75.75 0 0 1 1.02.07l3 3.5a.75.75 0 0 1-1.11.96l-3-3.5a.75.75 0 0 1 .09-1.03ZM8.51 3.17a.75.75 0 0 0-1.02.07l-3 3.5A.75.75 0 0 0 5.6 7.7l3-3.5a.75.75 0 0 0-.09-1.03Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v5.337l1.72-2.006a.75.75 0 1 1 1.11.96l-3.001 3.5a.75.75 0 0 1-1.11 0l-3-3.5a.75.75 0 0 1 1.11-.96L9.25 8.087V2.75A.75.75 0 0 1 10 2ZM5.6 12.3a.75.75 0 0 1 1.11-.96l3 3.5a.75.75 0 0 1-.09 1.03l-3 3.5a.75.75 0 0 1-1.02-.07l-3-3.5a.75.75 0 0 1 .09-1.03l3-3.5Zm8.88 0a.75.75 0 0 0-1.11-.96l-3 3.5a.75.75 0 0 0 .09 1.03l3 3.5a.75.75 0 0 0 1.02-.07l3-3.5a.75.75 0 0 0-.09-1.03l-3-3.5Z" clipRule="evenodd" />
    </svg>
);

export const SettingsSubscriptionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
);

export const SettingsMemoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M9 15V9h6v6zm0 6v-2H7q-.825 0-1.412-.587T5 17v-2H3v-2h2v-2H3V9h2V7q0-.825.588-1.412T7 5h2V3h2v2h2V3h2v2h2q.825 0 1.413.588T19 7v2h2v2h-2v2h2v2h-2v2q0 .825-.587 1.413T17 19h-2v2h-2v-2h-2v2zm8-4V7H7v10z" />
    </svg>
);

export const SettingsApiKeysIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
);