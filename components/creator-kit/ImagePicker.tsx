import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { SpinnerIcon, CheckIcon } from '../icons';

interface WikimediaImage {
  pageid: number;
  title: string;
  imageinfo: { url: string; thumburl: string; }[];
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const urlToDataFile = async (url: string, filename: string, mimeType?: string): Promise<File> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType || blob.type });
};


export const ImagePicker: React.FC<{ onSelectImages: (files: File[]) => void }> = ({ onSelectImages }) => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<WikimediaImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const debouncedQuery = useDebounce(query, 500);

  const fetchImages = useCallback(async (searchQuery: string, currentOffset: number) => {
    if (!searchQuery || !hasMore) return;
    setIsLoading(true);

    const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `"${searchQuery}"`,
        gsrnamespace: '6', // File namespace
        gsrlimit: '20',
        gsroffset: currentOffset.toString(),
        prop: 'imageinfo',
        iiprop: 'url|thumburl',
        iiurlwidth: '300',
        format: 'json',
        origin: '*'
    });
    
    try {
      const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
      const data = await res.json();
      
      const newImages: WikimediaImage[] = data.query ? Object.values(data.query.pages) : [];
      setImages(prev => currentOffset === 0 ? newImages : [...prev, ...newImages]);
      setHasMore(!!data.continue);
      setOffset(prev => prev + 20);
    } catch (error) {
      // FIX: The 'error' object in a catch block is of type 'unknown' and cannot be directly concatenated with a string. It must be explicitly converted.
      console.error("Error fetching images from Wikimedia: " + String(error));
    } finally {
      setIsLoading(false);
    }
  }, [hasMore]);

  useEffect(() => {
    setImages([]);
    setOffset(0);
    setHasMore(true);
    if (debouncedQuery) {
        fetchImages(debouncedQuery, 0);
    }
  }, [debouncedQuery, fetchImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore && debouncedQuery) {
          fetchImages(debouncedQuery, offset);
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => observer.disconnect();
  }, [loaderRef, isLoading, hasMore, debouncedQuery, offset, fetchImages]);

  const toggleSelection = (url: string) => {
    setSelectedImages(prev => {
        const next = new Set(prev);
        if (next.has(url)) next.delete(url);
        else next.add(url);
        return next;
    });
  }

  const handleAttach = async () => {
    if (selectedImages.size === 0) return;
    const files = await Promise.all(
        Array.from(selectedImages).map((url, i) => urlToDataFile(url, `image-${i}.png`))
    );
    onSelectImages(files);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for images on Wikimedia..." className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white outline-none transition" />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-2">
            {images.map(img => img.imageinfo?.[0]?.thumburl && (
              <button key={img.pageid} onClick={() => toggleSelection(img.imageinfo[0].url)} className="relative aspect-square group">
                <img src={img.imageinfo[0].thumburl} alt={img.title} className="w-full h-full object-cover rounded-md" />
                {selectedImages.has(img.imageinfo[0].url) && (
                    <div className="absolute inset-0 bg-sky-500/50 flex items-center justify-center rounded-md">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                           <CheckIcon className="w-6 h-6 text-sky-500" />
                        </div>
                    </div>
                )}
              </button>
            ))}
        </div>
        <div ref={loaderRef} className="h-10 w-full flex justify-center items-center">
            {isLoading && <SpinnerIcon className="w-8 h-8 text-zinc-500" />}
        </div>
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