import { Users } from 'lucide-react';
import { Conversation } from '../../types'; 
import Avatar from '../common/Avatar';

interface ConversationItemProps {
  conversation: any; 
  isActive: boolean;
  displayName?: string;   // Now we will actually use this!
  displayAvatar?: string; // And this!
  isOnline?: boolean;     // And this!
  onClick: () => void;
}

// 1. DESTRUCTURE THE PROPS HERE
export default function ConversationItem({ 
  conversation, 
  isActive, 
  displayName = 'Unknown', // Default fallback
  displayAvatar,
  isOnline = false,
  onClick 
}: ConversationItemProps) {
  
  // 2. NO MORE INTERNAL CALCULATIONS. Just grab the basic message data.
  const { type, lastMessage, lastMessageTime, unreadCount, memberCount, isTyping } = conversation;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group text-left ${
        isActive
          ? 'bg-blue-600 shadow-lg shadow-blue-900/30'
          : 'hover:bg-slate-800'
      }`}
    >
      <div className="relative flex-shrink-0">
        {type === 'group' ? (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-500' : 'bg-slate-700'}`}>
            <Users size={18} className={isActive ? 'text-white' : 'text-slate-300'} />
          </div>
        ) : (
          <Avatar
            username={displayName} // 3. Use the prop directly!
            size="md"
            status={isOnline ? 'online' : 'offline'} // 4. Use the prop directly!
            showStatus
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
            {displayName /* 5. Use the prop directly! */}
          </span>
          <span className={`text-xs flex-shrink-0 ml-1 ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
            {lastMessageTime}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {isTyping ? (
            <div className={`flex items-center gap-1 text-xs ${isActive ? 'text-blue-200' : 'text-emerald-400'}`}>
              <span>typing</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          ) : (
            <p className={`text-xs truncate ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
              {lastMessage || "Started a conversation"} 
            </p>
          )}

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
            {type === 'group' && memberCount && (
              <span className={`text-xs ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                {memberCount}
              </span>
            )}
            {(unreadCount || 0) > 0 && (
              <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none ${
                isActive ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              }`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}