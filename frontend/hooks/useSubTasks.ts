import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { SubTask } from '@/types';

export function useCreateSubTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reminderId, title }: { reminderId: number; title: string }) =>
      apiFetch<SubTask>(`/api/reminders/${reminderId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}

export function useUpdateSubTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      apiFetch<SubTask>(`/api/subtasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}

export function useToggleSubTaskComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<SubTask>(`/api/subtasks/${id}/complete`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}

export function useDeleteSubTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/subtasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}
