import React, { useState, useCallback } from 'react';
import { CodeView } from './CodeView';
import { PreviewView } from './PreviewView';
import { PanelToggleArrowsIcon, CodeIcon, DesktopIcon, RefreshCwIcon, TabletIcon, MobileIcon, MaximizeIcon } from './icons';
import type { FileSystem, AppTheme } from '../types';

type Viewport = 'desktop' | 'tablet' | 'mobile';

interface MainDisplayPanelProps {
    fileSystem: FileSystem;
    activeFile: string;
    onActiveFileChange: (path: string) => void;
    theme: AppTheme;
    isPanelHidden: boolean;
    togglePanel: () => void;
    onFixRequest: (error: string) => void;
    isSelectMode: boolean;
    onElementSelected: (selector: string) => void;
    onExitSelectMode: () => void;
    screenshotTrigger: number;
    onScreenshotTaken: (dataUrl: string) => void;
}

const ViewportButton: React.FC<{
    Icon: React.FC<{className?: string}>;
    label: Viewport;
    currentViewport: Viewport;
    onClick: (viewport: Viewport) => void;
}> = ({ Icon, label, currentViewport, onClick }) => {
    const isActive = label === currentViewport;
    return (
        <button
            onClick={() => onClick(label)}
            title={`${label.charAt(0).toUpperCase() + label.slice(1)} view`}
            className={`p-2 rounded-md transition-colors ${
                isActive 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:bg-zinc-800'
            }`}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
}

export const MainDisplayPanel: React.FC<MainDisplayPanelProps> = ({
    fileSystem,
    activeFile,
    onActiveFileChange,
    theme,
    isPanelHidden,
    togglePanel,
    onFixRequest,
    isSelectMode,
    onElementSelected,
    onExitSelectMode,
    screenshotTrigger,
    onScreenshotTaken,
}) => {
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [viewport, setViewport] = useState<Viewport>('desktop');
    const [refreshKey, setRefreshKey] = useState(0);
    const [fullscreenTrigger, setFullscreenTrigger] = useState(0);

    const handleRefresh = useCallback(() => setRefreshKey(p => p + 1), []);
    const handleFullscreen = useCallback(() => setFullscreenTrigger(p => p + 1), []);

    return (
        <div className="h-full flex flex-col bg-slate-100 dark:bg-black min-w-0">
            {/* Header/Toolbar for the panel */}
            <div className="flex-shrink-0 bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between px-2 h-12">
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePanel}
                        className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors"
                        title={isPanelHidden ? "Show Chat Panel" : "Hide Chat Panel"}
                    >
                        <PanelToggleArrowsIcon className={`h-5 w-5 transition-transform duration-300 ${isPanelHidden ? 'scale-x-[-1]' : ''}`} />
                    </button>
                    {/* Tab Switcher */}
                    <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-md">
                        <button
                            onClick={() => setActiveTab("code")}
                            className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-sm transition-colors ${
                            activeTab === "code"
                                ? "bg-black text-white shadow-sm"
                                : "text-zinc-400 hover:bg-black/50"
                            }`}
                        >
                            <CodeIcon className="w-5 h-5" />
                            <span>Code</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-sm transition-colors ${
                            activeTab === "preview"
                                ? "bg-black text-white shadow-sm"
                                : "text-zinc-400 hover:bg-black/50"
                            }`}
                        >
                            <DesktopIcon className="w-5 h-5" />
                            <span>Preview</span>
                        </button>
                    </div>
                </div>
                
                {/* Viewport and other controls, only visible on the Preview tab */}
                <div className="flex items-center gap-2">
                    {activeTab === 'preview' && (
                        <>
                            <div className="flex items-center gap-1">
                                <ViewportButton Icon={DesktopIcon} label="desktop" currentViewport={viewport} onClick={setViewport} />
                                <ViewportButton Icon={TabletIcon} label="tablet" currentViewport={viewport} onClick={setViewport} />
                                <ViewportButton Icon={MobileIcon} label="mobile" currentViewport={viewport} onClick={setViewport} />
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleRefresh}
                                    title="Refresh Preview"
                                    className="p-2 rounded-md text-zinc-400 hover:bg-zinc-800 transition-colors"
                                >
                                    <RefreshCwIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleFullscreen}
                                    title="Fullscreen Preview"
                                    className="p-2 rounded-md text-zinc-400 hover:bg-zinc-800 transition-colors"
                                >
                                    <MaximizeIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 min-h-0">
                {activeTab === "code" && (
                    <CodeView
                        fileSystem={fileSystem}
                        activeFile={activeFile}
                        onActiveFileChange={onActiveFileChange}
                        theme={theme}
                    />
                )}
                {activeTab === "preview" && (
                    <PreviewView
                        fileSystem={fileSystem}
                        viewport={viewport} 
                        refreshKey={refreshKey}
                        fullscreenTrigger={fullscreenTrigger}
                        onFixRequest={onFixRequest}
                        isSelectMode={isSelectMode}
                        onElementSelected={onElementSelected}
                        onExitSelectMode={onExitSelectMode}
                        screenshotTrigger={screenshotTrigger}
                        onScreenshotTaken={onScreenshotTaken}
                    />
                )}
            </div>
        </div>
    );
};