import React, { useState } from "react";
import * as Icons from "lucide-react";
import { TaskList } from "../types";

interface SidebarProps {
  lists: TaskList[];
  activeListId: string;
  setActiveListId: (id: string) => void;
  onCreateList: (name: string) => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  starredCount: number;
  onDropOnList?: (taskId: string, targetListId: string) => void;
}

export function Sidebar({
  lists,
  activeListId,
  setActiveListId,
  onCreateList,
  onOpenHelp,
  onOpenSettings,
  starredCount,
  onDropOnList,
}: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [draggedOverListId, setDraggedOverListId] = useState<string | null>(null);

  const handleCreateListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName("");
      setIsCreating(false);
    }
  };

  const handleDragOver = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    setDraggedOverListId(listId);
  };

  const handleDragLeave = () => {
    setDraggedOverListId(null);
  };

  const handleDrop = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    setDraggedOverListId(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId && onDropOnList) {
      onDropOnList(taskId, listId);
    }
  };

  // Helper to dynamically render Lucide Icons by name string
  const renderIcon = (name?: string, className = "w-5 h-5") => {
    if (!name) return <Icons.List className={className} />;
    const LucideIcon = (Icons as any)[name];
    if (LucideIcon) {
      return <LucideIcon className={className} />;
    }
    return <Icons.List className={className} />;
  };

  return (
    <nav className="h-full w-[280px] p-4 bg-brand-surface-low border-r border-brand-outline flex flex-col justify-between select-none">
      <div className="space-y-1">
        {/* Render tasks categories */}
        {lists.map((list) => {
          const isActive = activeListId === list.id;
          const isDraggedOver = draggedOverListId === list.id;
          return (
            <button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDragEnter={(e) => handleDragEnter(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, list.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer border ${
                isDraggedOver
                  ? "bg-brand-primary/10 border-brand-primary border-dashed text-brand-primary animate-pulse"
                  : "border-transparent"
              } ${
                isActive && !isDraggedOver
                  ? "bg-brand-secondary-container text-brand-on-secondary-container font-semibold"
                  : "text-brand-text-muted hover:bg-brand-surface-high hover:text-brand-text"
              }`}
            >
              <span className={isActive ? "text-brand-on-secondary-container" : "text-brand-text-dim"}>
                {renderIcon(list.icon || "List")}
              </span>
              <span className="truncate flex-1 text-left">{list.name}</span>
            </button>
          );
        })}

        {/* Dynamic Starring Tab */}
        {(() => {
          const isStarredActive = activeListId === "starred";
          const isStarredHovered = draggedOverListId === "starred";
          return (
            <button
              onClick={() => setActiveListId("starred")}
              onDragOver={(e) => handleDragOver(e, "starred")}
              onDragEnter={(e) => handleDragEnter(e, "starred")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "starred")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer border ${
                isStarredHovered
                  ? "bg-yellow-400/10 border-yellow-400 border-dashed text-yellow-400 animate-pulse"
                  : "border-transparent"
              } ${
                isStarredActive && !isStarredHovered
                  ? "bg-brand-secondary-container text-brand-on-secondary-container font-semibold"
                  : "text-brand-text-muted hover:bg-brand-surface-high hover:text-brand-text"
              }`}
            >
              <span className={isStarredActive ? "text-brand-on-secondary-container" : "text-brand-tertiary"}>
                <Icons.Star className="w-5 h-5 fill-current" />
              </span>
              <span className="truncate flex-1 text-left">Starring</span>
              {starredCount > 0 && (
                <span className="bg-brand-surface-highest text-xs text-brand-text-muted px-2 py-0.5 rounded-full">
                  {starredCount}
                </span>
              )}
            </button>
          );
        })()}

        {/* Create new list block */}
        <div className="pt-2 border-t border-brand-outline mt-3">
          {isCreating ? (
            <form onSubmit={handleCreateListSubmit} className="px-3 py-1">
              <input
                autoFocus
                type="text"
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onBlur={() => {
                  setTimeout(() => {
                    if (!newListName.trim()) {
                      setIsCreating(false);
                    }
                  }, 200);
                }}
                className="w-full bg-brand-surface-high text-brand-text text-sm rounded px-3 py-2 border border-brand-outline focus:outline-none focus:border-brand-primary placeholder:text-brand-text-dim"
              />
              <div className="flex justify-end gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2 py-1 text-xs text-brand-text-dim hover:text-brand-text cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 text-xs bg-brand-primary-container text-white rounded font-medium hover:bg-opacity-95 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-3 w-full px-4 py-3 text-brand-primary font-medium text-sm hover:bg-brand-surface-high rounded-full transition-colors duration-200 cursor-pointer"
            >
              <Icons.Plus className="w-5 h-5" />
              <span>Create new list</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-brand-outline space-y-1">
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-3 w-full px-4 py-2 text-brand-text-muted hover:bg-brand-surface-high hover:text-brand-text rounded-full text-sm transition-colors duration-200 cursor-pointer"
        >
          <Icons.HelpCircle className="w-4 h-4 text-brand-text-dim" />
          <span>Help</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 w-full px-4 py-2 text-brand-text-muted hover:bg-brand-surface-high hover:text-brand-text rounded-full text-sm transition-colors duration-200 cursor-pointer"
        >
          <Icons.Settings className="w-4 h-4 text-brand-text-dim" />
          <span>Settings</span>
        </button>
      </div>
    </nav>
  );
}
