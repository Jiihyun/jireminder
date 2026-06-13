export type ListColor =
  | 'RED'
  | 'ORANGE'
  | 'YELLOW'
  | 'GREEN'
  | 'TEAL'
  | 'BLUE'
  | 'INDIGO'
  | 'PURPLE'
  | 'PINK'
  | 'BROWN';

export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export type SmartListId = 'today' | 'scheduled' | 'all' | 'flagged' | 'completed';

export interface ReminderList {
  id: number;
  name: string;
  color: ListColor;
  icon: string | null;
  createdAt: string;
}

export interface SubTask {
  id: number;
  reminderId: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Reminder {
  id: number;
  listId: number;
  title: string;
  memo: string | null;
  completed: boolean;
  completedAt: string | null;
  flagged: boolean;
  priority: Priority;
  dueDate: string | null;
  dueTime: string | null;
  createdAt: string;
  subTasks: SubTask[];
}

export interface ReminderGroup {
  incomplete: Reminder[];
  completed: Reminder[];
}

export interface SmartCounts {
  today: number;
  scheduled: number;
  all: number;
  flagged: number;
  completed: number;
}
