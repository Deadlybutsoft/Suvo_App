import React, { useRef, useEffect } from 'react';
import { Message as MessageType, AiStatus, FileSystem, OperationMode } from '../types';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { SuvoChatSuggestions } from './SuvoChatSuggestions';

interface ChatPanelProps {
  messages: MessageType[];
  onSendMessage: (prompt: string, images: File[]) => void;
  aiStatus: AiStatus;
  stopGeneration: () => void;
  onRestoreFileSystem: (fs: FileSystem, messageId: string) => void;
  onClearChat: () => boolean;
  operationMode: OperationMode;
  onSetOperationMode: (mode: OperationMode) => void;
  openAIAPIKey: string | null;
  onOpenSettings: () => void;
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
  selectedSelectors: string[];
  onRemoveSelector: (selector: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
    messages, 
    onSendMessage, 
    aiStatus, 
    stopGeneration,
    onRestoreFileSystem,
    onClearChat,
    operationMode,
    onSetOperationMode,
    openAIAPIKey,
    onOpenSettings,
    isSelectMode,
    onToggleSelectMode,
    selectedSelectors,
    onRemoveSelector,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Calculate versions for AI messages with code changes
  let codeChangeVersion = 0;
  const messagesWithVersions = messages.map(msg => {
    if (msg.role === 'ai' && msg.codeChanges && msg.codeChanges.length > 0) {
      codeChangeVersion++;
      return { ...msg, version: codeChangeVersion };
    }
    return msg;
  });

  return (
    <div className="h-full w-full bg-black flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messagesWithVersions.length === 0 ? (
            <SuvoChatSuggestions />
        ) : (
          <div className="space-y-6">
            {messagesWithVersions.map((msg) => (
              <Message key={msg.id} message={msg} onRestoreFileSystem={onRestoreFileSystem} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-black">
        <ChatInput 
            onSendMessage={onSendMessage} 
            aiStatus={aiStatus} 
            stopGeneration={stopGeneration}
            operationMode={operationMode}
            onSetOperationMode={onSetOperationMode}
            openAIAPIKey={openAIAPIKey}
            onOpenSettings={onOpenSettings}
            isSelectMode={isSelectMode}
            onToggleSelectMode={onToggleSelectMode}
            selectedSelectors={selectedSelectors}
            onRemoveSelector={onRemoveSelector}
        />
      </div>
    </div>
  );
};