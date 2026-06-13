'use client';

import { useState } from 'react';
import CircleButton from '@/components/ui/CircleButton';
import { useToggleSubTaskComplete, useDeleteSubTask } from '@/hooks/useSubTasks';
import type { SubTask } from '@/types';

interface SubTaskRowProps {
  subTask: SubTask;
  color: string;
}

export default function SubTaskRow({ subTask, color }: SubTaskRowProps) {
  const [hovered, setHovered] = useState(false);
  const toggleComplete = useToggleSubTaskComplete();
  const deleteSubTask = useDeleteSubTask();

  return (
    <li
      className="flex items-center gap-2 pl-8 pr-3 py-1 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CircleButton
        checked={subTask.completed}
        color={color}
        size={18}
        onClick={() => toggleComplete.mutate(subTask.id)}
      />
      <span
        className={`flex-1 text-sm ${subTask.completed ? 'line-through' : ''}`}
        style={{ color: subTask.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}
      >
        {subTask.title}
      </span>
      {hovered && (
        <button
          type="button"
          onClick={() => deleteSubTask.mutate(subTask.id)}
          className="text-xs opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--due-overdue)' }}
        >
          ✕
        </button>
      )}
    </li>
  );
}
