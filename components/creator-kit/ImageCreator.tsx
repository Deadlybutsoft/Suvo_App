import React, { useState, useRef, useEffect } from 'react';
import { generateImage, AspectRatio } from '../../services/openai';
import { SpinnerIcon, CheckIcon, SparklesIcon, ChevronDownIcon } from '../icons';

const urlToDataFile = async (base64: string, filename: string): Promise<File> => {
    const res = await fetch(`data:image/jpeg;base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
};

const aspectRatios: { label: string; value: AspectRatio }[] = [
    { label: 'Square (1:1)', value: '1:1' },
    { label: 'Widescreen (16:9)', value: '16:9' },
    { label: 'Tall (9:16)', value: '9:16' },
];

interface ImageCreatorProps {
    onSelectImages: (files: File[]) => void;
    openAIAPIKey: string | null;
    onOpenSettings: () => void;
}

export const ImageCreator: React.FC<ImageCreatorProps> = ({ onSelectImages, openAIAPIKey, onOpenSettings }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [numImages, setNumImages] = useState(1);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(false);
    const aspectRatioRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (aspectRatioRef.current && !aspectRatioRef.current.contains(event.target as Node)) {
                setIsAspectRatioOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        if (!openAIAPIKey) {
            setError("OpenAI API key is missing. Please add it in Settings > API Keys.");
            onOpenSettings();
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedImages(new Set());
        try {
            const images = await generateImage(prompt, { numberOfImages: numImages, aspectRatio }, openAIAPIKey);
            setGeneratedImages(images);
        } catch (err) {
            // FIX: The 'err' object from a catch block is of type 'unknown'.
            // We must check if it's an instance of Error before accessing .message.
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
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

    const selectedAspectRatioLabel = aspectRatios.find(ar => ar.value === aspectRatio)?.label.split(' ')[0] || '1:1';

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading && (
                    <div className="h-full flex items-center justify-center">
                        <SpinnerIcon className="w-10 h-10 text-zinc-500" />
                    </div>
                )}
                {!isLoading && error && (
                    <div className="h-full flex items-center justify-center text-red-400">
                        <p className="text-center p-4">{error}</p>
                    </div>
                )}
                {!isLoading && !error && generatedImages.length > 0 && (
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
                {!isLoading && !error && generatedImages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
                        <SparklesIcon className="w-12 h-12 mb-4 text-zinc-600" />
                        <p className="font-medium text-zinc-400">Images you generate will appear here.</p>
                        <p className="text-sm">Describe what you want to create and click generate.</p>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 p-3 border-t border-zinc-800 space-y-3">
                <div className="flex items-start gap-2">
                    <textarea 
                        value={prompt} 
                        onChange={e => setPrompt(e.target.value)} 
                        placeholder="A photorealistic image of..." 
                        rows={2} 
                        className="flex-grow resize-none p-2.5 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white outline-none transition" 
                    />
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !prompt.trim()} 
                        className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white text-black rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        title="Generate Image"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                    </button>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div ref={aspectRatioRef} className="relative">
                            <button 
                                onClick={() => setIsAspectRatioOpen(p => !p)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
                            >
                                <span>{selectedAspectRatioLabel}</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isAspectRatioOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isAspectRatioOpen && (
                                <div className="absolute bottom-full left-0 mb-1 w-48 bg-zinc-900 border border-zinc-700 shadow-lg z-10 p-1 rounded-md">
                                    {aspectRatios.map(ar => (
                                        <button 
                                            key={ar.value}
                                            onClick={() => { setAspectRatio(ar.value); setIsAspectRatioOpen(false); }}
                                            className="w-full text-left text-sm px-3 py-1.5 rounded hover:bg-zinc-800"
                                        >
                                            {ar.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-700 rounded-md">
                            {[1, 2, 4].map(n => (
                                <button 
                                    key={n}
                                    onClick={() => setNumImages(n)}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${numImages === n ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleAttach}
                        disabled={selectedImages.size === 0}
                        className="px-4 py-1.5 font-semibold bg-white text-black rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {selectedImages.size > 0 ? `Attach ${selectedImages.size}` : 'Attach'}
                    </button>
                </div>
            </div>
        </div>
    );
};