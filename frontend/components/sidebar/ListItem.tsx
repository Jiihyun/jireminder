'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { COLOR_HEX } from '@/components/ui/ColorPicker';
import type { ReminderList } from '@/types';

interface ContextMenu {
  x: number;
  y: number;
}

interface ListItemProps {
  list: ReminderList;
  incompleteCount?: number;
  onRename: (list: ReminderList) => void;
  onDelete: (id: number) => void;
}

export default function ListItem({
  list,
  incompleteCount = 0,
  onRename,
  onDelete,
}: ListItemProps) {
  const pathname = usePathname();
  const isSelected = pathname === `/list/${list.id}`;
  const [menu, setMenu] = useState<ContextMenu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const color = COLOR_HEX[list.color] ?? '#007aff';

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!menu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <li className="relative">
      <Link
        href={`/list/${list.id}`}
        onContextMenu={handleContextMenu}
        className={`
          flex items-center gap-2.5 px-2 py-1.5 rounded-lg
          transition-colors duration-100
          ${isSelected ? 'bg-black/10' : 'hover:bg-black/5'}
        `}
      >
        {/* 색상 원 */}
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {list.icon ?? '📋'}
        </span>

        {/* 목록명 */}
        <span
          className="flex-1 text-sm font-medium truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {list.name}
        </span>

        {/* 미완료 개수 뱃지 */}
        {incompleteCount > 0 && (
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: 'var(--text-secondary)' }}
          >
            {incompleteCount}
          </span>
        )}
      </Link>

      {/* 컨텍스트 메뉴 */}
      {menu && (
        <div
          ref={menuRef}
          className="fixed z-50 rounded-xl shadow-2xl py-1 min-w-[140px]"
          style={{
            left: menu.x,
            top: menu.y,
            backgroundColor: 'var(--bg-detail)',
            border: '1px solid var(--separator)',
          }}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 rounded"
            onClick={() => { setMenu(null); onRename(list); }}
            style={{ color: 'var(--text-primary)' }}
          >
            이름 변경
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 rounded text-red-500"
            onClick={() => { setMenu(null); onDelete(list.id); }}
          >
            삭제
          </button>
        </div>
      )}
    </li>
  );
}
