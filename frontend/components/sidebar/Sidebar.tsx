'use client';

import { useState } from 'react';
import SmartListCard from './SmartListCard';
import ListItem from './ListItem';
import AddListModal from './AddListModal';
import { useLists, useCreateList, useUpdateList, useDeleteList } from '@/hooks/useLists';
import { useSmartCounts } from '@/hooks/useSmartCounts';
import type { ListColor, ReminderList } from '@/types';

export default function Sidebar() {
  const { data: lists = [] } = useLists();
  const { data: counts } = useSmartCounts();
  const createList = useCreateList();
  const updateList = useUpdateList();
  const deleteList = useDeleteList();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ReminderList | null>(null);

  const handleConfirm = (name: string, color: ListColor, icon: string) => {
    if (editTarget) {
      updateList.mutate({ id: editTarget.id, name, color, icon });
    } else {
      createList.mutate({ name, color, icon });
    }
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleRename = (list: ReminderList) => {
    setEditTarget(list);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteList.mutate(id);
  };

  return (
    <>
      <aside
        className="flex flex-col h-full px-3 py-4 overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        {/* 스마트 목록 카드 2×2 그리드 */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <SmartListCard
            id="today"
            label="오늘"
            icon="📅"
            count={counts?.today ?? 0}
            color="#007aff"
          />
          <SmartListCard
            id="scheduled"
            label="예정"
            icon="📆"
            count={counts?.scheduled ?? 0}
            color="#ff3b30"
          />
          <SmartListCard
            id="all"
            label="전체"
            icon="📋"
            count={counts?.all ?? 0}
            color="#1c1c1e"
          />
          <SmartListCard
            id="flagged"
            label="플래그됨"
            icon="🚩"
            count={counts?.flagged ?? 0}
            color="#ff9500"
          />
        </div>

        {/* 완료됨 — 전체 너비 */}
        <div className="mb-6">
          <SmartListCard
            id="completed"
            label="완료됨"
            icon="✅"
            count={counts?.completed ?? 0}
            color="#8e8e93"
            fullWidth
          />
        </div>

        {/* 나의 목록 */}
        <div className="flex-1">
          <h3
            className="text-xs font-semibold uppercase tracking-wide px-1 mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            나의 목록
          </h3>
          <ul className="space-y-0.5">
            {lists.map((list) => (
              <ListItem
                key={list.id}
                list={list}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </div>

        {/* 목록 추가 버튼 */}
        <button
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm mt-2
            hover:bg-black/5 transition-colors duration-100"
          style={{ color: '#007aff' }}
        >
          <span className="text-lg leading-none font-light">+</span>
          <span>목록 추가</span>
        </button>
      </aside>

      {/* 목록 추가/수정 모달 */}
      <AddListModal
        open={modalOpen}
        initialData={editTarget}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onConfirm={handleConfirm}
      />
    </>
  );
}
