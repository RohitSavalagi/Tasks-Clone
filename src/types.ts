export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  isCompleted: boolean;
  isStarred: boolean;
  dueDate?: string; // Descriptive date or date-time string
  dueDateObj?: string; // ISO date string if set
  recurrence?: string; // e.g. "Repeats monthly"
  listId: string; // The list it belongs to
  subtasks: SubTask[];
  createdDate: string; // e.g. "Oct 24, 10:14 AM"
}

export interface TaskList {
  id: string;
  name: string;
  icon?: string; // Type corresponding to icons
  isSystem?: boolean; // Starter lists
}
