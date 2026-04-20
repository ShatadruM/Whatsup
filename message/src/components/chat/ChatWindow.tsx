import { useState } from 'react';
import { Conversation, Message, User } from '../../types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import InfoPanel from './InfoPanel';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  members?: User[];
  onSendMessage: (text: string) => void;
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
        <MessageInput
          onSend={onSendMessage}
          placeholder={`Message ${conversation.name}...`}
        />
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
