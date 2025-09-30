

import React, { useState, useCallback } from 'react';
import { FileSystem, AppTheme, FileData } from '../types';
import { FileExplorer } from './FileExplorer';
import Editor, { loader } from '@monaco-editor/react';
import { SpinnerIcon, ClipboardIcon, CheckIcon } from './icons';

// Define and register our new, more visually appealing custom Monaco theme.
// This is done once when the module is loaded.
loader.init().then((monaco) => {
  monaco.editor.defineTheme('suvo-pro-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'delimiter', foreground: 'D4D4D4' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'attribute.value', foreground: 'CE9178' },
      { token: 'predefined', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'function', foreground: 'DCDCAA' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#D4D4D4',
      'editorCursor.foreground': '#AEAFAD',
      'editor.lineHighlightBackground': '#1A1A1A',
      'editor.selectionBackground': '#264F78',
    },
  });
});

const CodeEditor: React.FC<{ content: string; fileType: string; filePath: string; }> = ({ content, fileType, filePath }) => {
  const [isCopied, setIsCopied] = useState(false);

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

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [content]);

  return (
    <div className="h-full bg-black flex flex-col">
       <div className="flex-shrink-0 bg-black border-b border-zinc-700 flex items-center justify-between px-4 py-1.5">
        <span className="font-mono text-sm text-zinc-400" title={filePath}>{filePath}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-colors rounded-md disabled:opacity-50"
          disabled={isCopied}
        >
          {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
            height="100%"
            language={getLanguage(fileType)}
            value={content}
            theme="suvo-pro-dark"
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
        <div className="flex items-center justify-center h-full text-zinc-500 bg-black">
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

    return <CodeEditor content={activeFileData.content} fileType={activeFileData.type} filePath={activeFile} />;
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