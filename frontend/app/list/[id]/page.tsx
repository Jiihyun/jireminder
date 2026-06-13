'use client';

import { use } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { useLists } from '@/hooks/useLists';
import { useUIStore } from '@/store/uiStore';
import { COLOR_HEX } from '@/components/ui/ColorPicker';
import ReminderList from '@/components/reminder/ReminderList';
import type { SmartListId } from '@/types';

const SMART_LIST_IDS: SmartListId[] = ['today', 'scheduled', 'all', 'flagged', 'completed'];

const SMART_LABELS: Record<SmartListId, { label: string; icon: string; color: string }> = {
  today: { label: '오늘', icon: '📅', color: '#007aff' },
  scheduled: { label: '예정', icon: '📆', color: '#ff3b30' },
  all: { label: '전체', icon: '📋', color: '#1c1c1e' },
  flagged: { label: '플래그됨', icon: '🚩', color: '#ff9500' },
  completed: { label: '완료됨', icon: '✅', color: '#8e8e93' },
};

export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { setSelectedList } = useUIStore();
  const { data: lists = [] } = useLists();

  const isSmart = SMART_LIST_IDS.includes(id as SmartListId);
  const numericId = isSmart ? null : Number(id);

  const { data: reminderGroup, isLoading } = useReminders(
    isSmart
      ? { smart: id }
      : { listId: numericId! }
  );

  // 목록 메타데이터
  const list = numericId ? lists.find((l) => l.id === numericId) : null;
  const smartMeta = isSmart ? SMART_LABELS[id as SmartListId] : null;

  const headerColor = list
    ? COLOR_HEX[list.color] ?? '#007aff'
    : smartMeta?.color ?? '#007aff';

  const headerLabel = list?.name ?? smartMeta?.label ?? '';
  const headerIcon = list?.icon ?? smartMeta?.icon ?? '';

  // 사이드바 선택 상태 동기화
  if (typeof window !== 'undefined') {
    setSelectedList(id);
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-8 pt-8 pb-4">
        {headerIcon && (
          <div className="text-3xl mb-1">{headerIcon}</div>
        )}
        <h1
          className="text-3xl font-bold"
          style={{ color: headerColor }}
        >
          {headerLabel}
        </h1>
      </div>

      {/* 리마인더 목록 */}
      <div className="flex-1 overflow-auto px-4 pb-8">
        {isLoading ? (
          <div
            className="flex items-center justify-center h-32 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            불러오는 중...
          </div>
        ) : reminderGroup && numericId ? (
          <ReminderList
            listId={numericId}
            data={reminderGroup}
            color={headerColor}
          />
        ) : reminderGroup ? (
          /* 스마트 목록 — 읽기 전용 */
          <ul className="space-y-0.5">
            {[...reminderGroup.incomplete, ...reminderGroup.completed].map((reminder) => {
              const ownerList = lists.find((l) => l.id === reminder.listId);
              const itemColor = ownerList ? COLOR_HEX[ownerList.color] ?? '#007aff' : headerColor;
              return (
                <li key={reminder.id} className="flex items-start gap-2.5 px-4 py-2">
                  <span
                    className="mt-0.5 text-xs font-medium flex-shrink-0"
                    style={{ color: itemColor }}
                  >
                    ●
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${reminder.completed ? 'line-through' : ''}`}
                      style={{ color: reminder.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                    >
                      {reminder.title}
                    </p>
                    {ownerList && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {ownerList.name}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
