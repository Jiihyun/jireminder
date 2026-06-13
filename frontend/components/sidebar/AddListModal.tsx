'use client';

import { useState, useEffect } from 'react';
import ColorPicker from '@/components/ui/ColorPicker';
import type { ListColor, ReminderList } from '@/types';

interface AddListModalProps {
  open: boolean;
  initialData?: ReminderList | null;
  onClose: () => void;
  onConfirm: (name: string, color: ListColor, icon: string) => void;
}

export default function AddListModal({
  open,
  initialData,
  onClose,
  onConfirm,
}: AddListModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<ListColor>('BLUE');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setIcon(initialData.icon ?? '');
    } else {
      setName('');
      setColor('BLUE');
      setIcon('');
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm(name.trim(), color, icon.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
    >
      <div
        className="rounded-2xl shadow-2xl p-6 w-[320px]"
        style={{ backgroundColor: 'var(--bg-main)' }}
      >
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {initialData ? '목록 수정' : '새로운 목록'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 입력 */}
          <input
            autoFocus
            type="text"
            placeholder="목록 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              color: 'var(--text-primary)',
              border: '1px solid var(--separator)',
            }}
          />

          {/* 아이콘 입력 */}
          <input
            type="text"
            placeholder="아이콘 (이모지, 선택)"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              color: 'var(--text-primary)',
              border: '1px solid var(--separator)',
            }}
          />

          {/* 색상 선택 */}
          <div>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              색상
            </p>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#007aff' }}
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
