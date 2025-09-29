import React, { useRef, useEffect } from 'react';
import { Message as MessageType, AiStatus, FileSystem, AiModel } from '../types';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { SuvoChatSuggestions } from './SuvoChatSuggestions';

interface ChatPanelProps {
  messages: MessageType[];
  onSendMessage: (prompt: string, image: File | null) => void;
  aiStatus: AiStatus;
  stopGeneration: () => void;
  onRestoreFileSystem: (fs: FileSystem) => void;
  onClearChat: () => boolean;
  model: AiModel;
  onSetModel: (model: AiModel) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
    messages, 
    onSendMessage, 
    aiStatus, 
    stopGeneration,
    onRestoreFileSystem,
    onClearChat,
    model,
    onSetModel,
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
            model={model}
            onSetModel={onSetModel}
        />
      </div>
    </div>
  );
};