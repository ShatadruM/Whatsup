import { Phone, Video, Info, Users, Search, MoreHorizontal } from 'lucide-react';
import { Conversation } from '../../types';
import Avatar from '../common/Avatar';

interface ChatHeaderProps {
  conversation: Conversation;
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
  const { type, name, isOnline, status, memberCount, description, isTyping } = conversation;

  return (
    <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        {type === 'group' ? (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-blue-500" />
          </div>
        ) : (
          <Avatar name={name} size="md" status={status} showStatus />
        )}

        <div>
          <h2 className="font-semibold text-slate-800 text-sm leading-tight">{name}</h2>
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
              {type === 'dm'
                ? status ? statusLabel[status] : 'Offline'
                : description || `${memberCount} members`}
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
