import React, { useState, useEffect } from "react";
import { Task, TaskList, SubTask } from "../types";
import { X, Star, Trash2, Calendar, CornerDownRight, FileText, List, Plus, Check } from "lucide-react";

interface DetailPanelProps {
  task: Task | null;
  lists: TaskList[];
  onClose: () => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (updatedTask: Task) => void;
}

export function DetailPanel({
  task,
  lists,
  onClose,
  onDeleteTask,
  onUpdateTask,
}: DetailPanelProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [listId, setListId] = useState("");

  // Sync state with selected task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || "");
      setDueDate(task.dueDate || "");
      setRecurrence(task.recurrence || "");
      setListId(task.listId);
    }
  }, [task?.id]);

  if (!task) {
    return (
      <aside className="w-[360px] bg-brand-surface-low border-l border-brand-outline flex flex-col justify-center items-center text-center p-6 text-brand-text-dim">
        <List className="w-10 h-10 mb-2 opacity-40 text-brand-primary" />
        <p className="text-sm">Select a task to view or edit details</p>
      </aside>
    );
  }

  // Trigger update helper
  const triggerUpdate = (fields: Partial<Task>) => {
    onUpdateTask({
      ...task,
      ...fields,
    });
  };

  const handleTitleBlur = () => {
    if (title.trim() !== task.title) {
      triggerUpdate({ title: title.trim() });
    }
  };

  const handleNotesBlur = () => {
    if (notes !== task.notes) {
      triggerUpdate({ notes: notes });
    }
  };

  const handleDueDateBlur = () => {
    if (dueDate !== task.dueDate) {
      triggerUpdate({ dueDate: dueDate });
    }
  };

  const handleRecurrenceBlur = () => {
    if (recurrence !== task.recurrence) {
      triggerUpdate({ recurrence: recurrence });
    }
  };

  const handleListChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    setListId(targetId);
    triggerUpdate({ listId: targetId });
  };

  const toggleStar = () => {
    triggerUpdate({ isStarred: !task.isStarred });
  };

  // Subtask actions
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      const newSubtask: SubTask = {
        id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskTitle.trim(),
        isCompleted: false,
      };
      triggerUpdate({
        subtasks: [...task.subtasks, newSubtask],
      });
      setNewSubtaskTitle("");
    }
  };

  const handleToggleSubtask = (subId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    triggerUpdate({ subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subId: string) => {
    const remaining = task.subtasks.filter((st) => st.id !== subId);
    triggerUpdate({ subtasks: remaining });
  };

  return (
    <aside className="h-full w-[360px] bg-brand-surface-low border-l border-brand-outline shadow-2xl flex flex-col justify-between">
      <div className="h-full flex flex-col overflow-hidden">
        {/* Top bar toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-brand-outline select-none">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brand-surface-high text-brand-text-muted hover:text-brand-text transition-colors cursor-pointer"
            title="Close pane"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex gap-1">
            <button
              onClick={toggleStar}
              className={`p-2 rounded-full hover:bg-brand-surface-high transition-colors cursor-pointer ${
                task.isStarred ? "text-brand-tertiary" : "text-brand-text-dim hover:text-brand-tertiary"
              }`}
              title={task.isStarred ? "Unstar task" : "Star task"}
            >
              <Star className={`w-5 h-5 ${task.isStarred ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-2 rounded-full hover:bg-brand-surface-high text-brand-text-dim hover:text-red-400 transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable details container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Editable Title */}
          <div>
            <textarea
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-headline-md text-xl font-semibold text-brand-text placeholder:text-brand-text-dim resize-none leading-tight focus:outline-none"
              rows={2}
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
            />
          </div>

          <div className="space-y-4">
            {/* Date & Time Row */}
            <div className="flex items-start gap-4 p-3 hover:bg-brand-surface-high rounded-xl transition-all border border-transparent hover:border-brand-outline">
              <Calendar className="w-5 h-5 text-brand-text-dim mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Set date (e.g. Today, 4:00 PM)"
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-brand-text placeholder:text-brand-text-dim focus:outline-none"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={handleDueDateBlur}
                />
                <input
                  type="text"
                  placeholder="Set repeat behavior (e.g. Repeats monthly)"
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs text-brand-text-dim placeholder:text-brand-text-dim mt-1 focus:outline-none"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  onBlur={handleRecurrenceBlur}
                />
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 px-3 py-1">
                <CornerDownRight className="w-5 h-5 text-brand-text-dim shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-text-dim">Subtasks</span>
              </div>

              {/* Subtask additions */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 items-center px-3">
                <input
                  type="text"
                  placeholder="Add subtasks"
                  className="flex-1 bg-brand-surface-highest/50 border border-brand-outline rounded-lg px-3 py-1.5 text-sm text-brand-text placeholder:text-brand-text-dim focus:outline-none focus:border-brand-primary"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-brand-secondary-container/30 text-brand-on-secondary-container hover:bg-brand-secondary-container/60 transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Subtask list */}
              {task.subtasks.length > 0 && (
                <div className="space-y-1 mt-2 pl-3">
                  {task.subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="group/sub flex items-center justify-between gap-2 p-2 hover:bg-brand-surface-high/50 rounded-lg text-sm"
                    >
                      <button
                        onClick={() => handleToggleSubtask(st.id)}
                        className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                          st.isCompleted
                            ? "bg-brand-primary/20 border-brand-primary text-brand-primary"
                            : "border-brand-outline hover:border-brand-primary text-transparent hover:text-brand-primary/60"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <span
                        className={`flex-1 truncate ${
                          st.isCompleted ? "line-through text-brand-text-dim" : "text-brand-text"
                        }`}
                      >
                        {st.title}
                      </span>
                      <button
                        onClick={() => handleDeleteSubtask(st.id)}
                        className="opacity-0 group-hover/sub:opacity-100 text-brand-text-dim hover:text-red-400 p-1 rounded transition-opacity cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="flex items-start gap-4 p-3 hover:bg-brand-surface-high rounded-xl transition-all border border-transparent hover:border-brand-outline">
              <FileText className="w-5 h-5 text-brand-text-dim mt-0.5 shrink-0" />
              <textarea
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-brand-text placeholder:text-brand-text-dim min-h-[100px] resize-none focus:outline-none"
                placeholder="Add notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
              />
            </div>
          </div>

          {/* List category membership */}
          <div className="pt-6 border-t border-brand-outline select-none">
            <div className="flex items-center gap-4 px-3 text-brand-text-muted">
              <List className="w-5 h-5 text-brand-text-dim shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-brand-text-dim block mb-1">List Designation</span>
                <select
                  value={listId}
                  onChange={handleListChange}
                  className="w-full bg-brand-surface border border-brand-outline rounded-lg px-2.5 py-1.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer font-medium"
                >
                  {lists.map((lst) => (
                    <option key={lst.id} value={lst.id}>
                      {lst.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info displaying creation date */}
        <div className="p-4 text-center border-t border-brand-outline select-none">
          <p className="text-xs text-brand-text-dim opacity-70">
            Created {task.createdDate || "Oct 24, 10:14 AM"}
          </p>
        </div>
      </div>
    </aside>
  );
}
