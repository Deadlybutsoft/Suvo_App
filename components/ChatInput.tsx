import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StopIcon, PlusIcon, CloseIcon, ArrowRightIcon, CreatorKitIcon, PhotoIcon, CheckIcon, SparklesIcon } from './icons/index';
import { AiStatus, OperationMode } from '../types';
import { CreatorKit } from './creator-kit/CreatorKit';

interface ChatInputProps {
  onSendMessage: (prompt: string, images: File[]) => void;
  aiStatus: AiStatus;
  stopGeneration: () => void;
  operationMode: OperationMode;
  onSetOperationMode: (mode: OperationMode) => void;
  openAIAPIKey: string | null;
  onOpenSettings: () => void;
}

const fileToUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};

export const ChatInput: React.FC<ChatInputProps> = ({ 
    onSendMessage, 
    aiStatus, 
    stopGeneration,
    operationMode,
    onSetOperationMode,
    openAIAPIKey,
    onOpenSettings,
}) => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [isAddMenuOpen, setAddMenuOpen] = useState(false);
  const [isCreatorKitOpen, setCreatorKitOpen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const kitPopoverRef = useRef<HTMLDivElement>(null);
  const kitButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (addMenuRef.current && !addMenuRef.current.contains(target)) {
        setAddMenuOpen(false);
      }
      if (kitPopoverRef.current && !kitPopoverRef.current.contains(target) && kitButtonRef.current && !kitButtonRef.current.contains(target)) {
        setCreatorKitOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const animationFrameId = requestAnimationFrame(() => {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 200;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      });
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [prompt]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(URL.revokeObjectURL);
    };
  }, [imagePreviews]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = await Promise.all(newFiles.map(fileToUrl));
      setImages(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
    if (e.target) e.target.value = '';
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const isGenerating = aiStatus === 'thinking' || aiStatus === 'streaming';

  const handleSend = () => {
    if (isGenerating || (!prompt.trim() && images.length === 0)) return;
    onSendMessage(prompt, images);
    setPrompt('');
    imagePreviews.forEach(URL.revokeObjectURL);
    setImages([]);
    setImagePreviews([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddImagesFromKit = async (files: File[]) => {
      const newPreviews = await Promise.all(files.map(fileToUrl));
      setImages(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
  };
  
  return (
    <div className="relative bg-black border border-zinc-400 flex flex-col text-white rounded-lg">
      <div ref={kitPopoverRef}>
        {isCreatorKitOpen && (
            <CreatorKit 
                onAddToPrompt={(text) => setPrompt(p => p ? `${p}\n${text}`: text)}
                onAddImages={handleAddImagesFromKit}
                onClose={() => setCreatorKitOpen(false)}
                openAIAPIKey={openAIAPIKey}
                onOpenSettings={onOpenSettings}
            />
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
        multiple
      />
      
      {imagePreviews.length > 0 && (
        <div className="p-3 border-b border-zinc-700">
            <div className="flex flex-wrap gap-3">
            {imagePreviews.map((preview, index) => (
                <div key={index} className="relative inline-block">
                    <img src={preview} alt={`Upload preview ${index + 1}`} className="h-24 w-auto max-w-full object-contain rounded-md" />
                    <button onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-zinc-900/80 hover:bg-zinc-800 text-white p-1 rounded-full transition-all" aria-label="Remove image">
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
            </div>
        </div>
      )}
      
      {operationMode === 'chat' && (
        <div className="bg-zinc-900 border-b border-zinc-700 p-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-300 px-2">Chat Mode</p>
          <button onClick={() => onSetOperationMode('gemini-2.5-flash')} className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors" aria-label="Exit Chat Mode" title="Exit Chat Mode">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="p-4 flex flex-col gap-4">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to build or change..."
          className="w-full bg-transparent resize-none focus:outline-none text-xl text-white placeholder:text-zinc-500 max-h-48 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent chat-input"
          rows={1}
          disabled={isGenerating}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div ref={addMenuRef} className="relative">
              <button onClick={() => setAddMenuOpen(prev => !prev)} className={`w-11 h-11 flex items-center justify-center transition-all duration-300 text-zinc-300 hover:text-white disabled:opacity-50 rounded-md ${isAddMenuOpen ? 'bg-zinc-800' : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-600'}`} disabled={isGenerating} aria-label={isAddMenuOpen ? 'Close menu' : 'Add content'} title={isAddMenuOpen ? 'Close menu' : 'Add content'}>
                <PlusIcon className={`h-5 w-5 transition-transform duration-300 ease-in-out ${isAddMenuOpen ? 'rotate-45' : ''}`} />
              </button>
              {isAddMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-zinc-950 border border-zinc-800 shadow-2xl z-10 p-1.5 rounded-lg">
                  <div className="space-y-1">
                    <button onClick={() => { fileInputRef.current?.click(); setAddMenuOpen(false); }} className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-left text-zinc-200 hover:bg-zinc-800 transition-colors rounded-md">
                      <PhotoIcon className="w-4 h-4 text-zinc-400"/> 
                      <span>Attach Image</span>
                    </button>
                    <div className="!my-1 border-t border-zinc-800"></div>
                    <button onClick={() => { onSetOperationMode('gemini-2.5-flash'); setAddMenuOpen(false); }} className={`w-full flex items-center justify-between px-2 py-1.5 text-sm text-left rounded-md transition-colors ${operationMode === 'gemini-2.5-flash' ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                      <span>Gemini 2.5 Flash</span>
                      {operationMode === 'gemini-2.5-flash' && <CheckIcon className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { onSetOperationMode('chatgpt-5'); setAddMenuOpen(false); }} className={`w-full flex items-center justify-between px-2 py-1.5 text-sm text-left rounded-md transition-colors ${operationMode === 'chatgpt-5' ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                      <span>ChatGPT 5</span>
                      {operationMode === 'chatgpt-5' && <CheckIcon className="w-4 h-4" />}
                    </button>
                    <div className="!my-1 border-t border-zinc-800"></div>
                     <button onClick={() => { onSetOperationMode('chat'); setAddMenuOpen(false); }} className={`w-full flex items-center justify-between px-2 py-1.5 text-sm text-left rounded-md transition-colors ${operationMode === 'chat' ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                      <span>Chat Mode</span>
                      {operationMode === 'chat' && <CheckIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
                ref={kitButtonRef}
                onClick={() => setCreatorKitOpen(prev => !prev)}
                className={`w-11 h-11 flex items-center justify-center transition-all duration-300 text-zinc-300 hover:text-white disabled:opacity-50 rounded-md ${isCreatorKitOpen ? 'bg-zinc-800' : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-600'}`}
                disabled={isGenerating}
                aria-label="Open Creator Kit"
                title="Creator Kit"
            >
                <CreatorKitIcon className="h-6 w-6" />
            </button>
            <button
                onClick={() => navigate('/w/ask-ai')}
                className="flex items-center justify-center gap-2 px-3 h-11 font-medium text-sm transition-all duration-300 text-zinc-300 hover:text-white disabled:opacity-50 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-600"
                disabled={isGenerating}
                aria-label="Ask AI for help"
                title="Ask AI"
            >
                <SparklesIcon className="h-5 w-5" />
                <span>Ask AI</span>
            </button>
          </div>
          
          <div className="flex items-center">
            {isGenerating ? (
              <button onClick={stopGeneration} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors rounded-md" aria-label="Stop generation">
                 <StopIcon className="h-5 w-5" />
              </button>
            ) : (
              <button onClick={handleSend} disabled={isGenerating || (!prompt.trim() && images.length === 0)} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white text-black transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-md" aria-label="Send message">
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};