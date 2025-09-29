import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CloseIcon, FolderIcon, FileIcon, SpinnerIcon } from './icons';

export interface ZipFileEntry {
    path: string;
    isDirectory: boolean;
    getContent: () => Promise<string>;
}

interface FileTreeItemProps {
    entry: ZipFileEntry;
    selectedPaths: Set<string>;
    onToggle: (path: string, isDirectory: boolean) => void;
    isIndeterminate: boolean;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ entry, selectedPaths, onToggle, isIndeterminate }) => {
    const checkboxRef = useRef<HTMLInputElement>(null);
    const isChecked = selectedPaths.has(entry.path);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const { path, isDirectory } = entry;
    const depth = path.endsWith('/') ? path.slice(0, -1).split('/').length - 1 : path.split('/').length - 1;
    const indentStyle = { paddingLeft: `${depth * 24}px` };
    const fileName = path.endsWith('/') ? path.slice(0, -1).split('/').pop() + '/' : path.split('/').pop();

    return (
        <label
            htmlFor={`zip-file-${path}`}
            className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            style={indentStyle}
        >
            <input
                ref={checkboxRef}
                id={`zip-file-${path}`}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-600 dark:bg-zinc-900 dark:focus:ring-offset-black"
                checked={isChecked}
                onChange={() => onToggle(path, isDirectory)}
            />
            {isDirectory ? <FolderIcon className="w-5 h-5 text-sky-500" /> : <FileIcon className="w-5 h-5 text-slate-500 dark:text-zinc-400" />}
            <span className="text-slate-700 dark:text-slate-300 truncate" title={path}>
                {fileName}
            </span>
        </label>
    );
};


interface ImportZipModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: ZipFileEntry[];
    onConfirm: (filesToImport: ZipFileEntry[]) => Promise<void>;
}

export const ImportZipModal: React.FC<ImportZipModalProps> = ({ isOpen, onClose, files, onConfirm }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Initially, select all files by default for convenience
            const allFilePaths = new Set<string>();
            files.forEach(f => {
              if(!f.isDirectory) allFilePaths.add(f.path)
            });
            setSelectedPaths(allFilePaths);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, files]);

    const handleClose = () => {
        if (isLoading) return;
        setIsVisible(false);
        setTimeout(onClose, 300);
    }

    const handleConfirm = async () => {
        const filesToImport = files.filter(f => selectedPaths.has(f.path));
        setIsLoading(true);
        await onConfirm(filesToImport);
        setIsLoading(false);
        handleClose();
    };
    
    const handleToggle = (path: string, isDirectory: boolean) => {
        const newSelection = new Set(selectedPaths);
        if (isDirectory) {
            const childFiles = files.filter(f => !f.isDirectory && f.path.startsWith(path));
            const areAllSelected = childFiles.every(f => newSelection.has(f.path));
            childFiles.forEach(f => {
                if (areAllSelected) {
                    newSelection.delete(f.path);
                } else {
                    newSelection.add(f.path);
                }
            });
        } else {
            if (newSelection.has(path)) {
                newSelection.delete(path);
            } else {
                newSelection.add(path);
            }
        }
        setSelectedPaths(newSelection);
    };

    const dirSelectionState = useMemo(() => {
        const stateMap = new Map<string, { isChecked: boolean, isIndeterminate: boolean }>();
        files.forEach(dir => {
            if (dir.isDirectory) {
                const childFiles = files.filter(f => !f.isDirectory && f.path.startsWith(dir.path));
                if (childFiles.length > 0) {
                    const selectedCount = childFiles.filter(f => selectedPaths.has(f.path)).length;
                    const isChecked = selectedCount === childFiles.length;
                    const isIndeterminate = selectedCount > 0 && selectedCount < childFiles.length;
                    stateMap.set(dir.path, { isChecked, isIndeterminate });
                }
            }
        });
        return stateMap;
    }, [files, selectedPaths]);
    

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div
                className={`relative w-full max-w-2xl bg-white dark:bg-black rounded-xl shadow-2xl text-slate-800 dark:text-white transition-all duration-300 flex flex-col overflow-hidden max-h-[90vh] ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-6 border-b border-slate-200 dark:border-zinc-700">
                    <h2 id="import-modal-title" className="text-xl font-bold">Import Project from ZIP</h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Select files to import. This will replace all files in the current workspace.</p>
                    <button onClick={handleClose} disabled={isLoading} className="absolute top-4 right-4 p-2 rounded-full text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <main className="flex-1 overflow-y-auto p-4">
                    {files.length > 0 ? (
                        <div className="space-y-1">
                            {files.map(entry => {
                                const { path, isDirectory } = entry;
                                const state = isDirectory ? dirSelectionState.get(path) : null;
                                const isIndeterminate = state?.isIndeterminate ?? false;
                                const isChecked = isDirectory ? state?.isChecked ?? false : selectedPaths.has(path);
                                
                                return (
                                    <FileTreeItem
                                        key={path}
                                        entry={{ ...entry, path }}
                                        selectedPaths={selectedPaths}
                                        onToggle={handleToggle}
                                        isIndeterminate={isIndeterminate}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                         <div className="text-center p-8 text-slate-500 dark:text-zinc-400">
                           This ZIP archive appears to be empty or could not be read.
                         </div>
                    )}
                </main>
                
                <footer className="flex-shrink-0 p-4 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {selectedPaths.size} file{selectedPaths.size === 1 ? '' : 's'} selected
                    </span>
                    <div className="flex gap-3">
                         <button onClick={handleClose} disabled={isLoading} className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-600 rounded-md transition-colors">
                            Cancel
                         </button>
                         <button onClick={handleConfirm} disabled={selectedPaths.size === 0 || isLoading} className="px-4 py-2 font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                             {isLoading && <SpinnerIcon className="w-5 h-5" />}
                             {isLoading ? 'Importing...' : 'Import Files'}
                         </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};