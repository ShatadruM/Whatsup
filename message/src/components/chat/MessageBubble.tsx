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
  const rawSenderId = message.senderId?._id || message.senderId?.id || message.senderId;
  const rawMyId = currentUser?._id || (currentUser as any)?.id;

  const safeSenderId = String(rawSenderId);
  const safeMyId = String(rawMyId);

  const isMe = safeSenderId === safeMyId;

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
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed flex flex-col gap-2 ${
              isMe
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
            }`}
          >
            {/* --- NEW: MEDIA RENDERER --- */}
            {message.mediaUrl && message.mediaType === 'image' && (
              <img 
                src={message.mediaUrl} 
                alt="attachment" 
                className="max-w-full rounded-lg max-h-64 object-cover"
              />
            )}
            
            {message.mediaUrl && message.mediaType === 'video' && (
              <video 
                src={message.mediaUrl} 
                controls 
                className="max-w-full rounded-lg max-h-64"
              />
            )}

            {message.mediaUrl && message.mediaType === 'document' && (
              <a 
                href={message.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-2 rounded-lg underline ${isMe ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-600'}`}
              >
                📄 {message.mediaName || 'Download Document'}
              </a>
            )}

            {/* Display the correct MongoDB content property (if there is text) */}
            {content && <span>{content}</span>}
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
        </div> {/* <--- THIS WAS THE MISSING DIV */}

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