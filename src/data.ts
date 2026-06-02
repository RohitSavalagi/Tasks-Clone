import { Task, TaskList } from "./types";

export const INITIAL_LISTS: TaskList[] = [
  { id: "my-tasks", name: "My Tasks", icon: "List", isSystem: true },
  { id: "work", name: "Work", icon: "Briefcase", isSystem: true },
  { id: "personal", name: "Personal", icon: "User", isSystem: true },
  { id: "groceries", name: "Groceries", icon: "ShoppingBag", isSystem: true }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Finalize project proposal for the board",
    notes: "Review slides with marketing team and consolidate financial sheets.",
    isCompleted: false,
    isStarred: false,
    dueDate: "Today, 4:00 PM",
    recurrence: "Repeats monthly",
    listId: "my-tasks",
    subtasks: [
      { id: "sub-1", title: "Finalize budget slides", isCompleted: true },
      { id: "sub-2", title: "Proofread timeline details", isCompleted: false },
      { id: "sub-3", title: "Send preview to team", isCompleted: false }
    ],
    createdDate: "Oct 24, 10:14 AM"
  },
  {
    id: "task-2",
    title: "Schedule dentist appointment",
    notes: "Routine cleaning and checkup.",
    isCompleted: false,
    isStarred: true,
    dueDate: "Tomorrow",
    listId: "my-tasks",
    subtasks: [],
    createdDate: "Oct 24, 09:30 AM"
  },
  {
    id: "task-3",
    title: "Research new productivity tools",
    notes: "Identify gaps in current team velocity.",
    isCompleted: false,
    isStarred: false,
    dueDate: "Next week",
    listId: "my-tasks",
    subtasks: [
      { id: "sub-4", title: "Read tech reports on Notion and Linear", isCompleted: true },
      { id: "sub-5", title: "Setup 14-day trial account", isCompleted: false }
    ],
    createdDate: "Oct 23, 02:15 PM"
  },
  {
    id: "task-4",
    title: "Draft weekly marketing email draft",
    notes: "Focus on the upcoming spring line and member discounts.",
    isCompleted: false,
    isStarred: true,
    dueDate: "Tomorrow, 9:00 AM",
    listId: "work",
    subtasks: [],
    createdDate: "Oct 22, 11:00 AM"
  },
  {
    id: "task-5",
    title: "Review Q1 roadmap updates",
    notes: "Make sure engineering estimates match timeline.",
    isCompleted: false,
    isStarred: false,
    listId: "work",
    subtasks: [],
    createdDate: "Oct 21, 01:20 PM"
  },
  {
    id: "task-6",
    title: "Buy organic avocados and milk",
    notes: "Get the 2% fat milk and 3 avocados.",
    isCompleted: false,
    isStarred: false,
    listId: "groceries",
    subtasks: [],
    createdDate: "Oct 25, 12:00 PM"
  },
  // Seed Completed tasks
  {
    id: "task-comp-1",
    title: "Submit reimbursement report",
    notes: "October travel expenses.",
    isCompleted: true,
    isStarred: false,
    listId: "my-tasks",
    subtasks: [],
    createdDate: "Oct 20, 04:00 PM"
  },
  {
    id: "task-comp-2",
    title: "Update team sprint calendar",
    notes: "",
    isCompleted: true,
    isStarred: true,
    listId: "my-tasks",
    subtasks: [],
    createdDate: "Oct 19, 10:00 AM"
  },
  {
    id: "task-comp-3",
    title: "Water the indoor bonsai tree",
    notes: "Requires filtered water.",
    isCompleted: true,
    isStarred: false,
    listId: "personal",
    subtasks: [],
    createdDate: "Oct 18, 08:30 AM"
  },
  {
    id: "task-comp-4",
    title: "Set up birthday dinner reservations",
    notes: "Table for 6.",
    isCompleted: true,
    isStarred: false,
    listId: "personal",
    subtasks: [],
    createdDate: "Oct 17, 07:15 PM"
  }
];
