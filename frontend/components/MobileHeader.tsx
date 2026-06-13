'use client';

import { useUIStore } from '@/store/uiStore';
import Sidebar from '@/components/sidebar/Sidebar';

export default function MobileHeader() {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();

  return (
    <>
      {/* 모바일 상단 헤더 (md 이상에서 숨김) */}
      <header
        className="md:hidden flex items-center px-4 h-12 border-b flex-shrink-0"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--separator)',
        }}
      >
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-black/5 transition-colors"
          aria-label="메뉴 열기"
          style={{ color: 'var(--text-primary)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="4" width="16" height="1.5" rx="1" />
            <rect x="2" y="9.25" width="16" height="1.5" rx="1" />
            <rect x="2" y="14.5" width="16" height="1.5" rx="1" />
          </svg>
        </button>
        <h1 className="ml-3 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          JihyunReminder
        </h1>
      </header>

      {/* 모바일 드로어 오버레이 */}
      {sidebarOpen && (
        <>
          {/* 백드롭 */}
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/30"
            onClick={closeSidebar}
          />
          {/* 드로어 패널 */}
          <div
            className="md:hidden fixed top-0 left-0 h-full w-[280px] z-40 shadow-2xl"
            style={{ borderRight: '1px solid var(--separator)' }}
          >
            <Sidebar />
          </div>
        </>
      )}
    </>
  );
}
