import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { SpinnerIcon, PuzzlePieceIcon } from '../icons';

interface IconifyIcon {
  name: string;
  total: number;
  height: number;
  author: { name: string; url: string; };
  license: { title: string; url: string; };
  samples: string[];
  tags: string[];
  collections: string[];
  prefix: string;
}

const SEARCH_LIMIT = 96;

export const IconPicker: React.FC<{ onSelectIcon: (svg: string) => void; }> = ({ onSelectIcon }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IconifyIcon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingIcon, setIsFetchingIcon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchIcons = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.iconify.design/search?query=${searchQuery}&limit=${SEARCH_LIMIT}`, {
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) throw new Error('Failed to fetch icons');
      const data = await response.json();
      
      const icons: IconifyIcon[] = data.icons || [];
      
      // Prioritize heroicons
      icons.sort((a, b) => {
          const aIsHero = a.prefix === 'heroicons';
          const bIsHero = b.prefix === 'heroicons';
          if (aIsHero && !bIsHero) return -1;
          if (!aIsHero && bIsHero) return 1;
          return 0;
      });

      setResults(icons);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Could not fetch icons. Please try again.');
        console.error("Icon search error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    searchIcons(debouncedQuery);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, searchIcons]);
  
  const handleIconClick = async (prefix: string, name: string) => {
    setIsFetchingIcon(true);
    try {
      const response = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`);
      if (!response.ok) throw new Error('Failed to fetch SVG');
      
      let svgText = await response.text();

      // Clean the SVG attributes as per the guide
      svgText = svgText
        .replace(/ width="[^"]*"/, '')
        .replace(/ height="[^"]*"/, '')
        .replace(/ class="[^"]*"/, '');
      
      onSelectIcon(svgText);
    } catch (error) {
        alert('Could not retrieve icon SVG. Please try again.');
        console.error("Icon fetch error:", error);
    } finally {
        setIsFetchingIcon(false);
    }
  };

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
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for icons (e.g., 'user', 'arrow')"
          className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white outline-none transition"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
            <div className="h-full flex items-center justify-center">
                <SpinnerIcon className="w-8 h-8 text-zinc-500" />
            </div>
        )}
        {!isLoading && error && (
            <div className="h-full flex items-center justify-center text-red-400">
                <p className="text-center">{error}</p>
            </div>
        )}
        {!isLoading && !error && (
            <>
                {results.length > 0 ? (
                    <div className="grid grid-cols-6 gap-2">
                        {results.map(icon => (
                            <button
                                key={icon.prefix + ':' + icon.name}
                                title={icon.name}
                                onClick={() => handleIconClick(icon.prefix, icon.name)}
                                className="aspect-square flex items-center justify-center p-2 bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors"
                            >
                                <img
                                    src={`https://api.iconify.design/${icon.prefix}/${icon.name}.svg?color=white`}
                                    alt={icon.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                ) : debouncedQuery ? (
                    <div className="h-full flex items-center justify-center text-zinc-500">
                        <p>No icons found for "{debouncedQuery}".</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
                        <PuzzlePieceIcon className="w-12 h-12 mb-4 text-zinc-600" />
                        <p className="font-medium text-zinc-400">Search for an icon</p>
                        <p className="text-sm">Powered by Iconify.</p>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};