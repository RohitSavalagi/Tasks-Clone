import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { TaskRow } from "./components/TaskRow";
import { DetailPanel } from "./components/DetailPanel";
import { INITIAL_LISTS, INITIAL_TASKS } from "./data";
import { Task, TaskList, SubTask } from "./types";
import { Plus, Check, ChevronDown, ChevronRight, CheckCircle2, Sliders, Info, Trash2, Library, Star, AlertCircle, Sparkles, X } from "lucide-react";

export default function App() {
  // --- Core Application States ---
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeListId, setActiveListId] = useState<string>("my-tasks");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // --- UI Layout & Modal States ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // --- Task Input States ---
  const [newInlineTaskTitle, setNewInlineTaskTitle] = useState("");

  // --- Load seed data or localStorage ---
  useEffect(() => {
    const savedLists = localStorage.getItem("g_tasks_lists");
    const savedTasks = localStorage.getItem("g_tasks_tasks");

    if (savedLists) {
      setLists(JSON.parse(savedLists));
    } else {
      setLists(INITIAL_LISTS);
      localStorage.setItem("g_tasks_lists", JSON.stringify(INITIAL_LISTS));
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem("g_tasks_tasks", JSON.stringify(INITIAL_TASKS));
    }
  }, []);

  // --- Synced updates to localStorage ---
  const saveListsToStorage = (updatedLists: TaskList[]) => {
    setLists(updatedLists);
    localStorage.setItem("g_tasks_lists", JSON.stringify(updatedLists));
  };

  const saveTasksToStorage = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("g_tasks_tasks", JSON.stringify(updatedTasks));
  };

  // --- Helpers & Computed Stats ---
  const activeTaskList = useMemo(() => {
    return lists.find((l) => l.id === activeListId);
  }, [lists, activeListId]);

  const starredTasksCount = useMemo(() => {
    return tasks.filter((t) => t.isStarred && !t.isCompleted).length;
  }, [tasks]);

  // Selected task computed
  const selectedTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // --- Custom Date Formatter ---
  const getCurrentDateFormatted = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date();
    const month = months[d.getMonth()];
    const date = d.getDate();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minStr = minutes < 10 ? "0" + minutes : minutes;
    return `${month} ${date}, ${hours}:${minStr} ${ampm}`;
  };

  // --- Creating Tasks ---
  const handleAddNewTask = (titleText: string, targetListId: string = activeListId) => {
    if (!titleText.trim()) return;

    // If active list is "starred", place a starred task into standard 'my-tasks'
    const actualListId = targetListId === "starred" ? "my-tasks" : targetListId;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: titleText.trim(),
      notes: "",
      isCompleted: false,
      isStarred: targetListId === "starred",
      subtasks: [],
      listId: actualListId,
      createdDate: getCurrentDateFormatted(),
    };

    const updatedTasks = [newTask, ...tasks];
    saveTasksToStorage(updatedTasks);
    setSelectedTaskId(newTask.id); // Open Detail Panel automatically for immediate review
  };

  const handleInlineInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInlineTaskTitle.trim()) {
      handleAddNewTask(newInlineTaskTitle);
      setNewInlineTaskTitle("");
    }
  };

  // FAB handles adding to currently focused list or 'My Tasks' as fallback
  const handleFabClick = () => {
    const listForNewTask = activeListId === "starred" ? "my-tasks" : activeListId;
    const placeholderTitles = [
      "Review weekly report draft",
      "Plan weekend chores",
      "Draft presentation slide structure",
      "Schedule follow-up discussion",
      "Add dairy and grains to shopping card"
    ];
    const randomTitle = placeholderTitles[Math.floor(Math.random() * placeholderTitles.length)];
    handleAddNewTask(randomTitle, listForNewTask);
  };

  // --- Mutating Tasks ---
  const handleUpdateTask = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    saveTasksToStorage(updated);
  };

  const handleToggleComplete = (taskId: string, e: React.MouseEvent) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    });
    saveTasksToStorage(updated);
  };

  const handleToggleStarred = (taskId: string, e: React.MouseEvent) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, isStarred: !t.isStarred };
      }
      return t;
    });
    saveTasksToStorage(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const remaining = tasks.filter((t) => t.id !== taskId);
    saveTasksToStorage(remaining);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  // --- Custom List management ---
  const handleCreateList = (name: string) => {
    const listId = `list-${Date.now()}`;
    const newList: TaskList = {
      id: listId,
      name,
      icon: "Library",
      isSystem: false,
    };
    saveListsToStorage([...lists, newList]);
    setActiveListId(listId);
  };

  const handleDeleteActiveCustomList = () => {
    if (activeListId === "my-tasks" || activeListId === "starred") return;

    if (confirm(`Do you want to delete the list "${activeTaskList?.name}" and all its tasks?`)) {
      // Re-route remaining tasks or purge them
      const remainingTasks = tasks.filter((t) => t.listId !== activeListId);
      const remainingLists = lists.filter((l) => l.id !== activeListId);

      saveTasksToStorage(remainingTasks);
      saveListsToStorage(remainingLists);
      setActiveListId("my-tasks");
      setSelectedTaskId(null);
    }
  };

  // --- Filtering Tasks for Display ---
  // Apply Search + Categories/Views Filter
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Search query matches title, notes, or any subtask name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.subtasks.some((sub) => sub.title.toLowerCase().includes(q))
      );
    }

    // List filtering
    if (activeListId === "starred") {
      // Showing starred tasks across all lists
      result = result.filter((t) => t.isStarred);
    } else {
      // Strict list filter
      result = result.filter((t) => t.listId === activeListId);
    }

    return result;
  }, [tasks, activeListId, searchQuery]);

  // Separate active and completed tasks
  const activeDisplayedTasks = useMemo(() => {
    return filteredTasks.filter((t) => !t.isCompleted);
  }, [filteredTasks]);

  const completedDisplayedTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.isCompleted);
  }, [filteredTasks]);

  // Clear completed tasks button
  const handleClearCompletedInCurrentList = () => {
    if (confirm("Are you sure you want to permanently clear all completed tasks in this view?")) {
      const remaining = tasks.filter(
        (t) => !(t.isCompleted && (activeListId === "starred" ? t.isStarred : t.listId === activeListId))
      );
      saveTasksToStorage(remaining);
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text font-sans h-screen flex flex-col overflow-hidden">
      
      {/* Header bar */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddTaskClick={handleFabClick}
      />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar wrapper */}
        <div
          className={`h-full shrink-0 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-[280px]" : "w-0 border-r-0"
          }`}
        >
          <Sidebar
            lists={lists}
            activeListId={activeListId}
            setActiveListId={setActiveListId}
            onCreateList={handleCreateList}
            onOpenHelp={() => setShowHelpModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            starredCount={starredTasksCount}
          />
        </div>

        {/* Main tasks container */}
        <main className="flex-1 flex flex-col bg-brand-surface-lowest overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-[820px] mx-auto pt-4 pb-20">
              
              {/* Header inside task lists */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                    {activeListId === "starred" ? (
                      <>
                        <Star className="w-6 h-6 text-brand-tertiary fill-current" />
                        <span>Starring</span>
                      </>
                    ) : (
                      <span>{activeTaskList?.name || "My Tasks"}</span>
                    )}
                  </h2>
                  {searchQuery && (
                    <p className="text-xs text-brand-text-dim mt-1">
                      Filtering by search: &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}
                </div>

                {/* List Action Buttons (for custom lists) */}
                <div className="flex items-center gap-2">
                  {completedDisplayedTasks.length > 0 && (
                    <button
                      onClick={handleClearCompletedInCurrentList}
                      className="text-xs text-brand-text-dim hover:text-brand-primary px-3 py-1.5 rounded-lg border border-brand-outline hover:border-brand-primary bg-brand-surface transition-all cursor-pointer"
                    >
                      Clear Completed ({completedDisplayedTasks.length})
                    </button>
                  )}
                  {activeListId !== "my-tasks" && activeListId !== "starred" && (
                    <button
                      onClick={handleDeleteActiveCustomList}
                      className="text-xs text-brand-text-dim hover:text-red-400 p-1.5 rounded-lg border border-brand-outline hover:border-red-400 transition-all cursor-pointer"
                      title="Delete list and tasks"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline task input box */}
              <div className="bg-brand-surface-low border border-brand-outline rounded-xl p-3 mb-6 focus-within:border-brand-primary transition-colors">
                <form onSubmit={handleInlineInputSubmit} className="flex items-center gap-3">
                  <span className="text-brand-primary">
                    <Plus className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={newInlineTaskTitle}
                    onChange={(e) => setNewInlineTaskTitle(e.target.value)}
                    placeholder="Add a task"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm md:text-base text-brand-text placeholder:text-brand-text-dim focus:outline-none"
                  />
                  {newInlineTaskTitle.trim() && (
                    <button
                      type="submit"
                      className="text-xs font-semibold bg-brand-primary text-black px-3 py-1.5 rounded-full hover:opacity-90 transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </form>
              </div>

              {/* Tasks listings active */}
              {activeDisplayedTasks.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-brand-outline rounded-2xl p-6 bg-brand-surface-low/30 select-none">
                  <CheckCircle2 className="w-12 h-12 text-brand-primary opacity-30 mx-auto mb-3" />
                  <p className="text-sm text-brand-text-dim font-medium">No active tasks in this list</p>
                  <p className="text-xs text-brand-text-dim opacity-70 mt-1">
                    Press the float + button or quick enter above to schedule chores!
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activeDisplayedTasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      isActive={selectedTaskId === t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      onToggleComplete={handleToggleComplete}
                      onToggleStarred={handleToggleStarred}
                    />
                  ))}
                </div>
              )}

              {/* Completed tasks accordion */}
              {completedDisplayedTasks.length > 0 && (
                <div className="mt-8 border-t border-brand-outline pt-6">
                  <button
                    onClick={() => setCompletedExpanded(!completedExpanded)}
                    className="flex items-center gap-2 text-brand-text-muted hover:text-brand-text transition-colors select-none text-sm font-semibold cursor-pointer mb-3"
                  >
                    {completedExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>Completed ({completedDisplayedTasks.length})</span>
                  </button>

                  {completedExpanded && (
                    <div className="space-y-1 pl-1">
                      {completedDisplayedTasks.map((t) => (
                        <TaskRow
                          key={t.id}
                          task={t}
                          isActive={selectedTaskId === t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          onToggleComplete={handleToggleComplete}
                          onToggleStarred={handleToggleStarred}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Floating Action Button (FAB) */}
          <button
            onClick={handleFabClick}
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-brand-primary-container text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-45 cursor-pointer group"
            title="Create Task"
          >
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
          </button>
        </main>

        {/* Right Detail Drawer */}
        <div
          className={`h-full transition-all duration-300 overflow-hidden shrink-0 ${
            selectedTaskId ? "w-[360px]" : "w-0 border-l-0"
          }`}
        >
          <DetailPanel
            task={selectedTask}
            lists={lists}
            onClose={() => setSelectedTaskId(null)}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        </div>

      </div>

      {/* --- Overlay Modal: Help Documentation --- */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-brand-surface rounded-2xl w-full max-w-md border border-brand-outline overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-brand-outline bg-brand-surface-high">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-primary" />
                <span>Google Tasks Help Guide</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-brand-text-dim hover:text-white p-1 rounded-full hover:bg-brand-surface-highest transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar text-sm text-brand-text-muted leading-relaxed">
              <p>
                Welcome to the high-performance dark-themed <strong>Google Tasks Clone</strong>. Use this checklist as your command center for quick work and clean checklists:
              </p>
              
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <Sparkles className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                  <p><strong>Add tasks instantly:</strong> Type your task title in the inline box at the top and press Enter, or snap the blue float action plus button at the bottom-right.</p>
                </div>
                <div className="flex gap-2 items-start">
                  <Sparkles className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                  <p><strong>Slide Edit Drawer:</strong> Click on any task to adjust its title, write custom notes description, schedule due dates, or designate its custom active list membership.</p>
                </div>
                <div className="flex gap-2 items-start">
                  <Sparkles className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                  <p><strong>Subtasks tracking:</strong> Keep subtasks intact within the edit drawer. Complete them in step-by-step progress checklists.</p>
                </div>
                <div className="flex gap-2 items-start">
                  <Sparkles className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                  <p><strong>Global Search:</strong> Type anything in the top search bar to instantly query across all list designations, titles, subtask text and notes!</p>
                </div>
                <div className="flex gap-2 items-start">
                  <Star className="w-4.5 h-4.5 text-brand-tertiary shrink-0 mt-0.5" />
                  <p><strong>Starring Tab:</strong> Starring tasks acts as a global priority deck. Tap the Starring tab to view all starred items in one unified panel.</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-brand-outline bg-brand-surface-high flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-brand-primary text-black rounded-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Overlay Modal: Settings Configuration --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-brand-surface rounded-2xl w-full max-w-md border border-brand-outline overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-brand-outline bg-brand-surface-high">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-primary" />
                <span>Application Settings</span>
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-brand-text-dim hover:text-white p-1 rounded-full hover:bg-brand-surface-highest transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-brand-text-dim font-semibold uppercase tracking-wider">Visual Theme</label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-surface-low border border-brand-outline">
                  <span className="font-medium">Task Direct Dark Mode</span>
                  <span className="text-xs bg-brand-primary/20 text-brand-primary px-2.5 py-1 rounded-full font-semibold">Active</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-brand-text-dim font-semibold uppercase tracking-wider">Typography Accent</label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-brand-surface-low border border-brand-outline text-brand-text-muted">
                  <span>Display text: <strong className="text-white">Inter</strong></span>
                  <span>Data label: <strong className="text-white font-mono">JetBrains Mono</strong></span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    if (confirm("Reset application default lists & clear all saved tasks?")) {
                      localStorage.clear();
                      location.reload();
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 rounded-xl font-semibold transition-colors duration-200 cursor-pointer text-center text-xs flex justify-center items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Restore Factory Defaults</span>
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-brand-outline bg-brand-surface-high flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-brand-primary hover:bg-opacity-90 text-black rounded-lg transition-all cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
