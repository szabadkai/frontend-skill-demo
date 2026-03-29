import React, { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useStore } from '../store/useStore';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export default function AutocompleteInput({ value, onChange, onSubmit, placeholder, className, style, autoFocus, onBlur }: Props) {
  const { todos, goals } = useStore();
  const [showDropdown, setShowDropdown] = useState<{ type: 'tag' | 'goal', query: string, position: number } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract unique tags
  const uniqueTags = Array.from(new Set(todos.flatMap(t => t.tags || [])));
  // Extract unique goal slugs
  const goalSlugs = goals.map(g => g.text.replace(/\s+/g, '-'));

  const filteredSuggestions = showDropdown?.type === 'tag' 
    ? uniqueTags.filter(t => t.toLowerCase().startsWith(showDropdown.query.toLowerCase())).slice(0, 5)
    : showDropdown?.type === 'goal'
      ? goalSlugs.filter(g => g.toLowerCase().startsWith(showDropdown.query.toLowerCase())).slice(0, 5)
      : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    // Match the current word being typed
    const match = textBeforeCursor.match(/(^|\s)([#@])([a-zA-Z0-9_-]*)$/);
    
    if (match) {
      setShowDropdown({
        type: match[2] === '#' ? 'tag' : 'goal',
        query: match[3],
        position: match.index !== undefined ? match.index + match[1].length : 0
      });
      setSelectedIndex(0);
    } else {
      setShowDropdown(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(filteredSuggestions[selectedIndex]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const insertSuggestion = (suggestion: string) => {
    if (!showDropdown || !inputRef.current) return;
    
    const prefix = showDropdown.type === 'tag' ? '#' : '@';
    const beforeWord = value.slice(0, showDropdown.position);
    const cursorPosition = inputRef.current.selectionStart || 0;
    
    // Find the end of the current word
    const remainingText = value.slice(cursorPosition);
    let endOfWordIdx = remainingText.search(/\s/);
    if (endOfWordIdx === -1) endOfWordIdx = remainingText.length;
    
    const afterWord = remainingText.slice(endOfWordIdx);
    
    const newValue = beforeWord + prefix + suggestion + ' ' + afterWord;
    onChange(newValue);
    setShowDropdown(null);
    inputRef.current.focus();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setShowDropdown(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        className={className}
        style={style}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        onBlur={() => {
          // Delay blur to allow clicking suggestions
          setTimeout(() => {
            if (onBlur) onBlur();
          }, 150);
        }}
      />
      
      {showDropdown && filteredSuggestions.length > 0 && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            marginTop: '4px',
            background: 'var(--surface-bg)',
            border: '1px solid var(--surface-border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
            minWidth: '150px',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {filteredSuggestions.map((suggestion, idx) => (
            <div 
              key={suggestion}
              onClick={() => insertSuggestion(suggestion)}
              style={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                background: idx === selectedIndex ? 'var(--surface-border)' : 'transparent',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span style={{ color: showDropdown.type === 'tag' ? 'var(--accent)' : 'var(--success)' }}>
                {showDropdown.type === 'tag' ? '#' : '@'}
              </span>
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
