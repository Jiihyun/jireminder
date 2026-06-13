'use client';

import { useState } from 'react';
import ReminderRow from './ReminderRow';
import ReminderInput from './ReminderInput';
import type { ReminderGroup } from '@/types';

interface ReminderListProps {
  listId: number;
  data: ReminderGroup;
  color: string;
}

export default function ReminderList({ listId, data, color }: ReminderListProps) {
  const [inputActive, setInputActive] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);

  return (
    <div>
      {/* 미완료 리마인더 */}
      <ul className="space-y-0.5 mb-2">
        {data.incomplete.map((reminder) => (
          <ReminderRow key={reminder.id} reminder={reminder} color={color} />
        ))}
        {/* 인라인 입력 */}
        {inputActive && (
          <ReminderInput
            listId={listId}
            color={color}
            onCancel={() => setInputActive(false)}
          />
        )}
      </ul>

      {/* 새 리마인더 추가 버튼 */}
      {!inputActive && (
        <button
          type="button"
          onClick={() => setInputActive(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm hover:bg-black/3
            rounded-lg w-full transition-colors duration-100"
          style={{ color }}
        >
          <span className="text-lg leading-none font-light">+</span>
          <span>새로운 리마인더</span>
        </button>
      )}

      {/* 완료됨 섹션 */}
      {data.completed.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setCompletedOpen((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-1 text-xs font-semibold
              w-full hover:bg-black/3 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span
              className={`transition-transform duration-200 ${completedOpen ? 'rotate-90' : ''}`}
            >
              ▶
            </span>
            완료됨 {data.completed.length}개
          </button>

          {completedOpen && (
            <ul className="space-y-0.5 mt-1 animate-slide-down">
              {data.completed.map((reminder) => (
                <ReminderRow key={reminder.id} reminder={reminder} color={color} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
