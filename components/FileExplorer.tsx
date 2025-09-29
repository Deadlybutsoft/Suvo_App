import React, { useState, useMemo } from 'react';
import { FileSystem } from '../types';
import { FileIcon, PhotoIcon, FolderIcon, ChevronRightIcon } from './icons';

interface FileExplorerProps {
  fileSystem: FileSystem;
  activeFile: string;
  onFileSelect: (path: string) => void;
}

interface TreeNode {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

const buildFileTree = (fileSystem: FileSystem): TreeNode[] => {
  const root: { children: { [key: string]: any } } = { children: {} };
  const paths = Object.keys(fileSystem);

  for (const path of paths) {
    const parts = path.split('/');
    let current = root.children;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isDirectory = i < parts.length - 1;
      
      if (!current[part]) {
        current[part] = { children: {} };
      }

      if (!isDirectory) {
        current[part].path = path; // Mark as file with full path
      }
      
      current = current[part].children;
    }
  }

  const toArray = (nodes: { [key: string]: any }, parentPath: string = ''): TreeNode[] => {
    return Object.entries(nodes).map(([name, node]) => {
      const currentPath = parentPath ? `${parentPath}/${name}` : name;
      const isDirectory = !node.path;
      return {
        path: isDirectory ? currentPath : node.path,
        name: name,
        isDirectory,
        children: isDirectory ? toArray(node.children, currentPath) : undefined
      };
    }).sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
  };

  return toArray(root.children);
};


const isImagePath = (path: string) => /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(path);

const TreeRenderer: React.FC<{
  nodes: TreeNode[];
  level: number;
  activeFile: string;
  openFolders: Set<string>;
  onFileSelect: (path: string) => void;
  onToggleFolder: (path: string) => void;
}> = ({ nodes, level, activeFile, openFolders, onFileSelect, onToggleFolder }) => {
  return (
    <>
      {nodes.map(node => (
        <React.Fragment key={node.path}>
          <button
            onClick={() => node.isDirectory ? onToggleFolder(node.path) : onFileSelect(node.path)}
            style={{ paddingLeft: `${12 + level * 20}px` }}
            title={node.path}
            className={`w-full text-left py-1.5 text-sm flex items-center gap-2 transition-colors ${
              activeFile === node.path ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {node.isDirectory ? (
              <>
                <ChevronRightIcon className={`w-4 h-4 flex-shrink-0 transition-transform ${openFolders.has(node.path) ? 'rotate-90' : ''}`} />
                <FolderIcon className="w-4 h-4 flex-shrink-0 text-sky-400" />
              </>
            ) : (
              <>
                <div className="w-4 h-4 flex-shrink-0" /> {/* Placeholder for alignment */}
                {isImagePath(node.path) 
                  ? <PhotoIcon className="w-4 h-4 flex-shrink-0 text-zinc-500" />
                  : <FileIcon className="w-4 h-4 flex-shrink-0 text-zinc-500" />
                }
              </>
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {node.isDirectory && openFolders.has(node.path) && node.children && (
            <TreeRenderer nodes={node.children} level={level + 1} activeFile={activeFile} openFolders={openFolders} onFileSelect={onFileSelect} onToggleFolder={onToggleFolder} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};


export const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystem, activeFile, onFileSelect }) => {
  const fileTree = useMemo(() => buildFileTree(fileSystem), [fileSystem]);
  
  // Start with all folders open by default for better user experience
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(
    Object.keys(fileSystem).map(p => p.substring(0, p.lastIndexOf('/'))).filter(Boolean)
  ));

  const handleToggleFolder = (path: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="w-64 h-full bg-black border-r border-zinc-700 flex flex-col">
      <div className="p-2 border-b border-zinc-700">
        <h3 className="px-2 text-sm font-semibold text-white">File Explorer</h3>
      </div>
      <div className="flex-1 overflow-y-auto pt-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-black">
        <TreeRenderer
          nodes={fileTree}
          level={0}
          activeFile={activeFile}
          openFolders={openFolders}
          onFileSelect={onFileSelect}
          onToggleFolder={handleToggleFolder}
        />
      </div>
    </div>
  );
};