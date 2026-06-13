'use client';

import { useRef, useState } from 'react';
import CircleButton from '@/components/ui/CircleButton';
import { useCreateReminder } from '@/hooks/useReminders';

interface ReminderInputProps {
  listId: number;
  color: string;
  onCancel: () => void;
}

export default function ReminderInput({ listId, color, onCancel }: ReminderInputProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const createReminder = useCreateReminder(listId);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    createReminder.mutate(
      { listId, title: trimmed },
      {
        onSuccess: () => {
          setTitle('');
          inputRef.current?.focus();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setTitle('');
      onCancel();
    }
  };

  return (
    <li className="flex items-center gap-2.5 px-4 py-2">
      <CircleButton checked={false} color={color} onClick={() => {}} />
      <input
        ref={inputRef}
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        placeholder="새로운 리마인더"
        className="flex-1 text-sm outline-none bg-transparent"
        style={{ color: 'var(--text-primary)' }}
        maxLength={200}
      />
    </li>
  );
}
