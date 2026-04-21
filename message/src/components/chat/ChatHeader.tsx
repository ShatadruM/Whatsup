import { Phone, Video, Info, Users, Search, MoreHorizontal } from 'lucide-react';
// import { Conversation } from '../../types'; // Temporarily ignore old types
import Avatar from '../common/Avatar';
import { useAppSelector } from '../../store/hooks'; 

interface ChatHeaderProps {
  conversation: any; 
  onInfoToggle: () => void;
  showInfo: boolean;
}

const statusLabel: Record<string, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Do not disturb',
  offline: 'Offline',
};

export default function ChatHeader({ conversation, onInfoToggle, showInfo }: ChatHeaderProps) {
  // 1. Grab current user
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const { type, isTyping } = conversation;

  // 2. Dynamically calculate the name and status
  let displayName = 'Unknown User';
  let displayStatus = 'Offline';
  let rawStatus = 'offline'; // Used specifically for the Avatar dot color

  if (type === 'group') {
    displayName = conversation.chatName || 'Group Chat';
    const memberCount = conversation.participants?.length || 0;
    displayStatus = `${memberCount} members`;
  } else {
    // --- THE BULLETPROOF 1:1 LOGIC ---
    const myId = String(currentUser?._id || (currentUser as any)?.id);
    
    const otherUser = conversation.participants?.find((p: any) => {
      // Handle both string arrays (unpopulated) and object arrays (populated)
      const participantId = typeof p === 'string' ? p : String(p._id || p.id);
      return participantId !== myId;
    });

    // Extract the final data
    displayName = typeof otherUser === 'string' ? 'Loading...' : (otherUser?.username || 'Unknown User');
    rawStatus = typeof otherUser === 'string' ? 'offline' : (otherUser?.status || 'offline');
    displayStatus = statusLabel[rawStatus] || 'Offline';
  }

  return (
    <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        {type === 'group' ? (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-blue-500" />
          </div>
        ) : (
          <Avatar 
            username={displayName} 
            size="md" 
            status={rawStatus as any} // Pass the raw status (online, away, etc.)
            showStatus 
          />
        )}

        <div>
          {/* Display the calculated name */}
          <h2 className="font-semibold text-slate-800 text-sm leading-tight">{displayName}</h2>
          {isTyping ? (
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <span>typing</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              {displayStatus}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition" title="Search in conversation">
          <Search size={17} />
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition" title="Voice call">
          <Phone size={17} />
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition" title="Video call">
          <Video size={17} />
        </button>
        <button
          onClick={onInfoToggle}
          className={`p-2 rounded-lg transition ${showInfo ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
          title="Conversation info"
        >
          <Info size={17} />
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition">
          <MoreHorizontal size={17} />
        </button>
      </div>
    </div>
  );
}