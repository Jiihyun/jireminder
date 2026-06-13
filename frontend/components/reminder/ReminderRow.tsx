'use client';

import { useState } from 'react';
import CircleButton from '@/components/ui/CircleButton';
import { useToggleComplete, useToggleFlag } from '@/hooks/useReminders';
import { useUIStore } from '@/store/uiStore';
import type { Reminder } from '@/types';

const PRIORITY_BADGE: Record<string, string> = {
  LOW: '!',
  MEDIUM: '!!',
  HIGH: '!!!',
};

interface ReminderRowProps {
  reminder: Reminder;
  color: string;
}

export default function ReminderRow({ reminder, color }: ReminderRowProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const toggleComplete = useToggleComplete();
  const toggleFlag = useToggleFlag();
  const { openDetail } = useUIStore();

  const handleComplete = () => {
    if (reminder.completed) {
      toggleComplete.mutate(reminder.id);
      return;
    }
    // 완료 애니메이션 → 실제 API 호출
    setIsLeaving(true);
    setTimeout(() => {
      toggleComplete.mutate(reminder.id);
    }, 300);
  };

  // 마감일 색상
  const getDueDateColor = () => {
    if (!reminder.dueDate) return 'var(--text-secondary)';
    const today = new Date().toISOString().slice(0, 10);
    if (reminder.dueDate < today) return 'var(--due-overdue)';
    if (reminder.dueDate === today) return 'var(--due-today)';
    return 'var(--text-secondary)';
  };

  return (
    <li
      className={`
        group flex items-start gap-2.5 px-4 py-2 hover:bg-black/3 rounded-lg
        transition-all duration-300
        ${isLeaving ? 'opacity-0 max-h-0 overflow-hidden py-0' : 'opacity-100 max-h-20'}
        ${reminder.completed ? 'opacity-60' : ''}
      `}
    >
      {/* 완료 토글 버튼 */}
      <div className="mt-0.5">
        <CircleButton
          checked={reminder.completed}
          color={color}
          onClick={handleComplete}
        />
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm ${reminder.completed ? 'line-through' : ''}`}
            style={{ color: reminder.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}
          >
            {reminder.title}
          </span>
          {/* 우선순위 뱃지 */}
          {reminder.priority !== 'NONE' && PRIORITY_BADGE[reminder.priority] && (
            <span className="text-xs font-bold" style={{ color: 'var(--due-overdue)' }}>
              {PRIORITY_BADGE[reminder.priority]}
            </span>
          )}
        </div>

        {/* 메모 & 마감일 */}
        <div className="flex items-center gap-2 mt-0.5">
          {reminder.dueDate && (
            <span className="text-xs" style={{ color: getDueDateColor() }}>
              {reminder.dueDate}
              {reminder.dueTime && ` ${reminder.dueTime.slice(0, 5)}`}
            </span>
          )}
          {reminder.memo && (
            <span
              className="text-xs truncate"
              style={{ color: 'var(--text-secondary)' }}
            >
              {reminder.memo}
            </span>
          )}
        </div>
      </div>

      {/* hover 시 액션 버튼 */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {/* 플래그 */}
        <button
          type="button"
          onClick={() => toggleFlag.mutate(reminder.id)}
          className="text-sm p-1 rounded hover:bg-black/5"
          title={reminder.flagged ? '플래그 해제' : '플래그'}
        >
          {reminder.flagged ? '🚩' : (
            <span style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>🚩</span>
          )}
        </button>

        {/* 상세 패널 열기 */}
        <button
          type="button"
          onClick={() => openDetail(reminder.id)}
          className="text-xs px-1.5 py-0.5 rounded border transition-colors hover:bg-black/5"
          style={{
            color: 'var(--text-secondary)',
            borderColor: 'var(--separator)',
          }}
        >
          ⓘ
        </button>
      </div>
    </li>
  );
}
