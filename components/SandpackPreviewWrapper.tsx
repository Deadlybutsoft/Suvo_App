import React from 'react';
import type { FileSystem } from '../types';
import { SandpackProvider, SandpackLayout } from '@codesandbox/sandpack-react';
import { nightOwl } from '@codesandbox/sandpack-themes';
import { SandpackPreview } from './SandpackPreview';

type Viewport = 'desktop' | 'tablet' | 'mobile';

interface SandpackPreviewWrapperProps {
  fileSystem: FileSystem;
  viewport: Viewport;
  refreshKey: number;
}

// Helper to format files for Sandpack, handling text-based files.
const formatFilesForSandpack = (fileSystem: FileSystem) => {
  const sandpackFiles: Record<string, string> = {};
  for (const path in fileSystem) {
    const file = fileSystem[path];
    if (file && !file.isBinary) {
      sandpackFiles[path] = file.content;
    }
  }
  
  // Ensure essential files exist if they've been deleted
  if (!sandpackFiles['package.json']) {
      sandpackFiles['package.json'] = `{
          "name": "recovered-project",
          "dependencies": { "react": "^18.0.0", "react-dom": "^18.0.0" }
      }`;
  }
  
  return sandpackFiles;
};


export const SandpackPreviewWrapper: React.FC<SandpackPreviewWrapperProps> = ({
  fileSystem,
  viewport,
  refreshKey,
}) => {
  const sandpackFiles = formatFilesForSandpack(fileSystem);

  // The key prop on SandpackProvider is crucial for forcing a full remount
  // when we want to "refresh" the environment.
  return (
    <SandpackProvider
      key={refreshKey}
      template="react-ts"
      files={sandpackFiles}
      theme={nightOwl}
      options={{
        activeFile: 'src/App.tsx',
        autorun: true,
        // This tells Sandpack to not automatically reload on file changes,
        // we control it with the `refreshKey`.
        autoReload: false, 
      }}
    >
      <SandpackLayout style={{ border: 'none', borderRadius: 0, background: 'black', height: '100%' }}>
        <SandpackPreview viewport={viewport} />
      </SandpackLayout>
    </SandpackProvider>
  );
};