import React, { useState, useEffect, useRef } from 'react';
import type { FileSystem } from '../types';
import { Buffer } from 'buffer';

type Viewport = 'desktop' | 'tablet' | 'mobile';

interface PreviewViewProps {
  fileSystem: FileSystem;
  viewport: Viewport;
  refreshKey: number;
  fullscreenTrigger: number;
}

const createPreviewableHtml = (
  fileSystem: FileSystem,
  createdUrls: Set<string>
): string => {
  const filesToProcess = Object.entries(fileSystem).map(([path, fileData]) => ({
    path,
    ...fileData,
  }));

  const htmlFile = filesToProcess.find(f => f.path === 'index.html');
  let htmlContent = htmlFile?.content || `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Generated App</title>
      </head>
      <body><div id="root"></div></body>
    </html>
  `;

  // 1. Inject Tailwind CDN if not present
  if (!htmlContent.includes('cdn.tailwindcss.com')) {
    htmlContent = htmlContent.replace('</head>', '<script src="https://cdn.tailwindcss.com"><\/script></head>');
  }

  const assetUrlMap: Record<string, string> = {};
  const binaryAssets = filesToProcess.filter(f => f.isBinary);

  // 2. Handle binary assets (like images) by creating blob URLs and replacing paths
  for (const asset of binaryAssets) {
      const blob = new Blob([Buffer.from(asset.content, 'base64')], { type: asset.type });
      const url = URL.createObjectURL(blob);
      createdUrls.add(url);
      
      const publicPath = asset.path.startsWith('public/') ? `/${asset.path.substring('public/'.length)}` : `/${asset.path}`;
      assetUrlMap[publicPath] = url;
      
      const pathRegex = new RegExp(`(["'])${publicPath}(["'])`, 'g');
      htmlContent = htmlContent.replace(pathRegex, `$1${url}$2`);
  }

  const textFiles = filesToProcess.filter(f => !f.isBinary && f.path !== 'index.html');

  if (textFiles.length === 0) {
    return htmlContent;
  }

  const virtualFileSystemWithAssetUrls = Object.fromEntries(
    textFiles.map(f => {
      let content = f.content;
      for (const [assetPath, blobUrl] of Object.entries(assetUrlMap)) {
        const pathRegex = new RegExp(`(["'])${assetPath}(["'])`, 'g');
        content = content.replace(pathRegex, `$1${blobUrl}$2`);
      }
      return [f.path, content];
    })
  );


  const loaderScript = `
    (function() {
      const fileSystem = ${JSON.stringify(virtualFileSystemWithAssetUrls)};
      const moduleCache = {};
      const transpiledCache = {};

      function displayError(title, error, path) {
        const errorTitle = path ? \`\${title} in \${path}\` : title;
        const errorMessage = error.message || 'An unknown error occurred.';
        
        // Sanitize HTML to prevent XSS from error messages
        const escapeHtml = (unsafe) => {
            if (typeof unsafe !== 'string') return '';
            return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        };
        
        const errorStack = error.stack ? escapeHtml(error.stack) : '';
        const sanitizedErrorMessage = escapeHtml(errorMessage);
        const sanitizedErrorTitle = escapeHtml(errorTitle);

        const styles = \`
            body { margin: 0; }
            .error-overlay {
                position: fixed;
                inset: 0;
                background-color: #18181b; /* zinc-900 */
                color: #fca5a5; /* red-300 */
                padding: 2rem;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                font-size: 14px;
                line-height: 1.6;
                overflow-y: auto;
            }
            .error-overlay h2 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #f87171; /* red-400 */
                margin: 0 0 1rem 0;
                border-bottom: 1px solid #3f3f46; /* zinc-700 */
                padding-bottom: 0.75rem;
            }
            .error-overlay .message {
                color: #fecaca; /* red-200 */
                font-weight: 500;
                margin-bottom: 1.5rem;
                white-space: pre-wrap;
                word-break: break-word;
            }
            .error-overlay pre {
                background-color: #000;
                padding: 1rem;
                border-radius: 6px;
                border: 1px solid #3f3f46; /* zinc-700 */
                overflow-x: auto;
                color: #a1a1aa; /* zinc-400 */
                white-space: pre-wrap;
                word-break: break-all;
            }
        \`;

        document.head.innerHTML = '<style>' + styles + '</style>';
        document.body.innerHTML = \`
            <div class="error-overlay">
                <h2>\${sanitizedErrorTitle}</h2>
                <div class="message">\${sanitizedErrorMessage}</div>
                <pre>\${errorStack}</pre>
            </div>
        \`;
      }

      function resolvePath(path, currentDir) {
        if (!path.startsWith('.')) return path;
        const pathParts = (currentDir ? currentDir.split('/') : []).concat(path.split('/'));
        const resolvedParts = [];
        for (const part of pathParts) {
            if (part === '.' || part === '' || part === undefined) continue;
            if (part === '..') {
            resolvedParts.pop();
            } else {
            resolvedParts.push(part);
            }
        }
        let resolvedPath = resolvedParts.join('/');
        
        const extensions = ['', '.js', '.ts', '.tsx', '.css', '.json', '/index.js', '/index.ts', '/index.tsx'];
        for (const ext of extensions) {
            if (fileSystem.hasOwnProperty(resolvedPath + ext)) return resolvedPath + ext;
        }
        throw new Error("Module not found: Can't resolve '" + path + "' from '" + (currentDir || '/') + "'");
      }
      
      function require(path, currentPath) {
        if (path === 'react') return window.React;
        if (path === 'react-dom/client' || path === 'react-dom') return window.ReactDOM;
        if (path === 'react-router-dom') return window.ReactRouterDOM;

        const currentDir = currentPath ? currentPath.substring(0, currentPath.lastIndexOf('/')) : '';
        const absolutePath = resolvePath(path, currentDir);
        
        if (moduleCache[absolutePath]) {
          return moduleCache[absolutePath].exports;
        }
        
        const code = fileSystem[absolutePath];
        if (code === undefined) {
          throw new Error("Module not found: " + absolutePath);
        }

        const module = { exports: {} };
        moduleCache[absolutePath] = module;

        if (absolutePath.endsWith('.css')) {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = code;
            document.head.appendChild(style);
            return module.exports; // Return empty object for CSS modules
        }

        if (absolutePath.endsWith('.json')) {
            try {
                module.exports = JSON.parse(code);
            } catch (e) {
                e.message = 'Failed to parse JSON file ' + absolutePath + ': ' + e.message;
                throw e;
            }
            return module.exports;
        }

        let transpiledCode = transpiledCache[absolutePath];
        if (!transpiledCode) {
            try {
                transpiledCode = Babel.transform(code, {
                    presets: ['react', 'typescript'],
                    plugins: ['transform-modules-commonjs'],
                    filename: absolutePath
                }).code;
                transpiledCache[absolutePath] = transpiledCode;
            } catch(e) {
                console.error('Babel compilation failed for ' + absolutePath + ':', e);
                displayError('Babel Compilation Error', e, absolutePath);
                throw e;
            }
        }
        
        const factory = new Function('require', 'module', 'exports', transpiledCode);
        const relativeRequire = (p) => require(p, absolutePath);
        factory(relativeRequire, module, module.exports);

        return module.exports;
      }
      
      try {
        const entrypoints = ['index.tsx', 'src/index.tsx', 'main.tsx', 'src/main.tsx'];
        const entrypoint = entrypoints.find(e => fileSystem.hasOwnProperty(e));
        if (!entrypoint) {
            throw new Error("Could not find a valid entrypoint. Looked for: " + entrypoints.join(', '));
        }
        require(entrypoint, '');
      } catch (e) {
        console.error('Preview execution error:', e);
        displayError('Preview Error', e);
      }
    })();
  `;

  const scriptToInject = `
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>
    <script src="https://unpkg.com/react-router-dom@6/umd/react-router-dom.development.js" crossorigin><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <script>
      ${loaderScript}
    <\/script>
  `;
  
  if (!htmlContent.includes('id="root"')) {
    htmlContent = htmlContent.replace('</body>', '<div id="root"></div></body>');
  }

  return htmlContent.replace('</body>', `${scriptToInject}</body>`);
};


