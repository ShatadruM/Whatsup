import { useState } from 'react';
import { X, Users, Bell, Trash2, UserPlus, Shield, UserMinus, ArrowUpCircle } from 'lucide-react';
import axios from 'axios';
import { Conversation, User } from '../../types';
import Avatar from '../common/Avatar';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
// import { updateConversation, removeConversation } from '../../store/features/chatSlice'; // Uncomment when ready to wire to Redux

interface InfoPanelProps {
  conversation: Conversation;
  members?: User[];
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

export default function InfoPanel({ conversation, members = conversation.participants, onClose }: InfoPanelProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. DYNAMIC DISPLAY INFO ---
  const isGroup = conversation.type === 'group';
  
  // Find the other user if it's a 1:1 chat
  const otherUser = !isGroup 
    ? conversation.participants.find(p => p._id !== currentUser?._id) 
    : null;

  const displayName = isGroup ? conversation.chatName : otherUser?.username || 'Unknown User';
  const displayStatus = isGroup 
    ? `${conversation.participants.length} members` 
    : otherUser?.status || 'offline';

  // --- 2. ADMIN CHECKS ---
  const checkIsAdmin = (userId: string) => {
    if (!conversation.groupAdmins) return false;
    return conversation.groupAdmins.some((admin: any) => 
      (typeof admin === 'string' ? admin : admin._id) === userId
    );
  };

  const amIAdmin = currentUser ? checkIsAdmin(currentUser._id) : false;

  // --- 3. API HANDLERS ---
  const handlePromote = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data } = await axios.put('/api/chats/group/promote', 
        { chatId: conversation._id, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // dispatch(updateConversation(data)); // Update Redux to trigger UI refresh
    } catch (error) {
      console.error("Failed to promote user", error);
      alert("Failed to promote user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      setIsLoading(true);
      const { data } = await axios.put('/api/chats/group/remove', 
        { chatId: conversation._id, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // dispatch(updateConversation(data)); 
    } catch (error) {
      console.error("Failed to remove user", error);
      alert("Failed to remove user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      setIsLoading(true);
      await axios.put('/api/chats/group/remove', 
        { chatId: conversation._id, userId: currentUser?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // dispatch(removeConversation(conversation._id)); 
      onClose();
    } catch (error) {
      console.error("Failed to leave group", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-72 flex-shrink-0 bg-white border-l border-slate-100 flex flex-col h-full">
      {/* Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
        <h3 className="font-semibold text-slate-700 text-sm">
          {isGroup ? 'Group Info' : 'Profile'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile / Group Icon Section */}
        <div className="flex flex-col items-center px-6 py-8 border-b border-slate-100">
          {isGroup ? (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Users size={36} className="text-blue-500" />
            </div>
          ) : (
            <div className="mb-4">
              <Avatar
                username={displayName}
                size="lg"
                status={otherUser?.status}
                showStatus
              />
            </div>
          )}
          <h2 className="font-bold text-slate-800 text-lg text-center">{displayName}</h2>
          
          {!isGroup && otherUser?.status ? (
            <span className={`text-xs mt-2 font-medium ${
              otherUser.status === 'online' ? 'text-emerald-500' :
              otherUser.status === 'away' ? 'text-amber-500' :
              otherUser.status === 'busy' ? 'text-rose-500' :
              'text-slate-400'
            }`}>
              {statusLabel[otherUser.status]}
            </span>
          ) : (
            <p className="text-xs text-slate-400 mt-1">{displayStatus}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-medium">
              <Bell size={15} />
              Mute
            </button>
            {isGroup && amIAdmin && (
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-sm font-medium">
                <UserPlus size={15} />
                Add
              </button>
            )}
          </div>
        </div>

        {/* Members List (Group Only) */}
        {isGroup && members && members.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Members</p>
            <div className="flex flex-col gap-1">
              {members.map((member) => {
                const isMe = member._id === currentUser?._id;
                const isMemberAdmin = checkIsAdmin(member._id);

                return (
                  <div key={member._id} className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition relative">
                    <div className="flex items-center gap-3">
                      <Avatar username={member.username} size="sm" status={member.status} showStatus />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {isMe ? 'You' : member.username}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {isMemberAdmin ? 'Admin' : member.status}
                        </p>
                      </div>
                    </div>

                    {/* Admin Badge & Actions */}
                    <div className="flex items-center gap-2">
                      {isMemberAdmin && !isMe && <Shield size={14} className="text-blue-500" />}
                      
                      {/* Show management buttons on hover if I am an Admin, looking at someone else */}
                      {amIAdmin && !isMe && !isLoading && (
                        <div className="hidden group-hover:flex items-center gap-1 bg-white shadow-sm border border-slate-100 p-1 rounded-lg absolute right-2">
                          {!isMemberAdmin && (
                            <button 
                              onClick={() => handlePromote(member._id)}
                              title="Make Admin"
                              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                            >
                              <ArrowUpCircle size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleRemove(member._id)}
                            title="Remove Member"
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="px-4 py-3 mt-2">
          <button 
            disabled={isLoading}
            onClick={isGroup ? handleLeaveGroup : undefined /* Add delete 1:1 chat handler here later */}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition text-sm font-medium border border-rose-100 disabled:opacity-50"
          >
            <Trash2 size={15} />
            {isGroup ? 'Leave group' : 'Delete conversation'}
          </button>
        </div>
      </div>
    </div>
  );
}