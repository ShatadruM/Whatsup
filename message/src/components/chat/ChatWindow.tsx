import { useState } from 'react';
// import { Conversation, Message, User } from '../../types'; // Adjust imports if needed based on your redux/types
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import InfoPanel from './InfoPanel';

interface ChatWindowProps {
  conversation: any; // Or your Conversation type
  messages: any[];   // Or your Message type
  members?: any[];   // Or your User type
  
  // 1. UPDATED: Tell the interface to accept the optional file
  onSendMessage: (text: string, file: File | null) => void;
}

export default function ChatWindow({ conversation, messages, members, onSendMessage }: ChatWindowProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader
          conversation={conversation}
          onInfoToggle={() => setShowInfo(!showInfo)}
          showInfo={showInfo}
        />
        <MessageList
          messages={messages}
          isGroupChat={conversation.type === 'group'}
        />
        
        {/* 2. UPDATED: Call the prop 'onSendMessage', not 'sendMessage' */}
        <MessageInput onSend={(text, file) => onSendMessage(text, file)} />
      </div>

      {showInfo && (
        <InfoPanel
          conversation={conversation}
          members={members}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}