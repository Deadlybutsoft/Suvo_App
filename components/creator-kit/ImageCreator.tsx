import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, CheckIcon, SpinnerIcon, SlidersIcon } from '../icons';
import { generateImage } from '../../services/imageService';

const urlToDataFile = async (base64: string, filename: string): Promise<File> => {
    // OpenAI returns PNGs, so we handle the data URL accordingly.
    const res = await fetch(`data:image/png;base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/png' });
};

interface ImageCreatorProps {
    onSelectImages: (files: File[]) => void;
    openAIAPIKey: string | null;
    onOpenSettings: () => void;
}

// Updated aspect ratios to be compatible with OpenAI's DALL-E 3 model.
const aspectRatios = ['1:1', '16:9', '9:16'];
const imageCounts = [1, 2, 3, 4];

export const ImageCreator: React.FC<ImageCreatorProps> = ({ onSelectImages, openAIAPIKey, onOpenSettings }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<{ mimeType: string; data: string }[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    const [numberOfImages, setNumberOfImages] = useState(1);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const optionsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setIsOptionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        if (!openAIAPIKey) {
            alert('OpenAI API Key is required for image generation. Please add your key in the settings.');
            onOpenSettings();
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedIndices([]);

        try {
            const imageData = await generateImage(prompt, { numberOfImages, aspectRatio }, openAIAPIKey);
            setGeneratedImages(imageData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate images: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSelection = (index: number) => {
        setSelectedIndices(prev => 
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleAttach = async () => {
        if (selectedIndices.length === 0) return;
        
        const files = await Promise.all(
            selectedIndices.map((index, i) => {
                const image = generatedImages[index];
                return urlToDataFile(image.data, `generated-image-${i}.png`);
            })
        );
        
        onSelectImages(files);
    };

    return (
        <div className="h-full flex flex-col p-4 gap-4">
            <div className="flex-1 flex items-center justify-center bg-zinc-900/50 rounded-lg overflow-y-auto min-h-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                        <SpinnerIcon className="h-8 w-8 text-white mb-2" />
                        <p>Generating images...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-center p-4">
                        <p>{error}</p>
                    </div>
                ) : generatedImages.length > 0 ? (
                    <div className={`w-full h-full p-2 grid gap-2 ${generatedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                       {generatedImages.map((image, index) => {
                            const isSelected = selectedIndices.includes(index);
                            return (
                               <button
                                   key={index}
                                   type="button"
                                   onClick={() => handleToggleSelection(index)}
                                   className={`relative rounded-lg overflow-hidden focus:outline-none ring-offset-2 ring-offset-zinc-950 transition-all duration-200 group ${isSelected ? 'ring-2 ring-white' : 'ring-0'}`}
                                   style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                               >
                                   <img
                                       src={`data:${image.mimeType};base64,${image.data}`}
                                       alt={`Generated image ${index + 1}`}
                                       className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                   />
                                   {isSelected && (
                                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                           <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center ring-4 ring-black/30">
                                               <CheckIcon className="w-5 h-5 text-zinc-900" />
                                           </div>
                                       </div>
                                   )}
                               </button>
                           )
                       })}
                    </div>
                ) : (
                    <div className="text-center text-zinc-500 p-4">
                        <SparklesIcon className="w-12 h-12 mx-auto mb-2" />
                        <p>Your generated images will appear here.</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleGenerate} className="flex-shrink-0 flex flex-col gap-2">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A cute cat astronaut in space, watercolor..."
                    className="w-full bg-zinc-900 border-zinc-700 rounded-lg py-2 px-3 focus:ring-1 focus:ring-white focus:outline-none text-zinc-200 placeholder-zinc-500 text-sm h-16 resize-none"
                    disabled={isLoading}
                    aria-label="Image generation prompt"
                />
                <div className="flex items-center gap-2">
                    {generatedImages.length > 0 ? (
                        <button type="button" onClick={handleAttach} disabled={selectedIndices.length === 0} className="flex-grow w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-lg hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed">
                            <CheckIcon className="w-5 h-5" />
                            Attach {selectedIndices.length > 0 ? `${selectedIndices.length} Image${selectedIndices.length > 1 ? 's' : ''}` : 'Image(s)'}
                        </button>
                    ) : (
                        <button type="submit" disabled={isLoading || !prompt.trim()} className="flex-grow w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-lg hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors">
                            <SparklesIcon className="w-5 h-5" />
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    )}
                    <div className="relative flex-shrink-0" ref={optionsMenuRef}>
                        <button 
                            type="button" 
                            onClick={() => setIsOptionsOpen(p => !p)} 
                            className="h-full px-3 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors"
                            title="Image options"
                            aria-expanded={isOptionsOpen}
                        >
                            <SlidersIcon className="w-5 h-5 text-zinc-300" />
                        </button>
                        {isOptionsOpen && (
                            <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-950 border border-zinc-800 shadow-xl rounded-lg p-2 z-10">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-zinc-300 mb-1.5 block px-1">Number of images</label>
                                        <div className="flex bg-zinc-900 p-1 rounded-lg">
                                            {imageCounts.map(num => (
                                                <button key={num} type="button" onClick={() => setNumberOfImages(num)} className={`w-1/4 py-1 text-sm rounded-md transition-colors ${numberOfImages === num ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-zinc-300 mb-1.5 block px-1">Aspect ratio</label>
                                        <div className="flex bg-zinc-900 p-1 rounded-lg">
                                            {aspectRatios.map(ratio => (
                                                <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`w-1/3 py-1 text-xs rounded-md transition-colors ${aspectRatio === ratio ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                                                    {ratio}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};