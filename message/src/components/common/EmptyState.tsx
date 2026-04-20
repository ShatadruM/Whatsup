import { MessageCircle } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-center px-8">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
        <MessageCircle size={36} className="text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">Your messages</h2>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        Select a conversation from the sidebar to start chatting, or search for someone new.
      </p>
    </div>
  );
}
