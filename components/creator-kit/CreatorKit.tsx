import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import { FontPicker } from './FontPicker';
import { ImageCreator } from './ImageCreator';
import { SwatchIcon, PuzzlePieceIcon, SparklesIcon, FontIcon } from '../icons';

interface CreatorKitProps {
  onAddToPrompt: (text: string) => void;
  onAddImages: (files: File[]) => void;
  onClose: () => void;
}

type KitTab = 'color' | 'icon' | 'font' | 'image-create';

const TABS: { id: KitTab; label: string; icon: React.FC<{className?: string}> }[] = [
    { id: 'color', label: 'Color', icon: SwatchIcon },
    { id: 'icon', label: 'Icon', icon: PuzzlePieceIcon },
    { id: 'font', label: 'Font', icon: FontIcon },
    { id: 'image-create', label: 'Create', icon: SparklesIcon },
];


export const CreatorKit: React.FC<CreatorKitProps> = ({ onAddToPrompt, onAddImages, onClose }) => {
    const [activeTab, setActiveTab] = useState<KitTab>('color');

    const renderContent = () => {
        switch(activeTab) {
            case 'color': return <ColorPicker onSelectColor={(color) => { onAddToPrompt(color); onClose(); }} />;
            case 'icon': return <IconPicker onSelectIcon={(svg) => { onAddToPrompt(`Use this icon: ${svg}`); onClose(); }} />;
            case 'font': return <FontPicker onSelectFont={(font) => { onAddToPrompt(`Use the font '${font}'.`); onClose(); }} />;
            case 'image-create': return <ImageCreator onSelectImages={(files) => { onAddImages(files); onClose(); }} />;
            default: return null;
        }
    }

    return (
        <div className="absolute bottom-full mb-2 w-[500px] h-[550px] max-w-[90vw] bg-zinc-950 border border-zinc-800 shadow-2xl z-10 rounded-lg flex flex-col overflow-hidden">
            <header className="flex-shrink-0 bg-black/30 border-b border-zinc-800 p-2 flex items-center justify-center">
                <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                                activeTab === tab.id
                                ? "bg-zinc-700 text-white"
                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            }`}
                            title={tab.label}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>
            <main className="flex-1 min-h-0 bg-black">
                {renderContent()}
            </main>
        </div>
    );
};