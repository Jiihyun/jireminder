import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Priority, Reminder, ReminderGroup } from '@/types';

function remindersKey(params: Record<string, string | number | undefined>) {
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
    queryKey: remindersKey(params as Record<string, string | number | undefined>),
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
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ['reminders'] });
      const snapshots = qc.getQueriesData<ReminderGroup>({ queryKey: ['reminders'] });

      // 임시 항목 즉시 추가
      const tempId = -Date.now();
      const tempReminder: Reminder = {
        id: tempId,
        listId: payload.listId,
        title: payload.title,
        memo: payload.memo ?? null,
        completed: false,
        completedAt: null,
        flagged: false,
        priority: 'NONE',
        dueDate: null,
        dueTime: null,
        createdAt: new Date().toISOString(),
        subTasks: [],
      };

      qc.setQueriesData<ReminderGroup>(
        { queryKey: ['reminders', { listId }] },
        (old) => old ? { ...old, incomplete: [...old.incomplete, tempReminder] } : old
      );

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
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
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['reminders'] });
      const snapshots = qc.getQueriesData<ReminderGroup>({ queryKey: ['reminders'] });

      qc.setQueriesData<ReminderGroup>({ queryKey: ['reminders'] }, (old) => {
        if (!old) return old;
        const now = new Date().toISOString();
        const toggle = (r: Reminder): Reminder =>
          r.id === id
            ? { ...r, completed: !r.completed, completedAt: !r.completed ? now : null }
            : r;
        const all = [...old.incomplete, ...old.completed].map(toggle);
        return {
          incomplete: all.filter((r) => !r.completed),
          completed: all.filter((r) => r.completed),
        };
      });

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
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
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['reminders'] });
      const snapshots = qc.getQueriesData<ReminderGroup>({ queryKey: ['reminders'] });

      qc.setQueriesData<ReminderGroup>({ queryKey: ['reminders'] }, (old) => {
        if (!old) return old;
        const toggle = (r: Reminder): Reminder =>
          r.id === id ? { ...r, flagged: !r.flagged } : r;
        return {
          incomplete: old.incomplete.map(toggle),
          completed: old.completed.map(toggle),
        };
      });

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
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
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['reminders'] });
      const snapshots = qc.getQueriesData<ReminderGroup>({ queryKey: ['reminders'] });

      qc.setQueriesData<ReminderGroup>({ queryKey: ['reminders'] }, (old) => {
        if (!old) return old;
        return {
          incomplete: old.incomplete.filter((r) => r.id !== id),
          completed: old.completed.filter((r) => r.id !== id),
        };
      });

      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
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
