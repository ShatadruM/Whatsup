import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙌', '🔥', '✅'];

export default function MessageInput({ onSend, placeholder = 'Type a message...' }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    setShowEmoji(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-slate-100">
      {showEmoji && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => insertEmoji(emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0" title="Attach file">
          <Paperclip size={18} />
        </button>

        <div className="flex-1 flex items-end bg-slate-100 rounded-2xl px-3 py-2 gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none resize-none leading-relaxed max-h-28"
          />
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-1 rounded-lg transition flex-shrink-0 self-end ${showEmoji ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Smile size={18} />
          </button>
        </div>

        {text.trim() ? (
          <button
            onClick={handleSend}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition shadow-sm shadow-blue-200 flex-shrink-0"
          >
            <Send size={17} />
          </button>
        ) : (
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0">
            <Mic size={18} />
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center mt-1.5">
        Press <kbd className="text-xs bg-slate-100 px-1 py-0.5 rounded">Enter</kbd> to send &middot; <kbd className="text-xs bg-slate-100 px-1 py-0.5 rounded">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
