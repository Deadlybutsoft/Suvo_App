import React, { useState, useEffect } from 'react';
import { Message as MessageType, FileChange, FileSystem } from '../types';
import { SparklesIcon, ChevronDownIcon, SpinnerIcon, ArrowLeftIcon, ExclamationTriangleIcon, SunSpinnerIcon, FileIcon, PhotoIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CALMING_MESSAGES = [
    "Analyzing your request...",
    "Drafting an execution plan...",
    "Consulting architectural blueprints...",
    "Deconstructing the problem...",
    "Initializing cognitive matrix...",
    "Mapping out component structure...",
    "Reviewing existing file system...",
    "Formulating a strategy...",
    "Preparing the digital canvas...",
    "Sequencing development tasks...",
];

const ThinkingIndicator: React.FC = () => {
    const [message, setMessage] = useState(CALMING_MESSAGES[0]);

    useEffect(() => {
        // Start with a random message
        setMessage(CALMING_MESSAGES[Math.floor(Math.random() * CALMING_MESSAGES.length)]);

        const interval = setInterval(() => {
            setMessage(prevMessage => {
                const otherMessages = CALMING_MESSAGES.filter(m => m !== prevMessage);
                return otherMessages[Math.floor(Math.random() * otherMessages.length)];
            });
        }, 2500); // Change message every 2.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-start gap-3 p-2">
            <SunSpinnerIcon className="w-8 h-8 text-zinc-400" />
            <span className="text-zinc-400 font-medium">{message}</span>
        </div>
    );
};

const getOperationText = (operation: FileChange['operation']) => {
    switch (operation) {
        case 'CREATE': return 'Created';
        case 'UPDATE': return 'Edited';
        case 'DELETE': return 'Removed';
        default: return 'Changed';
    }
}

const getFileIcon = (path: string) => {
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(path)) {
        return <PhotoIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />;
    }
    return <FileIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />;
};

const CodeVersionBlock: React.FC<{
    changes: FileChange[],
    version: number,
    isStreaming?: boolean,
    onRestore?: () => void
}> = ({ changes, version, isStreaming, onRestore }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    return (
        <div className={`mt-4 border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-900 rounded-lg overflow-hidden ${isStreaming && changes.length < 2 ? 'animate-pulse' : ''}`}>
            <div 
                className="p-3 flex items-center justify-between"
            >
                <div 
                    className="flex items-center gap-3 cursor-pointer flex-grow min-w-0"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-zinc-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">Version {version}</h4>
                </div>
                {onRestore && !isStreaming && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRestore(); }}
                        title="Undo to this version"
                        className="ml-4 flex-shrink-0 flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <ArrowLeftIcon className="w-3 h-3" />
                        <span>Undo</span>
                    </button>
                )}
            </div>
            {isExpanded && (
                <div className="border-t border-slate-200 dark:border-zinc-600 p-2 bg-white dark:bg-black/20">
                  <div className="divide-y divide-slate-100 dark:divide-zinc-700">
                    {changes.map((change, index) => (
                        <div key={index} className="py-2 px-1">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {isStreaming && index === changes.length - 1 ? (
                                        <SpinnerIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                    ) : (
                                        getFileIcon(change.path)
                                    )}
                                    <span className="font-mono text-sm text-slate-500 dark:text-zinc-400 truncate">{change.path}</span>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-zinc-400 font-medium flex-shrink-0">{getOperationText(change.operation)}</span>
                            </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
        </div>
    );
};

const CODE_GENERATION_MESSAGES = [
    "Writing new files...",
    "Refactoring existing code...",
    "Applying component logic...",
    "Integrating dependencies...",
    "Finalizing code block...",
    "Structuring new components...",
    "Updating configuration files...",
];

const CodeVersionBlockSkeleton: React.FC = () => {
    const [message, setMessage] = useState(CODE_GENERATION_MESSAGES[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessage(prev => {
                const currentIndex = CODE_GENERATION_MESSAGES.indexOf(prev);
                const nextIndex = (currentIndex + 1) % CODE_GENERATION_MESSAGES.length;
                return CODE_GENERATION_MESSAGES[nextIndex];
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-4 border border-zinc-600 bg-zinc-900 rounded-lg overflow-hidden">
            <div className="p-3 flex items-center gap-3">
                <SpinnerIcon className="w-5 h-5 text-zinc-400" />
                <h4 className="font-semibold text-white truncate">{message}</h4>
            </div>
            <div className="border-t border-zinc-600 p-3 bg-black/20 animate-pulse">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-zinc-700 rounded-md flex-shrink-0"></div>
                        <div className="h-4 w-32 bg-zinc-700 rounded-md"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-zinc-700 rounded-md flex-shrink-0"></div>
                        <div className="h-4 w-40 bg-zinc-700 rounded-md"></div>
                    </div>
                     <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-zinc-700 rounded-md flex-shrink-0"></div>
                        <div className="h-4 w-24 bg-zinc-700 rounded-md"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const UserMessage: React.FC<{ message: MessageType }> = ({ message }) => {
    return (
        <div className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-lg">
            {message.imageUrls && message.imageUrls.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {message.imageUrls.map((url, index) => (
                         <img key={index} src={url} alt={`User upload ${index + 1}`} className="max-w-full h-auto max-h-40 rounded-md" />
                    ))}
                </div>
            )}
            
            {message.text && (
                <div className="user-message-content text-base text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

const AiMessage: React.FC<{ message: MessageType, onRestoreFileSystem: (fs: FileSystem, messageId: string) => void; }> = ({ message, onRestoreFileSystem }) => {
    if (message.isStreaming && !message.text && (!message.codeChanges || message.codeChanges.length === 0) && !message.isExpectingCodeChanges) {
        return <ThinkingIndicator />;
    }

    const handleRestore = () => {
        if (message.previousFileSystem && window.confirm('Are you sure you want to undo to this checkpoint? All changes made after this version will be lost.')) {
            onRestoreFileSystem(message.previousFileSystem, message.id);
        }
    };

    return (
        <div className="text-base">
            {message.text && (
                <div className={`ai-message-content ${message.isStreaming && message.text ? 'is-streaming' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                    </ReactMarkdown>
                </div>
            )}

            {message.codeChanges && message.codeChanges.length > 0 && message.version && (
                <CodeVersionBlock 
                    changes={message.codeChanges} 
                    version={message.version} 
                    isStreaming={message.isStreaming}
                    onRestore={message.previousFileSystem ? handleRestore : undefined}
                />
            )}
            
            {message.isStreaming && message.isExpectingCodeChanges && (!message.codeChanges || message.codeChanges.length === 0) && (
                <CodeVersionBlockSkeleton />
            )}
            
            {message.error && (
                 <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-900 bg-red-900/20 p-4">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-300">{message.error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


export const Message: React.FC<{ message: MessageType; onRestoreFileSystem: (fs: FileSystem, messageId: string) => void; }> = ({ message, onRestoreFileSystem }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl ${isUser ? '' : 'w-full'}`}>
        {isUser ? <UserMessage message={message} /> : <AiMessage message={message} onRestoreFileSystem={onRestoreFileSystem} />}
      </div>
    </div>
  );
};