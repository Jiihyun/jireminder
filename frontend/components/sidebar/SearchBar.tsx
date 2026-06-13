'use client';

import { useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function SearchBar() {
  const [value, setValue] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const { setSearchQuery } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 전역에서 SearchBar 포커스를 호출할 수 있도록 ref 노출
  useEffect(() => {
    (window as { __searchInputRef?: React.RefObject<HTMLInputElement | null> }).__searchInputRef = inputRef;
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim()) setIsFetching(true);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
      setIsFetching(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, setSearchQuery]);

  const handleClear = () => {
    setValue('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="px-2 mb-3">
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
        style={{ backgroundColor: 'rgba(120,120,128,0.12)' }}
      >
        {/* 검색 아이콘 or 스피너 */}
        {isFetching ? (
          <svg
            className="animate-spin"
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="#8e8e93" strokeWidth="1.5" strokeDasharray="8 8" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4.5" stroke="#8e8e93" strokeWidth="1.5" />
            <path d="M9 9l2.5 2.5" stroke="#8e8e93" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClear();
          }}
          placeholder="검색"
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: 'var(--text-primary)' }}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs leading-none rounded-full w-4 h-4 flex items-center justify-center hover:bg-black/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
