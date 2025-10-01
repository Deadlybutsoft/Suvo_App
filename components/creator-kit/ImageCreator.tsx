import React, { useState } from 'react';
import { SparklesIcon, CheckIcon, SpinnerIcon } from '../icons';
import { generateImage } from '../../services/geminiService';

const urlToDataFile = async (base64: string, filename: string): Promise<File> => {
    const res = await fetch(`data:image/jpeg;base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
};

interface ImageCreatorProps {
    onSelectImages: (files: File[]) => void;
}

const aspectRatios = ['1:1', '4:3', '3:4', '16:9', '9:16'];
const imageCounts = [1, 2, 3, 4];

export const ImageCreator: React.FC<ImageCreatorProps> = ({ onSelectImages }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<{ mimeType: string; data: string }[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    const [numberOfImages, setNumberOfImages] = useState(1);
    const [aspectRatio, setAspectRatio] = useState('1:1');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedIndices([]);

        try {
            const imageData = await generateImage(prompt, { numberOfImages, aspectRatio });
            setGeneratedImages(imageData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
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
                return urlToDataFile(image.data, `generated-image-${i}.jpg`);
            })
        );
        
        onSelectImages(files);
    };

    return (
        <div className="h-full flex flex-col p-4 gap-3">
            <div className="flex flex-col gap-3 flex-shrink-0">
                <div>
                    <label className="text-xs font-medium text-zinc-300 mb-1.5 block">Number of images</label>
                    <div className="flex bg-zinc-900 p-1 rounded-lg">
                        {imageCounts.map(num => (
                            <button key={num} type="button" onClick={() => setNumberOfImages(num)} className={`w-1/4 py-1 text-sm rounded-md transition-colors ${numberOfImages === num ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-medium text-zinc-300 mb-1.5 block">Aspect ratio</label>
                     <div className="flex bg-zinc-900 p-1 rounded-lg">
                        {aspectRatios.map(ratio => (
                            <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`w-1/5 py-1 text-xs rounded-md transition-colors ${aspectRatio === ratio ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 my-2 flex items-center justify-center bg-zinc-900/50 rounded-lg overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                        <SpinnerIcon className="h-8 w-8 text-white mb-2" />
                        <p>Generating images...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-center p-4">
                        <p>Error: {error}</p>
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
                {generatedImages.length > 0 ? (
                    <button type="button" onClick={handleAttach} disabled={selectedIndices.length === 0} className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-lg hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed">
                        <CheckIcon className="w-5 h-5" />
                        Attach {selectedIndices.length > 0 ? `${selectedIndices.length} Image${selectedIndices.length > 1 ? 's' : ''}` : 'Image(s)'}
                    </button>
                ) : (
                    <button type="submit" disabled={isLoading || !prompt.trim()} className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-lg hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors">
                        <SparklesIcon className="w-5 h-5" />
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                )}
            </form>
        </div>
    );
};
