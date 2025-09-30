import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, DownloadIcon, IntegrationsIcon } from './icons/index';
import type { IntegrationType } from '../types';
import { INTEGRATIONS } from './integrations';

interface HeaderProps {
  onMenuClick: () => void;
  onUpgradeClick: () => void;
  onSelectIntegration: (integration: IntegrationType) => void;
  onDownloadZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  onUpgradeClick, 
  onSelectIntegration,
  onDownloadZip,
}) => {
  const [isIntegrationsMenuOpen, setIntegrationsMenuOpen] = useState(false);
  const integrationsMenuRef = useRef<HTMLDivElement>(null);
  const [isDownloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (integrationsMenuRef.current && !integrationsMenuRef.current.contains(event.target as Node)) {
        setIntegrationsMenuOpen(false);
      }
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setDownloadMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 h-16 z-30 bg-black border-b border-zinc-700">
      <div className="flex items-center gap-4">
        <Link to="/">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white select-none font-logo">Suvo</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={integrationsMenuRef}>
          <button
            onClick={() => setIntegrationsMenuOpen(prev => !prev)}
            title="Add Integration"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-black text-zinc-300 hover:text-white border border-zinc-600 hover:border-zinc-500 transition-colors rounded-md"
          >
            <IntegrationsIcon className="h-5 w-5 text-zinc-400" />
            <span>Integrations</span>
          </button>
          {isIntegrationsMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-black border border-zinc-600 shadow-xl z-20 p-2 rounded-lg">
                <div className="px-2 pt-2 pb-1">
                    <h3 className="text-sm font-semibold text-white">Add Integration</h3>
                </div>
                <div className="my-1 border-t border-zinc-700 mx-2"></div>
                <div className="mt-1 space-y-1">
                    {INTEGRATIONS.map(integration => (
                        <button 
                            key={integration.id}
                            onClick={() => { onSelectIntegration(integration.id); setIntegrationsMenuOpen(false); }} 
                            className="w-full p-2 text-sm text-left rounded-md hover:bg-zinc-900 transition-colors"
                        >
                            <span className="font-medium text-slate-200">{integration.name}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>
        
        <div className="relative" ref={downloadMenuRef}>
            <button
                onClick={() => setDownloadMenuOpen(prev => !prev)}
                title="Download"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-black text-zinc-300 hover:text-white border border-zinc-600 hover:border-zinc-500 transition-colors rounded-md"
            >
                <DownloadIcon className="h-5 w-5 text-zinc-400" />
                <span>Export</span>
            </button>
            {isDownloadMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-black border border-zinc-600 shadow-xl z-20 p-2 rounded-lg">
                    <div className="space-y-1">
                        <button 
                            onClick={() => { onDownloadZip(); setDownloadMenuOpen(false); }}
                            className="w-full flex items-center gap-3 p-2 text-sm text-left rounded-md hover:bg-zinc-900 transition-colors"
                        >
                            <DownloadIcon className="w-5 h-5 text-slate-300" />
                            <span className="font-medium text-slate-200">Download Project (.zip)</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        <button
          onClick={onUpgradeClick}
          className="text-sm font-semibold bg-white text-black px-5 py-2 rounded-md hover:bg-zinc-200 transition-colors"
        >
          Upgrade
        </button>
        
        <div className="h-6 w-px bg-zinc-700/50 mx-1"></div>
        
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-zinc-900 transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon className="h-6 w-6 text-zinc-300" />
        </button>
      </div>
    </header>
  );
};