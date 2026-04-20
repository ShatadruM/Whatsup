import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../../types';
import Avatar from '../common/Avatar';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  showName: boolean;
  isGroupChat: boolean;
}

export default function MessageBubble({ message, showAvatar, showName, isGroupChat }: MessageBubbleProps) {
  const { isMe, text, senderName, timestamp, status, reactions } = message;

  return (
    <div className={`flex items-end gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-8 flex-shrink-0">
        {!isMe && showAvatar && (
          <Avatar name={senderName} size="sm" />
        )}
      </div>

      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && isGroupChat && showName && (
          <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">{senderName}</span>
        )}

        <div className="relative group">
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isMe
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
            }`}
          >
            {text}
          </div>

          {reactions && reactions.length > 0 && (
            <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {reactions.map((r, i) => (
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
          <span className="text-xs text-slate-400">{timestamp}</span>
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
