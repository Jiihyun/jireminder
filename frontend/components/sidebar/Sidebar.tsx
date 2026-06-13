'use client';

import SmartListCard from './SmartListCard';

// Phase 5: 더미 데이터 사용 (Phase 6에서 API 연동)
const DUMMY_SMART_COUNTS = {
  today: 0,
  scheduled: 0,
  all: 0,
  flagged: 0,
  completed: 0,
};

const DUMMY_LISTS = [
  { id: 1, name: '개인', color: '#007aff', icon: '🏠' },
  { id: 2, name: '업무', color: '#ff3b30', icon: '💼' },
];

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col h-full px-3 py-4 overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-sidebar)' }}
    >
      {/* 스마트 목록 카드 그리드 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <SmartListCard
          id="today"
          label="오늘"
          icon="📅"
          count={DUMMY_SMART_COUNTS.today}
          color="#007aff"
        />
        <SmartListCard
          id="scheduled"
          label="예정"
          icon="📆"
          count={DUMMY_SMART_COUNTS.scheduled}
          color="#ff3b30"
        />
        <SmartListCard
          id="all"
          label="전체"
          icon="📋"
          count={DUMMY_SMART_COUNTS.all}
          color="#1c1c1e"
        />
        <SmartListCard
          id="flagged"
          label="플래그됨"
          icon="🚩"
          count={DUMMY_SMART_COUNTS.flagged}
          color="#ff9500"
        />
      </div>

      {/* 완료됨 — 전체 너비 */}
      <div className="mb-6">
        <SmartListCard
          id="completed"
          label="완료됨"
          icon="✅"
          count={DUMMY_SMART_COUNTS.completed}
          color="#8e8e93"
          fullWidth
        />
      </div>

      {/* 나의 목록 */}
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-wide px-1 mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          나의 목록
        </h3>
        <ul className="space-y-0.5">
          {DUMMY_LISTS.map((list) => (
            <li key={list.id}>
              <button
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left
                  hover:bg-black/5 transition-colors duration-100"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: list.color }}
                >
                  {list.icon}
                </span>
                <span
                  className="flex-1 text-sm font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {list.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 목록 추가 버튼 */}
      <div className="mt-4">
        <button
          disabled
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm
            opacity-50 cursor-not-allowed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="text-lg leading-none">+</span>
          <span>목록 추가</span>
        </button>
      </div>
    </aside>
  );
}
