import React from "react";
import { Task } from "../types";
import { GripVertical, Star, Calendar, CornerDownRight, Check, FileText } from "lucide-react";

interface TaskRowProps {
  key?: string;
  task: Task;
  isActive: boolean;
  onClick: () => void;
  onToggleComplete: (taskId: string, e: React.MouseEvent) => void;
  onToggleStarred: (taskId: string, e: React.MouseEvent) => void;
}

export function TaskRow({
  task,
  isActive,
  onClick,
  onToggleComplete,
  onToggleStarred,
}: TaskRowProps) {
  // Check if task is overdue/urgent (e.g., contains 'Today' or 'Tomorrow')
  const isUrgentDate = (dateStr?: string) => {
    if (!dateStr) return false;
    const lower = dateStr.toLowerCase();
    return lower.includes("today") || lower.includes("now") || lower.includes("1:") || lower.includes("2:") || lower.includes("3:") || lower.includes("4:");
  };

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;

  return (
    <div
      onClick={onClick}
      className={`group/row flex items-center gap-3 p-3 hover:bg-brand-surface-high transition-all duration-200 cursor-pointer rounded-xl select-none ${
        isActive
          ? "bg-brand-surface-high border-l-4 border-brand-primary shadow-sm"
          : "border-l-4 border-transparent"
      } ${task.isCompleted ? "opacity-60" : ""}`}
    >
      {/* Drag Indicator - Visible on row hover */}
      <div className="w-5 flex items-center justify-center text-brand-outline opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Checkbox button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id, e);
        }}
        className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
          task.isCompleted
            ? "border-brand-primary bg-brand-primary-container/20 text-brand-primary"
            : "border-brand-outline hover:border-brand-primary text-transparent hover:text-brand-primary/80"
        }`}
      >
        <Check className={`w-3.5 h-3.5 transition-transform ${task.isCompleted ? "scale-100" : "scale-50 hover:scale-100"}`} />
      </button>

      {/* Title & badges */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span
          className={`text-sm font-medium transition-all truncate text-brand-text ${
            task.isCompleted ? "line-through text-brand-text-dim decoration-brand-text-dim" : ""
          }`}
        >
          {task.title || <span className="italic text-brand-text-dim">Untitled Task</span>}
        </span>

        {/* Badges/Context */}
        {(task.dueDate || totalSubtasks > 0 || task.notes) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            {/* Due date badge */}
            {task.dueDate && (
              <span
                className={`text-xs flex items-center gap-1 font-mono ${
                  isUrgentDate(task.dueDate) && !task.isCompleted
                    ? "text-brand-error"
                    : "text-brand-text-muted bg-brand-surface px-1.5 py-0.5 rounded-full"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{task.dueDate}</span>
              </span>
            )}

            {/* Subtask tally */}
            {totalSubtasks > 0 && (
              <span className="text-xs text-brand-text-muted flex items-center gap-1">
                <CornerDownRight className="w-3.5 h-3.5 text-brand-text-dim" />
                <span>
                  {task.isCompleted
                    ? `${totalSubtasks} subtasks`
                    : `${completedSubtasks}/${totalSubtasks} completed`}
                </span>
              </span>
            )}

            {/* Notes Indicator */}
            {task.notes && (
              <span className="text-xs text-brand-text-dim flex items-center gap-1 title={task.notes}">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{task.notes}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Star button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStarred(task.id, e);
        }}
        className={`p-1.5 rounded-full hover:bg-brand-surface-highest transition-colors cursor-pointer ${
          task.isStarred
            ? "text-brand-tertiary"
            : "text-brand-text-dim hover:text-brand-tertiary"
        }`}
      >
        <Star className={`w-4 h-4 ${task.isStarred ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
