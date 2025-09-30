import React from 'react';
import { SandpackConsole } from '@codesandbox/sandpack-react';
import { ConsoleIcon, ChevronDownIcon } from './icons';

interface ModernConsoleProps {
  onClose: () => void;
}

export const ModernConsole: React.FC<ModernConsoleProps> = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-1 bg-black border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <ConsoleIcon className="w-4 h-4 text-zinc-400" />
          <h3 className="font-semibold text-sm text-zinc-300">Console</h3>
        </div>
        <button
          onClick={onClose}
          title="Close Console"
          className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400"
        >
          <ChevronDownIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <SandpackConsole resetOnPreviewRestart={true} />
      </div>
    </div>
  );
};