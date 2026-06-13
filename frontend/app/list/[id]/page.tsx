'use client';

import { use, useEffect } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { useLists } from '@/hooks/useLists';
import { useUIStore } from '@/store/uiStore';
import { COLOR_HEX } from '@/components/ui/ColorPicker';
import { ReminderSkeleton } from '@/components/ui/Skeleton';
import ReminderList from '@/components/reminder/ReminderList';
import ReminderRow from '@/components/reminder/ReminderRow';
import Highlight from '@/components/ui/Highlight';
import type { SmartListId } from '@/types';

const SMART_LIST_IDS: SmartListId[] = ['today', 'scheduled', 'all', 'flagged', 'completed'];

const SMART_LABELS: Record<SmartListId, { label: string; icon: string; color: string }> = {
  today: { label: '오늘', icon: '📅', color: '#007aff' },
  scheduled: { label: '예정', icon: '📆', color: '#ff3b30' },
  all: { label: '전체', icon: '📋', color: '#1c1c1e' },
  flagged: { label: '플래그됨', icon: '🚩', color: '#ff9500' },
  completed: { label: '완료됨', icon: '✅', color: '#8e8e93' },
};

function groupByDate(reminders: ReturnType<typeof Array.prototype.filter>) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeekEnd = new Date(today);
  nextWeekEnd.setDate(today.getDate() + 7);
  const twoWeeksEnd = new Date(today);
  twoWeeksEnd.setDate(today.getDate() + 14);

  const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
  const todayStr = toDateStr(today);
  const tomorrowStr = toDateStr(tomorrow);

  const groups: Record<string, typeof reminders> = {
    오늘: [],
    내일: [],
    '이번 주': [],
    '다음 주': [],
    이후: [],
  };

  for (const r of reminders) {
    if (!r.dueDate) {
      groups['이후'].push(r);
    } else if (r.dueDate === todayStr) {
      groups['오늘'].push(r);
    } else if (r.dueDate === tomorrowStr) {
      groups['내일'].push(r);
    } else if (r.dueDate <= toDateStr(nextWeekEnd)) {
      groups['이번 주'].push(r);
    } else if (r.dueDate <= toDateStr(twoWeeksEnd)) {
      groups['다음 주'].push(r);
    } else {
      groups['이후'].push(r);
    }
  }

  return groups;
}

export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // 셀렉터로 필요한 값만 구독 → 불필요한 재렌더 방지
  const setSelectedList = useUIStore((s) => s.setSelectedList);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const { data: lists = [] } = useLists();

  const isSmart = SMART_LIST_IDS.includes(id as SmartListId);
  const numericId = isSmart ? null : Number(id);

  // 사이드바 선택 상태 동기화 — 렌더 중 호출 금지, useEffect 사용
  useEffect(() => {
    setSelectedList(id);
  }, [id, setSelectedList]);

  // 검색 중이면 searchQuery 우선
  const queryParams = searchQuery
    ? { q: searchQuery }
    : isSmart
    ? { smart: id }
    : { listId: numericId! };

  const { data: reminderGroup, isLoading } = useReminders(queryParams);

  // 목록 메타데이터
  const list = numericId ? lists.find((l) => l.id === numericId) : null;
  const smartMeta = isSmart ? SMART_LABELS[id as SmartListId] : null;

  const headerColor = searchQuery
    ? '#007aff'
    : list
    ? COLOR_HEX[list.color] ?? '#007aff'
    : smartMeta?.color ?? '#007aff';

  const headerLabel = searchQuery
    ? `"${searchQuery}" 검색 결과`
    : list?.name ?? smartMeta?.label ?? '';
  const headerIcon = searchQuery ? '🔍' : list?.icon ?? smartMeta?.icon ?? '';

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-8 pt-8 pb-4">
        {headerIcon && <div className="text-3xl mb-1">{headerIcon}</div>}
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
          <ReminderSkeleton />
        ) : reminderGroup && numericId && !searchQuery ? (
          /* 일반 목록 — 편집 가능 */
          <ReminderList
            listId={numericId}
            data={reminderGroup}
            color={headerColor}
          />
        ) : reminderGroup && id === 'scheduled' && !searchQuery ? (
          /* 예정 — 날짜별 그룹 */
          (() => {
            const groups = groupByDate(reminderGroup.incomplete);
            return (
              <div className="space-y-6">
                {Object.entries(groups).map(([label, items]) =>
                  items.length === 0 ? null : (
                    <div key={label}>
                      <h2
                        className="text-xs font-semibold uppercase tracking-wide px-4 mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {label}
                      </h2>
                      <ul className="space-y-0.5">
                        {items.map((r) => {
                          const ownerList = lists.find((l) => l.id === r.listId);
                          const c = ownerList ? COLOR_HEX[ownerList.color] ?? '#007aff' : headerColor;
                          return <ReminderRow key={r.id} reminder={r} color={c} />;
                        })}
                      </ul>
                    </div>
                  )
                )}
              </div>
            );
          })()
        ) : reminderGroup ? (
          /* 스마트 목록 / 검색 결과 */
          <ul className="space-y-0.5">
            {[...reminderGroup.incomplete, ...reminderGroup.completed].map((reminder) => {
              const ownerList = lists.find((l) => l.id === reminder.listId);
              const itemColor = ownerList ? COLOR_HEX[ownerList.color] ?? '#007aff' : headerColor;
              return (
                <li key={reminder.id} className="flex items-start gap-2.5 px-4 py-2 hover:bg-black/3 rounded-lg">
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
                      <Highlight text={reminder.title} query={searchQuery} />
                    </p>
                    {ownerList && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {ownerList.name}
                      </p>
                    )}
                    {reminder.memo && searchQuery && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        <Highlight text={reminder.memo} query={searchQuery} />
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
            {reminderGroup.incomplete.length === 0 && reminderGroup.completed.length === 0 && (
              <li
                className="text-sm text-center py-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                {searchQuery ? '검색 결과가 없습니다' : '리마인더가 없습니다'}
              </li>
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
