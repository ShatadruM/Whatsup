import { useState, useMemo } from 'react';
import { X, Search, ArrowRight, Check, Users } from 'lucide-react';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addConversation, setActiveConversation } from '../../store/features/chatSlice'; 
import Avatar from '../common/Avatar';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser, token } = useAppSelector((state) => state.auth);
  const { conversations } = useAppSelector((state) => state.chat); 

  // --- WIZARD STATE ---
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // --- 1. BULLETPROOF CONTACTS EXTRACTOR ---
  const contacts = useMemo(() => {
    const uniqueUsers = new Map();
    const myId = String(currentUser?._id || (currentUser as any)?.id);
    
    if (conversations && Array.isArray(conversations)) {
      conversations.forEach((chat: any) => {
        if (chat.type === '1:1') {
          // Safely find the other participant
          const otherUser = chat.participants?.find((p: any) => {
            const pId = typeof p === 'string' ? p : String(p._id || p.id);
            return pId !== myId;
          });

          // Ensure it's a populated object (has a username) before adding it
          if (otherUser && typeof otherUser !== 'string') {
            const otherUserId = String(otherUser._id || otherUser.id);
            if (!uniqueUsers.has(otherUserId)) {
              uniqueUsers.set(otherUserId, otherUser);
            }
          }
        }
      });
    }
    return Array.from(uniqueUsers.values());
  }, [conversations, currentUser]); 

  // Filter contacts based on search bar
  const filteredContacts = contacts.filter(contact => 
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- 2. BULLETPROOF SELECTION TOGGLER ---
  const toggleUser = (user: any) => {
    const userId = String(user._id || user.id);
    
    if (selectedUsers.some((u) => String(u._id || u.id) === userId)) {
      // Remove them
      setSelectedUsers(selectedUsers.filter((u) => String(u._id || u.id) !== userId));
    } else {
      // Add them
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;

    setIsCreating(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/chats/group', {
        name: groupName,
        // Ensure we send clean string IDs to the backend
        participants: JSON.stringify(selectedUsers.map(u => String(u._id || u.id)))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      dispatch(addConversation(data));
      dispatch(setActiveConversation(data)); 
      
      handleClose();
    } catch (error) {
      console.error("Failed to create group", error);
      alert("Could not create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-5 py-4 bg-blue-600 text-white flex items-center gap-4">
          <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-full transition">
            <X size={24} />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-lg leading-tight">
              {step === 1 ? 'Add participants' : 'New group'}
            </h2>
            {step === 1 && (
              <p className="text-blue-100 text-xs">
                {selectedUsers.length} selected
              </p>
            )}
          </div>
        </div>

        {/* STEP 1: SELECT PARTICIPANTS */}
        {step === 1 && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Selected Users Strip */}
            {selectedUsers.length > 0 && (
              <div className="px-4 py-3 border-b border-slate-100 flex gap-4 overflow-x-auto no-scrollbar">
                {selectedUsers.map(user => {
                  const uId = String(user._id || user.id);
                  return (
                    <div key={uId} className="flex flex-col items-center gap-1 relative w-14 flex-shrink-0 cursor-pointer" onClick={() => toggleUser(user)}>
                      <div className="relative">
                        <Avatar username={user.username} size="md" />
                        <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white rounded-full p-0.5 border-2 border-white">
                          <X size={10} />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600 truncate w-full text-center">{user.username}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100">
              <div className="bg-slate-100 rounded-lg flex items-center px-3 py-1.5">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search contacts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 px-3 py-1 text-sm"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacts</p>
                {filteredContacts.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-4">No contacts found.</p>
                ) : (
                  filteredContacts.map(user => {
                    const uId = String(user._id || user.id);
                    // --- 3. BULLETPROOF IS-SELECTED CHECK ---
                    const isSelected = selectedUsers.some(u => String(u._id || u.id) === uId);
                    
                    return (
                      <button 
                        key={uId} 
                        onClick={() => toggleUser(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition"
                      >
                        <div className="relative">
                          <Avatar username={user.username} size="md" />
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-slate-800">{user.username}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Floating Next Button */}
            {selectedUsers.length >= 2 && (
              <button 
                onClick={() => setStep(2)}
                className="absolute bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-200 transition-transform hover:scale-105"
              >
                <ArrowRight size={24} />
              </button>
            )}
          </div>
        )}

        {/* STEP 2: GROUP DETAILS */}
        {step === 2 && (
          <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right-4">
            
            {/* Group Icon Placeholder */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                <Users size={40} />
              </div>
            </div>

            {/* Group Name Input */}
            <div className="relative mb-8">
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Subject"
                autoFocus
                className="w-full border-b-2 border-blue-500 bg-transparent py-2 text-lg outline-none placeholder-slate-300"
              />
              <span className="absolute right-0 bottom-2 text-xs text-slate-400">
                {groupName.length}/25
              </span>
            </div>

            <p className="text-sm text-slate-500 mb-4">Participants: {selectedUsers.length}</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <span key={String(user._id || user.id)} className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                  {user.username}
                </span>
              ))}
            </div>

            {/* Floating Create Button */}
            <button 
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || isCreating}
              className="absolute bottom-6 right-6 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white p-4 rounded-full shadow-lg shadow-green-200 transition flex items-center justify-center"
            >
              {isCreating ? (
                 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={24} />
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}