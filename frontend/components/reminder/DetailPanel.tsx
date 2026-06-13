'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Toggle from '@/components/ui/Toggle';
import SubTaskRow from './SubTaskRow';
import { useUIStore } from '@/store/uiStore';
import { useUpdateReminder, useToggleFlag, useReminders, useMoveReminder } from '@/hooks/useReminders';
import { useCreateSubTask } from '@/hooks/useSubTasks';
import { useLists } from '@/hooks/useLists';
import { COLOR_HEX } from '@/components/ui/ColorPicker';
import type { Priority, Reminder } from '@/types';

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'NONE', label: '없음' },
  { value: 'LOW', label: '낮음' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'HIGH', label: '높음' },
];

/* 실제 상세 패널 내용 — detailReminderListId 를 알 때만 렌더 */
function DetailPanelInner({
  reminderId,
  listId,
}: {
  reminderId: number;
  listId: number;
}) {
  const { data: reminderGroup } = useReminders({ listId });
  const { data: lists = [] } = useLists();
  const updateReminder = useUpdateReminder();
  const toggleFlag = useToggleFlag();
  const moveReminder = useMoveReminder();
  const createSubTask = useCreateSubTask();

  const [subTaskInput, setSubTaskInput] = useState('');
  const memoRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reminder: Reminder | undefined = reminderGroup
    ? [...reminderGroup.incomplete, ...reminderGroup.completed].find((r) => r.id === reminderId)
    : undefined;

  const [localTitle, setLocalTitle] = useState(reminder?.title ?? '');
  const [localMemo, setLocalMemo] = useState(reminder?.memo ?? '');

  useEffect(() => {
    setLocalTitle(reminder?.title ?? '');
    setLocalMemo(reminder?.memo ?? '');
  }, [reminder?.title, reminder?.memo]);

  // textarea 자동 높이
  useEffect(() => {
    if (memoRef.current) {
      memoRef.current.style.height = 'auto';
      memoRef.current.style.height = `${memoRef.current.scrollHeight}px`;
    }
  }, [localMemo]);

  const debouncePatch = useCallback(
    (patch: Parameters<typeof updateReminder.mutate>[0]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateReminder.mutate(patch), 500);
    },
    [updateReminder]
  );

  if (!reminder) {
    return (
      <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-secondary)' }}>
        불러오는 중...
      </div>
    );
  }

  const ownerList = lists.find((l) => l.id === reminder.listId);
  const color = ownerList ? COLOR_HEX[ownerList.color] ?? '#007aff' : '#007aff';

  return (
    <div className="p-5 space-y-4">
      {/* 제목 */}
      <input
        type="text"
        value={localTitle}
        onChange={(e) => {
          setLocalTitle(e.target.value);
          debouncePatch({ id: reminder.id, title: e.target.value });
        }}
        className="w-full text-base font-semibold outline-none bg-transparent"
        style={{ color: 'var(--text-primary)' }}
      />
      <hr style={{ borderColor: 'var(--separator)' }} />

      {/* 메모 */}
      <textarea
        ref={memoRef}
        value={localMemo}
        onChange={(e) => {
          setLocalMemo(e.target.value);
          debouncePatch({ id: reminder.id, memo: e.target.value });
        }}
        placeholder="메모"
        rows={2}
        className="w-full text-sm outline-none bg-transparent resize-none"
        style={{ color: 'var(--text-primary)' }}
      />
      <hr style={{ borderColor: 'var(--separator)' }} />

      {/* 마감일 */}
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>마감일</span>
        <Toggle
          checked={!!reminder.dueDate}
          onChange={(v) =>
            updateReminder.mutate({
              id: reminder.id,
              dueDate: v ? new Date().toISOString().slice(0, 10) : null,
              dueTime: null,
            })
          }
          color={color}
        />
      </div>
      {reminder.dueDate && (
        <input
          type="date"
          defaultValue={reminder.dueDate}
          onChange={(e) =>
            updateReminder.mutate({ id: reminder.id, dueDate: e.target.value || null })
          }
          className="w-full text-sm px-2 py-1 rounded outline-none"
          style={{ backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-primary)', border: '1px solid var(--separator)' }}
        />
      )}

      {/* 시간 */}
      {reminder.dueDate && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>시간</span>
            <Toggle
              checked={!!reminder.dueTime}
              onChange={(v) =>
                updateReminder.mutate({
                  id: reminder.id,
                  dueDate: reminder.dueDate,
                  dueTime: v ? '09:00:00' : null,
                })
              }
              color={color}
            />
          </div>
          {reminder.dueTime && (
            <input
              type="time"
              defaultValue={reminder.dueTime.slice(0, 5)}
              onChange={(e) =>
                updateReminder.mutate({
                  id: reminder.id,
                  dueDate: reminder.dueDate,
                  dueTime: e.target.value ? `${e.target.value}:00` : null,
                })
              }
              className="w-full text-sm px-2 py-1 rounded outline-none"
              style={{ backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-primary)', border: '1px solid var(--separator)' }}
            />
          )}
        </>
      )}
      <hr style={{ borderColor: 'var(--separator)' }} />

      {/* 플래그 */}
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>플래그</span>
        <Toggle checked={reminder.flagged} onChange={() => toggleFlag.mutate(reminder.id)} color="#ff9500" />
      </div>

      {/* 우선순위 */}
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>우선순위</span>
        <select
          value={reminder.priority}
          onChange={(e) =>
            updateReminder.mutate({ id: reminder.id, priority: e.target.value as Priority })
          }
          className="text-sm px-2 py-1 rounded outline-none"
          style={{ backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-primary)', border: '1px solid var(--separator)' }}
        >
          {PRIORITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* 목록 이동 */}
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>목록</span>
        <select
          value={reminder.listId}
          onChange={(e) =>
            moveReminder.mutate({ id: reminder.id, listId: Number(e.target.value) })
          }
          className="text-sm px-2 py-1 rounded outline-none max-w-[130px]"
          style={{ backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-primary)', border: '1px solid var(--separator)' }}
        >
          {lists.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <hr style={{ borderColor: 'var(--separator)' }} />

      {/* 하위 태스크 */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
          하위 태스크
        </p>
        <ul className="space-y-0.5 -ml-2">
          {reminder.subTasks.map((st) => (
            <SubTaskRow key={st.id} subTask={st} color={color} />
          ))}
        </ul>
        <input
          type="text"
          value={subTaskInput}
          onChange={(e) => setSubTaskInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && subTaskInput.trim()) {
              createSubTask.mutate(
                { reminderId: reminder.id, title: subTaskInput.trim() },
                { onSuccess: () => setSubTaskInput('') }
              );
            }
          }}
          placeholder="하위 태스크 추가..."
          className="w-full text-sm outline-none bg-transparent mt-2 pl-6"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>
    </div>
  );
}

export default function DetailPanel() {
  const { detailReminderId, detailReminderListId, closeDetail } = useUIStore();
  const isOpen = detailReminderId !== null && detailReminderListId !== null;

  // Escape 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDetail();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeDetail]);

  return (
    <div
      className={`
        fixed top-0 right-0 h-full w-[280px] shadow-2xl z-40
        transform transition-transform duration-[280ms] ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      style={{ backgroundColor: 'var(--bg-detail)', borderLeft: '1px solid var(--separator)' }}
    >
      {/* 닫기 버튼 */}
      <div className="flex justify-end px-4 pt-4">
        <button
          type="button"
          onClick={closeDetail}
          className="text-sm p-1 rounded hover:bg-black/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          ✕
        </button>
      </div>

      {isOpen && (
        <DetailPanelInner
          reminderId={detailReminderId!}
          listId={detailReminderListId!}
        />
      )}
    </div>
  );
}