export const PreviewView: React.FC<PreviewViewProps> = ({ fileSystem, viewport, refreshKey, fullscreenTrigger }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const createdUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (fullscreenTrigger > 0 && containerRef.current) {
        containerRef.current.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
    }
  }, [fullscreenTrigger]);

  useEffect(() => {
    // Clean up old URLs before creating new ones
    createdUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    createdUrlsRef.current.clear();

    const newCreatedUrls = new Set<string>();
    const generatedHtml = createPreviewableHtml(fileSystem, newCreatedUrls);
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    newCreatedUrls.add(url);
    
    setPreviewUrl(url);
    createdUrlsRef.current = newCreatedUrls;

    return () => {
      createdUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      createdUrlsRef.current.clear();
    };
  }, [fileSystem, refreshKey]);

  const viewportWidths: Record<Viewport, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="h-full w-full bg-slate-100 dark:bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center overflow-auto p-2">
            <div
                ref={containerRef}
                className="preview-container w-full h-full max-w-full max-h-full bg-white shadow-lg rounded-lg transition-all duration-300 ease-in-out"
                style={{ width: viewportWidths[viewport] }}
            >
                <iframe
                    ref={iframeRef}
                    src={previewUrl ?? 'about:blank'}
                    title="Live Preview"
                    className="w-full h-full border-0 rounded-lg"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
            </div>
        </div>
    </div>
  );
};