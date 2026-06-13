import { create } from 'zustand';

interface UIState {
  selectedListId: string | null;
  detailReminderId: number | null;
  detailReminderListId: number | null;
  searchQuery: string;
  sidebarOpen: boolean; // 모바일 드로어
  setSelectedList: (id: string | null) => void;
  openDetail: (reminderId: number, listId: number) => void;
  closeDetail: () => void;
  setSearchQuery: (q: string) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedListId: null,
  detailReminderId: null,
  detailReminderListId: null,
  searchQuery: '',
  sidebarOpen: false,
  setSelectedList: (id) => set({ selectedListId: id }),
  openDetail: (reminderId, listId) =>
    set({ detailReminderId: reminderId, detailReminderListId: listId }),
  closeDetail: () => set({ detailReminderId: null, detailReminderListId: null }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
