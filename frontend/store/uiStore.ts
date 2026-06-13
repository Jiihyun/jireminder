import { create } from 'zustand';

interface UIState {
  selectedListId: string | null;
  detailReminderId: number | null;
  setSelectedList: (id: string | null) => void;
  openDetail: (reminderId: number) => void;
  closeDetail: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedListId: null,
  detailReminderId: null,
  setSelectedList: (id) => set({ selectedListId: id }),
  openDetail: (reminderId) => set({ detailReminderId: reminderId }),
  closeDetail: () => set({ detailReminderId: null }),
}));
