import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 rounded-lg py-2 pl-9 pr-8 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
