import React, { useState } from 'react';
import { ChatInput } from './ChatInput';
import { Link } from 'react-router-dom';
import { AuthPage } from './AuthPage';
import { SparklesIcon, LinkIcon, ArrowRightIcon, SpinnerIcon } from './icons';

interface HomePageProps {
  onLaunchWorkspace: (prompt?: string, image?: File | null) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onLaunchWorkspace }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mode, setMode] = useState<'clone' | 'prompt'>('clone');
  const [cloneUrl, setCloneUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (prompt: string, image: File | null) => {
    const isInputProvided = prompt.trim() !== '' || image !== null;
    onLaunchWorkspace(isInputProvided ? prompt : undefined, image);
  };

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleClone = async () => {
    if (!cloneUrl.trim() || isLoading) {
        return;
    }
    setIsLoading(true);

    const url = 'https://api.firecrawl.dev/v2/scrape';
    const options = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer fc-255f8db2b9d14e76a2520846282d428c',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "url": cloneUrl,
            "onlyMainContent": true,
            "maxAge": 172800000,
            "parsers": [],
            "formats": [
                {
                    "type": "screenshot",
                    "fullPage": true,
                    "output": "base64"
                }
            ],
            "origin": "website"
        })
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Firecrawl API failed with status ${response.status}`);
        }

        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
             throw new Error('Invalid response structure from Firecrawl API.');
        }

        const screenshotResult = result.data.find((item: any) => item.type === 'screenshot');

        if (!screenshotResult || screenshotResult.status !== 'success' || !screenshotResult.data) {
            const errorReason = screenshotResult?.error || 'Screenshot data not found in Firecrawl response.';
            throw new Error(errorReason);
        }

        const screenshotBase64 = screenshotResult.data;

        const blob = base64ToBlob(screenshotBase64, 'image/png');
        const imageFile = new File([blob], 'screenshot.png', { type: 'image/png' });

        const clonePrompt = `This is a screenshot of a website. Please create a new single-page application that looks identical to it. Pay close attention to layout, colors, fonts, and spacing.`;
        onLaunchWorkspace(clonePrompt, imageFile);

    } catch (error) {
        console.error("Failed to clone site:", error);
        alert(`Failed to clone site: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
    }
  };


  return (
    <div className="h-screen w-screen text-white flex flex-col bg-black">
        <header className="flex-shrink-0 z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center p-4 sm:p-6">
                <Link to="/" className="text-2xl font-bold text-white select-none font-logo">Suvo</Link>
                <button 
                    onClick={() => setIsAuthOpen(true)}
                    className="px-4 py-2 bg-transparent text-white border border-white rounded-none hover:bg-white hover:text-black transition-colors font-semibold"
                >
                    Sign In
                </button>
            </div>
        </header>

        <div className="flex-1 flex flex-col overflow-y-auto grid-pattern">
            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center text-center w-full max-w-4xl mx-auto z-10 px-4 pt-10 pb-8">
              <button 
                onClick={() => onLaunchWorkspace()} 
                className="mb-8 px-4 py-2 bg-yellow-400 text-black rounded-none hover:bg-yellow-500 transition-colors font-semibold text-sm"
              >
                DEV MODE: Launch Workspace
              </button>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-white">
                Build <span className="underline decoration-wavy decoration-yellow-400 underline-offset-8">Real Apps</span>. Fast as Hell.
              </h1>
              <p className="mt-4 text-xl text-zinc-400 max-w-2xl">
                Suvo makes ideas go live: apps, functions, <span className="text-white font-medium">integrations</span>, no fluff.
              </p>

              <div className="flex items-center border border-zinc-400 mt-12 mb-6">
                <button 
                    onClick={() => setMode('clone')}
                    className={`flex items-center gap-2 px-6 py-3 text-base font-semibold transition-colors ${mode === 'clone' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                    <LinkIcon className="w-5 h-5" />
                    Clone a Site
                </button>
                <button 
                    onClick={() => setMode('prompt')}
                    className={`flex items-center gap-2 px-6 py-3 text-base font-semibold transition-colors ${mode === 'prompt' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                    <SparklesIcon className="w-5 h-5" />
                    Write Prompt
                </button>
              </div>

              <div className="relative w-full max-w-2xl mx-auto">
                {mode === 'prompt' ? (
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        aiStatus={'idle'}
                        stopGeneration={() => {}}
                        model={'gemini-2.5-flash'}
                        onSetModel={() => {}}
                    />
                ) : (
                    <div className="relative bg-black border border-zinc-400 flex items-center text-white shadow-2xl shadow-black/50 p-4 pl-6">
                        <LinkIcon className="w-6 h-6 text-zinc-500 mr-4 flex-shrink-0" />
                        <input
                            type="url"
                            value={cloneUrl}
                            onChange={(e) => setCloneUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleClone()}
                            placeholder="Enter a website URL to clone..."
                            className="w-full bg-transparent resize-none focus:outline-none text-xl text-white placeholder:text-zinc-500"
                        />
                        <button
                            onClick={handleClone}
                            disabled={!cloneUrl.trim() || isLoading}
                            className="w-11 h-11 ml-4 flex-shrink-0 flex items-center justify-center bg-white text-black transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
                            aria-label="Clone website"
                        >
                            {isLoading ? <SpinnerIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-5 h-5" />}
                        </button>
                    </div>
                )}
              </div>
            </main>
        </div>
        
        {isAuthOpen && <AuthPage onClose={() => setIsAuthOpen(false)} />}
    </div>
  );
};