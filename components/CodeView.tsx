

import React from 'react';
import { FileSystem, AppTheme, FileData } from '../types';
import { FileExplorer } from './FileExplorer';
import Editor from '@monaco-editor/react';
import { SpinnerIcon } from './icons';

const CodeEditor: React.FC<{ content: string; fileType: string; theme: AppTheme }> = ({ content, fileType, theme }) => {
  const getLanguage = (type: string) => {
    switch(type) {
      case 'tsx': return 'typescript';
      case 'ts': return 'typescript';
      case 'js': return 'javascript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  }

  const editorTheme = theme === 'light' ? 'vs-light' : 'vs-dark';

  return (
    <div className="relative h-full bg-black">
      <Editor
        height="100%"
        language={getLanguage(fileType)}
        value={content}
        theme={editorTheme}
        options={{
          readOnly: true,
          domReadOnly: true,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"Fira Code", "Dank Mono", "Operator Mono", "Consolas", "Menlo", monospace',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
        }}
        loading={<SpinnerIcon className="w-8 h-8 text-zinc-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
      />
      <div className="absolute top-4 right-4 flex gap-2">
         <button className="px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors">Reset</button>
         <button className="px-3 py-1 text-xs font-medium bg-white hover:bg-zinc-200 text-black rounded-md transition-colors">Save</button>
      </div>
    </div>
  );
};

const ImageViewer: React.FC<{ file: FileData }> = ({ file }) => {
  const imageUrl = `data:${file.type};base64,${file.content}`;
  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-black">
      <img
        src={imageUrl}
        alt="Image preview"
        className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
      />
    </div>
  );
};


export const CodeView: React.FC<{ 
  fileSystem: FileSystem; 
  activeFile: string; 
  onActiveFileChange: (path: string) => void;
  theme: AppTheme;
}> = ({ fileSystem, activeFile, onActiveFileChange, theme }) => {
  const activeFileData = fileSystem[activeFile];

  const renderContent = () => {
    if (!activeFileData) {
      return (
        <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No file selected</h3>
                <p className="mt-1 text-sm text-zinc-400">Select a file from the explorer or ask the AI to create one.</p>
            </div>
        </div>
      );
    }
    
    if (activeFileData.isBinary) {
      return <ImageViewer file={activeFileData} />;
    }

    return <CodeEditor content={activeFileData.content} fileType={activeFileData.type} theme={theme} />;
  }

  return (
    <div className="flex h-full w-full">
      <FileExplorer 
        fileSystem={fileSystem} 
        activeFile={activeFile} 
        onFileSelect={onActiveFileChange}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        {renderContent()}
      </div>
    </div>
  );
};