import React from 'react';
import { SandpackPreview as SandpackPreviewComponent } from '@codesandbox/sandpack-react';

type Viewport = 'desktop' | 'tablet' | 'mobile';

interface SandpackPreviewProps {
  viewport: Viewport;
}

export const SandpackPreview: React.FC<SandpackPreviewProps> = ({ viewport }) => {
  const viewportWidths: Record<Viewport, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="h-full w-full bg-black flex items-center justify-center p-0 md:p-4">
      <div 
        className="w-full h-full bg-black transition-all duration-300 ease-in-out shadow-2xl shadow-black/30"
        style={{ maxWidth: viewportWidths[viewport] }}
      >
        <SandpackPreviewComponent
          showNavigator={false} // Hide the URL bar
          showRefreshButton={false}
          showOpenInCodeSandbox={false}
          style={{ height: '100%', width: '100%', border: 0, borderRadius: 0 }}
        />
      </div>
    </div>
  );
};