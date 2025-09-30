import React, { useState } from 'react';
import { generateImage, AspectRatio } from '../../services/gemini';
import { SpinnerIcon, CheckIcon, SparklesIcon } from '../icons';

const urlToDataFile = async (base64: string, filename: string): Promise<File> => {
    const res = await fetch(`data:image/jpeg;base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
};

const aspectRatios: { label: string; value: AspectRatio }[] = [
    { label: 'Square', value: '1:1' },
    { label: 'Portrait', value: '3:4' },
    { label: 'Landscape', value: '16:9' },
];

export const ImageCreator: React.FC<{ onSelectImages: (files: File[]) => void; }> = ({ onSelectImages }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [numImages, setNumImages] = useState(1);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedImages(new Set());
        try {
            const images = await generateImage(prompt, { numberOfImages: numImages, aspectRatio });
            setGeneratedImages(images);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                // FIX: The 'err' variable is of type 'unknown' and cannot be assigned to a state that expects a string. Convert it to a string.
                setError(String(err));
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleSelection = (base64: string) => {
        setSelectedImages(prev => {
            const next = new Set(prev);
            if (next.has(base64)) next.delete(base64);
            else next.add(base64);
            return next;
        });
    };
    
    const handleAttach = async () => {
        if (selectedImages.size === 0) return;
        const files = await Promise.all(
            Array.from(selectedImages).map((base64, i) => urlToDataFile(base64, `generated-image-${i}.jpg`))
        );
        onSelectImages(files);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 space-y-3 border-b border-zinc-800">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the image you want to create..." rows={3} className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white outline-none transition" />
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-zinc-400">Aspect Ratio</label>
                        <div className="flex items-center gap-1 mt-1 bg-zinc-900 p-1 rounded-md border border-zinc-700">
                            {aspectRatios.map(ar => (
                                <button key={ar.value} onClick={() => setAspectRatio(ar.value)} className={`flex-1 text-xs px-2 py-1 rounded ${aspectRatio === ar.value ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>{ar.label}</button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="text-xs text-zinc-400">Number of Images</label>
                        <div className="flex items-center gap-1 mt-1 bg-zinc-900 p-1 rounded-md border border-zinc-700">
                            {[1, 2, 4].map(n => (
                                <button key={n} onClick={() => setNumImages(n)} className={`flex-1 text-xs px-2 py-1 rounded ${numImages === n ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>{n}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold bg-white text-black rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50">
                    {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                    {isLoading ? 'Generating...' : `Generate Image${numImages > 1 ? 's' : ''}`}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {error && <p className="text-center text-red-400 p-4">{error}</p>}
                {generatedImages.length > 0 && (
                    <div className={`grid gap-2 ${generatedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {generatedImages.map((base64, i) => (
                           <button key={i} onClick={() => toggleSelection(base64)} className="relative aspect-square group">
                                <img src={`data:image/jpeg;base64,${base64}`} alt={`Generated image ${i + 1}`} className="w-full h-full object-cover rounded-md" />
                                {selectedImages.has(base64) && (
                                    <div className="absolute inset-0 bg-sky-500/50 flex items-center justify-center rounded-md">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-6 h-6 text-sky-500" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
             {selectedImages.size > 0 && (
                <div className="flex-shrink-0 p-4 border-t border-zinc-800">
                    <button onClick={handleAttach} className="w-full py-2.5 px-4 font-semibold bg-white text-black rounded-md hover:bg-zinc-200 transition-colors">
                        Attach {selectedImages.size} Image{selectedImages.size > 1 ? 's' : ''}
                    </button>
                </div>
            )}
        </div>
    );
};