"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
import { Header } from "./components/Header"
import { SideDrawer } from "./components/SideDrawer"
import { ChatPanel } from "./components/ChatPanel"
import { ResizablePanel } from "./components/ResizablePanel"
import { useChat } from "./hooks/useChat"
import type { FileSystem, AppTheme, IntegrationType, AiModel, SettingsTab } from "./types"
import { HomePage } from "./components/HomePage"
import JSZip from "jszip"
import { SettingsPage } from "./components/SettingsPage"
import { PricingModal } from "./components/PricingModal"
import { MainDisplayPanel } from "./components/MainDisplayPanel"
import { IntegrationDetailModal } from "./components/IntegrationDetailModal"
import { INTEGRATIONS, type Integration } from "./components/integrations"

const initialFileSystem: FileSystem = {
  'index.html': {
    content: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Suvo Project</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
    type: 'html'
  },
  'src/main.tsx': {
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
    type: 'tsx'
  },
  'src/App.tsx': {
    content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-5xl font-extrabold mb-4 text-white font-mono">Welcome to Suvo</h1>
      <p className="text-lg text-zinc-400">This is a starter template. Ask me to build something!</p>
    </div>
  )
}

export default App;
`,
    type: 'tsx'
  },
  'src/styles/globals.css': {
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  background-color: #020617; /* slate-950 */
}`,
    type: 'css'
  },
  'package.json': {
    content: `{
  "name": "suvo-project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.0"
  }
}`,
    type: 'json'
  },
  'vite.config.ts': {
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`,
    type: 'ts'
  },
  'tsconfig.node.json': {
    content: `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`,
    type: 'json'
  },
  'tsconfig.json': {
    content: `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
    type: 'json'
  },
  'tailwind.config.js': {
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}`,
      type: 'js'
  },
  'postcss.config.js': {
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      type: 'js'
  },
  'public/vite.svg': {
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#41d1ff" d="M112 20.1L64 3.4 16 20.1v31.8L28.1 42c1.2-2.8 4.1-4.8 7.3-4.8h11.2c3.2 0 6.1 2 7.3 4.8l10-3.3-15.9-24.9 20-6.6 20 6.6-15.9 24.9 10 3.3c1.2-2.8 4.1-4.8 7.3-4.8h11.2c3.2 0 6.1 2 7.3 4.8L112 51.9V20.1z"/><path fill="#bd34fe" d="M112 59.9v48L64 124.6l-48-16.7v-48l48 16.7z"/><path fill="#41d1ff" d="M64 76.6l48-16.7v-8l-48 16.7z"/><path fill="#bd34fe" d="M16 51.9v8l48 16.7V68.6z"/></svg>`,
    type: 'svg'
  }
};

// Using a global-like variable is a simple way to pass the initial prompt 
// from the homepage to the workspace without complex state management across routes.
let initialPromptForWorkspace: string | undefined = undefined;

