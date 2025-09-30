import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SpinnerIcon, PuzzlePieceIcon } from '../icons';

export const IconPicker: React.FC<{ onSelectIcon: (svg: string) => void; }> = ({ onSelectIcon }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingIcon, setIsFetchingIcon] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const searchIcons = setTimeout(() => {
            if (searchTerm.trim().length < 2) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            setError(null);
            fetch(`https://api.iconify.design/search?query=${encodeURIComponent(searchTerm)}&limit=96`, { signal })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch icons.');
                    return res.json();
                })
                .then(data => {
                    const icons: string[] = data.icons || [];
                    // Prefer heroicons for style consistency
                    const heroicons = icons.filter((i: string) => i.startsWith('heroicons:'));
                    const otherIcons = icons.filter((i: string) => !i.startsWith('heroicons:'));
                    setResults([...heroicons, ...otherIcons]);
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        setError('Could not load icons. Please try again.');
                        console.error(err);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, 300); // Debounce search

        return () => {
            clearTimeout(searchIcons);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [searchTerm]);

    const handleIconClick = useCallback(async (iconName: string) => {
        setIsFetchingIcon(true);
        setError(null);
        try {
            const [collection, name] = iconName.split(':');
            const response = await fetch(`https://api.iconify.design/${collection}/${name}.svg`);
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG. Status: ${response.status}`);
            }
            let svgText = await response.text();
            
            // Clean attributes for better compatibility
            svgText = svgText
                .replace(/ width="[^"]*"/, '')
                .replace(/ height="[^"]*"/, '')
                .replace(/ class="[^"]*"/, '');
            
            onSelectIcon(svgText);
        } catch (err) {
            if (err instanceof Error) {
                 setError(`Could not fetch icon: ${err.message}`);
            } else {
                 setError('An unknown error occurred while fetching the icon.');
            }
            console.error("Failed to fetch icon SVG:", err);
        } finally {
            setIsFetchingIcon(false);
        }
    }, [onSelectIcon]);

    return (
        <div className="h-full flex flex-col relative">
            {isFetchingIcon && (
                <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center">
                    <div className="text-center">
                        <SpinnerIcon className="w-8 h-8 text-white mx-auto" />
                        <p className="mt-2 text-white font-medium">Fetching Icon...</p>
                    </div>
                </div>
            )}
            <div className="p-4 border-b border-zinc-800">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for icons (e.g., user, arrow)..."
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white outline-none transition"
                    autoFocus
                />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading && (
                    <div className="h-full flex items-center justify-center">
                        <SpinnerIcon className="w-8 h-8 text-zinc-500" />
                    </div>
                )}
                {error && (
                     <div className="h-full flex items-center justify-center text-red-400 text-center p-4">
                        <p>{error}</p>
                    </div>
                )}
                {!isLoading && !error && (
                    <>
                        {results.length > 0 ? (
                            <div className="grid grid-cols-6 gap-2">
                                {results.map(iconName => {
                                     const [collection, name] = iconName.split(':');
                                     const iconUrl = `https://api.iconify.design/${collection}/${name}.svg?color=white`;
                                    return (
                                        <button
                                            key={iconName}
                                            onClick={() => handleIconClick(iconName)}
                                            className="aspect-square flex items-center justify-center p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group disabled:cursor-not-allowed"
                                            title={iconName}
                                            aria-label={`Select icon: ${name}`}
                                            disabled={isFetchingIcon}
                                        >
                                            <img src={iconUrl} alt={name} className="w-full h-full object-contain" />
                                        </button>
                                    );
                                })}
                            </div>
                        ) : searchTerm.trim().length > 1 ? (
                            <div className="flex justify-center items-center h-full text-zinc-400">
                                <p>No results found for "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
                                <PuzzlePieceIcon className="w-12 h-12 mb-4 text-zinc-600" />
                                <p className="font-medium text-zinc-400">Search for an icon</p>
                                <p className="text-sm">Type 2+ characters. Powered by Iconify.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
