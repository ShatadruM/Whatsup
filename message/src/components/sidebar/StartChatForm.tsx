import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat'; // Adjust path if needed

export const StartChatForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { startDirectMessage } = useChat();

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await startDirectMessage(email);

    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      // Success! Clear the form (the UI will auto-navigate to the new chat)
      setEmail('');
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4 border-b border-slate-700 bg-slate-800">
      <form onSubmit={handleStartChat} className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase">
          Start a new conversation
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by user email..."
            className="flex-1 px-3 py-2 text-sm text-slate-200 bg-slate-900 border border-slate-700 rounded focus:outline-none focus:border-blue-500"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-3 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Chat'}
          </button>
        </div>
        {message.text && (
          <p className={`text-xs mt-1 ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
};