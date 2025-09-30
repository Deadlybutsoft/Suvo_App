import React, { useState, useEffect } from 'react';
import type { Integration } from './integrations';
import type { IntegrationType } from '../types';
import { CloseIcon, ExternalLinkIcon, SparklesIcon } from './icons';

interface IntegrationDetailModalProps {
  integration: Integration | null;
  onClose: () => void;
  onAdd: (integrationType: IntegrationType) => void;
}

export const IntegrationDetailModal: React.FC<IntegrationDetailModalProps> = ({ integration, onClose, onAdd }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (integration) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [integration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!integration) return null;

  const { name, description, docsUrl, id } = integration;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-lg bg-black border border-zinc-700 shadow-2xl text-white transition-all duration-300 rounded-lg ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-500 hover:bg-zinc-800 z-20">
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
          </div>

          <p className="mt-4 text-zinc-300 leading-relaxed">{description}</p>
        </div>
        
        <div className="px-8 py-5 bg-zinc-950 flex justify-between items-center">
            <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors rounded-md border border-zinc-700"
            >
                <ExternalLinkIcon className="w-4 h-4" />
                <span>Docs</span>
            </a>
            <button
                onClick={() => onAdd(id)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-colors rounded-md"
            >
                <SparklesIcon className="w-4 h-4" />
                <span>Add Integration</span>
            </button>
        </div>
      </div>
    </div>
  );
};