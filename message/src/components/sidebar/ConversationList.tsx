import { Conversation } from '../../types';
import ConversationItem from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
  searchQuery: string;
}

export default function ConversationList({ conversations, activeId, onSelect, searchQuery }: ConversationListProps) {
  const dms = conversations.filter((c) => c.type === 'dm');
  const groups = conversations.filter((c) => c.type === 'group');

  const filterConversations = (list: Conversation[]) =>
    list.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
            {filteredDMs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                onClick={() => onSelect(conv)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredGroups.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 py-2 mt-3">
            Groups
          </p>
          <div className="flex flex-col gap-0.5">
            {filteredGroups.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                onClick={() => onSelect(conv)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
