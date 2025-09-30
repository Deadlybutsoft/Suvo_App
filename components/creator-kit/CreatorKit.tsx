import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import { FontPicker } from './FontPicker';
import { ImageCreator } from './ImageCreator';
import { ImagePicker } from './ImagePicker';
import { SwatchIcon, PuzzlePieceIcon, SparklesIcon, FontIcon, ArrowLeftIcon, CloseIcon, ChevronRightIcon, PhotoIcon } from '../icons';

interface CreatorKitProps {
  onAddToPrompt: (text: string) => void;
  onAddImages: (files: File[]) => void;
  onClose: () => void;
  openAIAPIKey: string | null;
  onOpenSettings: () => void;
}

type KitTab = 'color' | 'icon' | 'font' | 'image-create';

const TOOLS: { id: KitTab; label: string; icon: React.FC<{className?: string}> }[] = [
    { id: 'color', label: 'Color Picker', icon: SwatchIcon },
    { id: 'icon', label: 'Icon Picker', icon: PuzzlePieceIcon },
    { id: 'font', label: 'Font Picker', icon: FontIcon },
    { id: 'image-create', label: 'Create Image', icon: SparklesIcon },
];

export const CreatorKit: React.FC<CreatorKitProps> = ({ onAddToPrompt, onAddImages, onClose, openAIAPIKey, onOpenSettings }) => {
    const [activeTool, setActiveTool] = useState<KitTab | null>(null);

    const activeToolDetails = TOOLS.find(t => t.id === activeTool);

    const renderContent = () => {
        if (!activeTool) {
            return (
                <div className="p-4">
                    <div className="grid grid-cols-1 gap-2">
                        {TOOLS.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className="w-full flex items-center justify-between p-4 text-left bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <tool.icon className="w-6 h-6 text-zinc-400" />
                                    <span className="font-medium text-white">{tool.label}</span>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-zinc-500" />
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        
        switch(activeTool) {
            case 'color': return <ColorPicker onSelectColor={(color) => { onAddToPrompt(color); onClose(); }} />;
            case 'icon': return <IconPicker onSelectIcon={(svg) => { onAddToPrompt(`Use this icon: ${svg}`); onClose(); }} />;
            case 'font': return <FontPicker onSelectFont={(font) => { onAddToPrompt(`Use the font '${font}'.`); onClose(); }} />;
            case 'image-create': return <ImageCreator onSelectImages={(files) => { onAddImages(files); onClose(); }} openAIAPIKey={openAIAPIKey} onOpenSettings={onOpenSettings} />;
            default: return null;
        }
    }

    return (
        <div className={`absolute bottom-full mb-2 w-[400px] ${activeTool ? 'h-[550px]' : 'h-auto'} max-h-[90vh] max-w-[90vw] bg-zinc-950 border border-zinc-800 shadow-2xl z-10 rounded-lg flex flex-col overflow-hidden transition-[height] duration-300 ease-in-out`}>
            <header className="flex-shrink-0 h-14 bg-black/30 border-b border-zinc-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {activeTool && (
                        <button onClick={() => setActiveTool(null)} className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400" aria-label="Back to tools menu">
                           <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    <h2 className="text-md font-semibold text-white">{activeToolDetails?.label || 'Creator Kit'}</h2>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400" aria-label="Close Creator Kit">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </header>
            <main className="flex-1 min-h-0 bg-black overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};