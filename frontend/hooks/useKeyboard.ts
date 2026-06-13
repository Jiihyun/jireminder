'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export function useKeyboard() {
  const { detailReminderId, closeDetail } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + F → 검색창 포커스
      if (modKey && e.key === 'f') {
        e.preventDefault();
        const ref = (window as { __searchInputRef?: { current: HTMLInputElement | null } }).__searchInputRef;
        ref?.current?.focus();
        ref?.current?.select();
        return;
      }

      // Cmd/Ctrl + I → 상세 패널 토글
      if (modKey && e.key === 'i') {
        e.preventDefault();
        if (detailReminderId !== null) {
          closeDetail();
        }
        return;
      }

      // Escape → 상세 패널 닫기
      if (e.key === 'Escape' && detailReminderId !== null) {
        // DetailPanel 내부에서도 처리하지만 여기서도 처리
        closeDetail();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [detailReminderId, closeDetail]);
}
