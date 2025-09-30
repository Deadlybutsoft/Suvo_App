import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { SpinnerIcon } from '../icons';

interface FontItem {
  id: string;
  family: string;
  subsets: string[];
  weights: number[];
  styles: string[];
  category: string;
}

const loadedFonts = new Set<string>();

const loadFont = (fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return;
    const link = document.createElement('link');
    const formattedFamily = fontFamily.replace(/ /g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFamily}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    loadedFonts.add(fontFamily);
};

const FontPreview: React.FC<{ font: FontItem; onSelect: () => void }> = ({ font, onSelect }) => {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    loadFont(font.family);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [font.family]);

    return (
        <button
            ref={ref}
            onClick={onSelect}
            className="w-full text-left p-3 text-2xl text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
            style={{ fontFamily: `'${font.family}', sans-serif` }}
        >
            {font.family}
        </button>
    );
};

export const FontPicker: React.FC<{ onSelectFont: (font: string) => void }> = ({ onSelectFont }) => {
    const [allFonts, setAllFonts] = useState<FontItem[]>([]);
    const [filteredFonts, setFilteredFonts] = useState<FontItem[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const res = await fetch('https://api.fontsource.org/v1/fonts');
                if (!res.ok) throw new Error('Failed to fetch font list');
                const data: FontItem[] = await res.json();
                const sortedData = data.sort((a, b) => a.family.localeCompare(b.family));
                setAllFonts(sortedData);
                setFilteredFonts(sortedData);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFonts();
    }, []);

    useEffect(() => {
        if (debouncedQuery) {
            setFilteredFonts(
                allFonts.filter(font => font.family.toLowerCase().includes(debouncedQuery.toLowerCase()))
            );
        } else {
            setFilteredFonts(allFonts);
        }
    }, [debouncedQuery, allFonts]);

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search Google Fonts..."
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white outline-none transition"
                />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {isLoading && <div className="flex justify-center items-center h-full"><SpinnerIcon className="w-8 h-8 text-zinc-500" /></div>}
                {!isLoading && (
                    <div className="flex flex-col gap-1">
                        {filteredFonts.map(font => (
                            <FontPreview key={font.id} font={font} onSelect={() => onSelectFont(font.family)} />
                        ))}
                         {filteredFonts.length === 0 && <p className="text-center text-zinc-500 pt-8">No fonts found.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};