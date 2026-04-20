import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, Mic, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';

interface MessageInputProps {
  // 1. UPDATED: onSend now accepts an optional file!
  onSend: (text: string, file: File | null) => void;
  placeholder?: string;
  isUploading?: boolean; // Optional: To disable input while uploading
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙌', '🔥', '✅'];

export default function MessageInput({ onSend, placeholder = 'Type a message...', isUploading = false }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  
  // 2. NEW STATES: For holding the file and its preview URL
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  const handleSend = () => {
    const trimmed = text.trim();
    // 3. UPDATED: Allow send if there is text OR a file
    if (!trimmed && !selectedFile) return;
    
    // Pass both to the parent component
    onSend(trimmed, selectedFile);
    
    // Reset everything
    setText('');
    removeFile();
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

  // --- NEW FILE HANDLING FUNCTIONS ---
  const handlePaperclipClick = () => {
    fileInputRef.current?.click(); // Simulates a click on the hidden file input
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Check file size (15MB limit matching backend)
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large. Maximum size is 15MB.");
      return;
    }

    setSelectedFile(file);

    // If it's an image, create a preview URL so we can show a thumbnail
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); // Not an image, we'll just show the file name
    }

    // Reset the input value so the user can select the same file again if they remove it
    e.target.value = '';
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-slate-100 relative">
      
      {/* --- NEW: FILE PREVIEW STRIP --- */}
      {selectedFile && (
        <div className="mb-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 w-fit max-w-full">
          <div className="flex items-center gap-2 overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                {selectedFile.type.startsWith('video/') ? <ImageIcon size={20} /> : <FileIcon size={20} />}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</span>
              <span className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
          <button onClick={removeFile} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit absolute bottom-16">
          {EMOJIS.map((emoji) => (
            <button key={emoji} onClick={() => insertEmoji(emoji)} className="text-xl hover:scale-125 transition-transform">
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* --- NEW: HIDDEN FILE INPUT --- */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,video/*,.pdf,.doc,.docx" // Restrict allowed types
        />

        <button 
          onClick={handlePaperclipClick}
          disabled={isUploading}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex-shrink-0 disabled:opacity-50" 
          title="Attach file"
        >
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
            disabled={isUploading}
            rows={1}
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none resize-none leading-relaxed max-h-28 disabled:opacity-50"
          />
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            disabled={isUploading}
            className={`p-1 rounded-lg transition flex-shrink-0 self-end disabled:opacity-50 ${showEmoji ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Smile size={18} />
          </button>
        </div>

        {/* --- UPDATED: SEND BUTTON LOGIC --- */}
        {(text.trim() || selectedFile) ? (
          <button
            onClick={handleSend}
            disabled={isUploading}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition shadow-sm shadow-blue-200 flex-shrink-0 disabled:opacity-50 flex items-center justify-center"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-white">🚀</span> // Using emoji as placeholder since Send wasn't importing correctly in my preview, swap back to <Send size={17} />!
            )}
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