import { Check, CheckCheck } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAppSelector } from '../../store/hooks'; 

interface MessageBubbleProps {
  message: any; 
  showAvatar: boolean;
  showName: boolean;
  isGroupChat: boolean;
}

export default function MessageBubble({ message, showAvatar, showName, isGroupChat }: MessageBubbleProps) {
  // 1. Grab current user
  const currentUser = useAppSelector((state) => state.auth.user);

  // 2. THE BULLETPROOF ID CHECK
  // Grab the sender ID (checking both _id, id, or if it's just a raw string)
  const rawSenderId = message.senderId?._id || message.senderId?.id || message.senderId;
  
  // Grab your ID (checking both _id and id just in case your auth route uses 'id')
  const rawMyId = currentUser?._id || (currentUser as any)?.id;

  // Force both to be strings so JavaScript doesn't fail a type comparison
  const safeSenderId = String(rawSenderId);
  const safeMyId = String(rawMyId);

  // Now compare the strings
  const isMe = safeSenderId === safeMyId;

  // --- DEBUG LOGGER ---
  // Press F12 in your browser to see this! It will instantly tell you why it's failing.
  console.log(`Checking message: "${message.content}"`, {
    senderId: safeSenderId,
    myId: safeMyId,
    isMe: isMe
  });
  // --------------------

  const content = message.content || ''; 
  const senderUsername = message.senderId?.username || (isMe ? currentUser?.username : 'Unknown User'); 
  const status = message.status || 'delivered'; 
  
  const timeString = new Date(message.timestamp || message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`flex items-end gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-8 flex-shrink-0">
        {!isMe && showAvatar && (
          <Avatar username={senderUsername} size="sm" />
        )}
      </div>

      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && isGroupChat && showName && (
          <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">{senderUsername}</span>
        )}

        <div className="relative group">
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isMe
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
            }`}
          >
            {/* Display the correct MongoDB content property */}
            {content}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((r: any, i: number) => (
                <span
                  key={i}
                  className="text-xs bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-sm cursor-pointer hover:bg-slate-50 transition"
                >
                  {r.emoji} {r.count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-slate-400">{timeString}</span>
          {isMe && (
            <span className="text-slate-400">
              {status === 'read' ? (
                <CheckCheck size={13} className="text-blue-400" />
              ) : status === 'delivered' ? (
                <CheckCheck size={13} />
              ) : (
                <Check size={13} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}