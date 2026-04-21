import { useState } from 'react';
import { CreditCard as Edit, Settings, Bell, ChevronDown, LogOut, Users } from 'lucide-react';
import { Conversation, User } from '../../types';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/features/authSlice';
import SearchBar from './SearchBar';
import ConversationList from './ConversationList';
import Avatar from '../common/Avatar';
import { StartChatForm } from './StartChatForm'; 
import CreateGroupModal from '../chat/CreateGroupModal'; // Adjust path if it is in another folder

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
  currentUser: User;
}

export default function Sidebar({ conversations, activeId, onSelect, currentUser }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // NEW: State to control the Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  
  const dispatch = useAppDispatch();

  // Safely calculate unread count (assuming your new Redux Chat type supports this, or defaulting to 0)
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <aside className="w-72 flex-shrink-0 bg-slate-900 flex flex-col h-full border-r border-slate-800">
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-white font-bold text-base tracking-tight">Messenger</h1>
            </div>
            <div className="flex items-center gap-1">
              {totalUnread > 0 && (
                <div className="relative">
                  <Bell size={17} className="text-slate-400 hover:text-slate-200 cursor-pointer transition" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full text-white text-xs flex items-center justify-center font-bold leading-none" style={{ fontSize: '9px' }}>
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                </div>
              )}
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition">
                <Edit size={16} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition">
                <Settings size={16} />
              </button>
            </div>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Existing Start Chat Form for 1:1 */}
        <StartChatForm />

        {/* NEW: Create Group Button */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition shadow-sm border border-slate-700"
          >
            <Users size={16} />
            Create Group
          </button>
        </div>

        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelect}
          searchQuery={search}
        />

        <div className="border-t border-slate-800 px-3 py-3 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition group"
          >
            {/* Fallback to username if name isn't available on the Redux user object */}
            <Avatar username={currentUser.username || currentUser.username} size="sm" status={currentUser.status || 'online'} showStatus />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-slate-200 truncate">{currentUser.username || currentUser.username}</p>
              <p className="text-xs text-emerald-400 capitalize">{currentUser.status || 'online'}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-500 group-hover:text-slate-300 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 text-sm shadow-xl z-50">
              {(['online', 'away', 'busy', 'offline'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setShowUserMenu(false)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-700 transition capitalize ${
                    (currentUser.status || 'online') === s ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    s === 'online' ? 'bg-emerald-400' :
                    s === 'away' ? 'bg-amber-400' :
                    s === 'busy' ? 'bg-rose-400' :
                    'bg-slate-500'
                  }`} />
                  {s}
                </button>
              ))}
              
              {/* Log Out Button */}
              <div className="h-px bg-slate-700 w-full my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-700 transition text-rose-400 hover:text-rose-300"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* NEW: Render the Modal (Outside the aside so it overlays the whole screen cleanly) */}
      <CreateGroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
      />
    </>
  );
}