const Workspace: React.FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isApiPanelHidden, setApiPanelHidden] = useState(false)
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const [isPricingModalOpen, setPricingModalOpen] = useState(false)
  const [initialSettingsTab, setInitialSettingsTab] = useState<SettingsTab>('api_keys');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  
  const [fileSystem, setFileSystem] = useState<FileSystem>(initialFileSystem)
  const [activeFile, setActiveFile] = useState<string>("src/App.tsx")
  const [model, setModel] = useState<AiModel>('gemini-2.5-flash');
  const [openAIAPIKey, setOpenAIAPIKey] = useState<string | null>(() => localStorage.getItem('openai_api_key'));

  const handleSetOpenAIAPIKey = useCallback((key: string | null) => {
    setOpenAIAPIKey(key);
    if (key) {
        localStorage.setItem('openai_api_key', key);
    } else {
        localStorage.removeItem('openai_api_key');
    }
  }, []);

  const { messages, sendMessage, aiStatus, stopGeneration, setMessages } = useChat(
    fileSystem,
    setFileSystem,
    model,
    openAIAPIKey,
    () => setSettingsOpen(true)
  )
  
  useEffect(() => {
    // Force dark theme
    const root = document.documentElement
    if (!root.classList.contains('dark')) {
      root.classList.remove("light")
      root.classList.add("dark")
    }
    document.body.className = 'dark';
  }, [])

  // Send initial prompt after launch
  useEffect(() => {
    if (initialPromptForWorkspace) {
      sendMessage(initialPromptForWorkspace, null)
      initialPromptForWorkspace = undefined // Reset after sending
    }
  }, [sendMessage])

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev)
  }, [])

  const toggleApiPanel = useCallback(() => {
    setApiPanelHidden((prev) => !prev)
  }, [])

  const handleUpgradeClick = useCallback(() => {
    setPricingModalOpen(true)
    setDrawerOpen(false) // Close drawer if open
    setSettingsOpen(false) // Close settings if open
  }, [])

  const handleOpenSettings = useCallback((tab: SettingsTab = 'api_keys') => {
    setInitialSettingsTab(tab);
    setDrawerOpen(false)
    setSettingsOpen(true)
  }, [])

  const handleClearChat = useCallback(() => {
    if (confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
        setMessages([]);
        return true;
    }
    return false;
  }, [setMessages]);

  const handleCreateNewProject = useCallback(() => {
    const confirmed = confirm('Are you sure you want to start a new project? All current files and chat history will be lost.');
    if (confirmed) {
        setFileSystem(initialFileSystem);
        setMessages([]);
        setActiveFile("src/App.tsx");
        setDrawerOpen(false);
    }
    return confirmed;
  }, [setFileSystem, setMessages, setActiveFile, setDrawerOpen]);

  const handleRestoreFileSystem = useCallback((fs: FileSystem) => {
    setFileSystem(fs);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'ai',
        text: 'I have restored the project to the selected checkpoint.'
      }
    ]);
  }, [setFileSystem, setMessages]);

  const handleDownloadZip = useCallback(async () => {
    const zip = new JSZip()
    for (const path in fileSystem) {
      zip.file(path, fileSystem[path].content)
    }
    const blob = await zip.generateAsync({ type: "blob" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "suvo-project.zip"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }, [fileSystem])

  const handleSelectIntegration = useCallback((integrationType: IntegrationType) => {
    const integrationData = INTEGRATIONS.find(i => i.id === integrationType);
    if (integrationData) {
        setSelectedIntegration(integrationData);
    }
  }, []);

  const handleAddIntegration = useCallback(
    (integration: IntegrationType) => {
      let prompt = ""
      switch(integration) {
        case "convex":
            prompt = "Please integrate Convex. I need to set up a basic backend with a simple database table. Show me how to initialize the Convex client and perform a basic query.";
            break;
        case "firecrawl":
            prompt = "Integrate Firecrawl. I want to add a feature to scrape a website's content. Add a UI with an input for a URL and a button to start scraping. Explain how to use the Firecrawl API.";
            break;
        case "vapi":
            prompt = "Integrate Vapi for voice conversations. Set up the basic Vapi client and add a button to start a voice call.";
            break;
        case "better_auth":
            prompt = "Integrate Better Auth for user authentication. Show me how to add their sign-in component to my app.";
            break;
        case "resend":
            prompt = "Integrate Resend for sending emails. Create a contact form with 'name', 'email', and 'message' fields and a 'Send' button. Explain how to use the Resend API to send the form data as an email.";
            break;
        case "autumnpricing":
            prompt = "Integrate Autumn Pricing. I need a pricing page that is powered by Autumn. Show me how to set up the client and display different pricing tiers.";
            break;
        case "openai":
            prompt = "Integrate the OpenAI API. I want a simple text input field and a button that sends the text to an OpenAI model and displays the response.";
            break;
        case "inkeep":
            prompt = "Integrate Inkeep for AI-powered search. Add a search bar to the UI that uses Inkeep to search documentation.";
            break;
        case "scorecard":
            prompt = "Integrate Scorecard for evaluating LLM responses. Show me an example of how to send a prompt-response pair to Scorecard for evaluation.";
            break;
        case "stripe":
            prompt = "Please integrate Stripe for payments. I need a simple checkout button that redirects to a Stripe checkout page. Explain how to set up the necessary server-side logic and how to use the Stripe client-side library.";
            break;
      }

      if (prompt) {
        sendMessage(prompt, null)
        setSettingsOpen(false)
        setDrawerOpen(false)
        setSelectedIntegration(null);
      }
    },
    [sendMessage],
  )
  
  return (
    <>
      <div
        className={`relative h-screen w-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white flex flex-col overflow-hidden`}
      >
        <Header
          onMenuClick={toggleDrawer}
          onUpgradeClick={handleUpgradeClick}
          onSelectIntegration={handleSelectIntegration}
          onDownloadZip={handleDownloadZip}
        />
        <main className="flex-1 flex overflow-hidden pt-16">
          <ResizablePanel isLeftPanelHidden={isApiPanelHidden}>
            <ChatPanel
              messages={messages}
              onSendMessage={sendMessage}
              aiStatus={aiStatus}
              stopGeneration={stopGeneration}
              onRestoreFileSystem={handleRestoreFileSystem}
              onClearChat={handleClearChat}
              model={model}
              onSetModel={setModel}
            />
            <MainDisplayPanel
              fileSystem={fileSystem}
              activeFile={activeFile}
              onActiveFileChange={setActiveFile}
              theme={'dark'}
              isPanelHidden={isApiPanelHidden}
              togglePanel={toggleApiPanel}
            />
          </ResizablePanel>
        </main>
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={toggleDrawer}
          onOpenSettings={handleOpenSettings}
          onUpgradeClick={handleUpgradeClick}
          onCreateNewProject={handleCreateNewProject}
        />
        <PricingModal isOpen={isPricingModalOpen} onClose={() => setPricingModalOpen(false)} />
      </div>

      {isSettingsOpen && (
        <SettingsPage
          onClose={() => setSettingsOpen(false)}
          onClearChat={handleClearChat}
          onUpgradeClick={handleUpgradeClick}
          openAIAPIKey={openAIAPIKey}
          onSetOpenAIAPIKey={handleSetOpenAIAPIKey}
          initialTab={initialSettingsTab}
        />
      )}

      {selectedIntegration && (
        <IntegrationDetailModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onAdd={handleAddIntegration}
        />
      )}
    </>
  )
}

const MainApplication: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLaunchWorkspace = useCallback((prompt?: string) => {
      initialPromptForWorkspace = prompt;
      if (!location.pathname.startsWith('/w')) {
          navigate('/w');
      }
  }, [navigate, location.pathname]);

  if (location.pathname.startsWith('/w')) {
      return <Workspace />;
  }

  return <HomePage onLaunchWorkspace={handleLaunchWorkspace} />;
};


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/*" element={<MainApplication />} />
    </Routes>
  )
}

export default App