import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { SmartCounts } from '@/types';

export function useSmartCounts() {
  return useQuery({
    queryKey: ['smartCounts'],
    queryFn: () => apiFetch<SmartCounts>('/api/smart-counts'),
    refetchInterval: 10_000, // 10초마다 갱신
  });
}
