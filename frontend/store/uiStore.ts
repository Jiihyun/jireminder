import { create } from 'zustand';

interface UIState {
  selectedListId: string | null;
  detailReminderId: number | null;
  detailReminderListId: number | null;
  setSelectedList: (id: string | null) => void;
  openDetail: (reminderId: number, listId: number) => void;
  closeDetail: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedListId: null,
  detailReminderId: null,
  detailReminderListId: null,
  setSelectedList: (id) => set({ selectedListId: id }),
  openDetail: (reminderId, listId) =>
    set({ detailReminderId: reminderId, detailReminderListId: listId }),
  closeDetail: () => set({ detailReminderId: null, detailReminderListId: null }),
}));
