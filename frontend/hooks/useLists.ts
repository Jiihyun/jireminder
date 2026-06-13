import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { ListColor, ReminderList } from '@/types';

const LISTS_KEY = ['lists'] as const;

export function useLists() {
  return useQuery({
    queryKey: LISTS_KEY,
    queryFn: () => apiFetch<ReminderList[]>('/api/lists'),
  });
}

interface CreateListPayload {
  name: string;
  color: ListColor;
  icon?: string | null;
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateListPayload) =>
      apiFetch<ReminderList>('/api/lists', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LISTS_KEY }),
  });
}

interface UpdateListPayload {
  id: number;
  name?: string;
  color?: ListColor;
  icon?: string | null;
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateListPayload) =>
      apiFetch<ReminderList>(`/api/lists/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LISTS_KEY }),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/lists/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LISTS_KEY }),
  });
}
