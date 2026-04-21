import { Conversation } from '../../types';
import ConversationItem from './ConversationItem';
import { useAppSelector } from '../../store/hooks'; 

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
  searchQuery: string;
}

export default function ConversationList({ conversations, activeId, onSelect, searchQuery }: ConversationListProps) {
  const currentUser = useAppSelector((state) => state.auth.user);

  const getChatDetails = (chat: any) => {
    if (chat.type === 'group') {
      return {
        name: chat.chatName || 'Group Chat',
        avatar: undefined,
        isOnline: false,
      };
    }
    
    const myId = String(currentUser?._id || (currentUser as any)?.id);
    
    const otherUser = chat.participants?.find((p: any) => {
      // FIX: If 'p' is just a string ID, use it directly! Otherwise, grab _id.
      const participantId = typeof p === 'string' ? p : String(p._id || p.id);
      return participantId !== myId;
    });

    // FIX: If otherUser is just a string, we don't have their username yet.
    const finalName = typeof otherUser === 'string' 
      ? 'Loading...' // Or 'New User'
      : otherUser?.username || 'Unknown User';

    return {
      name: finalName,
      avatar: typeof otherUser === 'string' ? undefined : otherUser?.avatar,
      isOnline: typeof otherUser === 'string' ? false : otherUser?.status === 'online',
    };
  };

  const dms = conversations.filter((c: any) => c.type === '1:1');
  const groups = conversations.filter((c: any) => c.type === 'group');

  // Filter using the new bulletproof name
  const filterConversations = (list: Conversation[]) =>
    list.filter((c) => {
      const { name } = getChatDetails(c);
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const filteredDMs = filterConversations(dms);
  const filteredGroups = filterConversations(groups);

  if (filteredDMs.length === 0 && filteredGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
        <p>No conversations found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto flex-1 px-2 pb-4 scrollbar-thin">
      {filteredDMs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 py-2 mt-1">
            Direct Messages
          </p>
          <div className="flex flex-col gap-0.5">
            {filteredDMs.map((conv) => {
              const details = getChatDetails(conv); // Calculate details once!
              return (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isActive={activeId === conv._id}
                  onClick={() => onSelect(conv)}
                  // Pass the extracted details straight into the item!
                  displayName={details.name}
                  displayAvatar={details.avatar}
                  isOnline={details.isOnline}
                />
              );
            })}
          </div>
        </div>
      )}

      {filteredGroups.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 py-2 mt-3">
            Groups
          </p>
          <div className="flex flex-col gap-0.5">
            {filteredGroups.map((conv) => {
              const details = getChatDetails(conv);
              return (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isActive={activeId === conv._id}
                  onClick={() => onSelect(conv)}
                  displayName={details.name}
                  displayAvatar={details.avatar}
                  isOnline={details.isOnline}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}