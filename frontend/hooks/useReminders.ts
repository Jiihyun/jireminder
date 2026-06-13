import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Priority, Reminder, ReminderGroup } from '@/types';

function remindersKey(params: Record<string, string | number>) {
  return ['reminders', params] as const;
}

interface FetchParams {
  listId?: number | string;
  smart?: string;
  q?: string;
}

export function useReminders(params: FetchParams) {
  const search = new URLSearchParams();
  if (params.listId) search.set('listId', String(params.listId));
  if (params.smart) search.set('smart', params.smart);
  if (params.q) search.set('q', params.q);

  return useQuery({
    queryKey: remindersKey(params as Record<string, string | number>),
    queryFn: () => apiFetch<ReminderGroup>(`/api/reminders?${search}`),
    enabled: !!(params.listId || params.smart || params.q),
  });
}

interface CreatePayload {
  listId: number;
  title: string;
  memo?: string;
}

export function useCreateReminder(listId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayload) =>
      apiFetch<Reminder>('/api/reminders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['smartCounts'] });
    },
  });
}

interface UpdatePayload {
  id: number;
  title?: string;
  memo?: string;
  priority?: Priority;
  dueDate?: string | null;
  dueTime?: string | null;
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdatePayload) =>
      apiFetch<Reminder>(`/api/reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}

export function useToggleComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<Reminder>(`/api/reminders/${id}/complete`, { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['smartCounts'] });
    },
  });
}

export function useToggleFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<Reminder>(`/api/reminders/${id}/flag`, { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['smartCounts'] });
    },
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/reminders/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['smartCounts'] });
    },
  });
}

export function useMoveReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, listId }: { id: number; listId: number }) =>
      apiFetch<Reminder>(`/api/reminders/${id}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ listId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}
