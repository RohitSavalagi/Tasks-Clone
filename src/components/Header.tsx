import { Menu, CheckCircle2, Search, Grid, Plus } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddTaskClick: () => void;
  dbStatus?: { connected: boolean; backendType: string; uriProvided: boolean };
}

export function Header({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  onAddTaskClick,
  dbStatus,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center w-full px-6 h-16 bg-brand-bg relative z-50 border-b border-brand-outline select-none">
      {/* Left side brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-full hover:bg-brand-surface text-brand-text-muted hover:text-brand-text transition-colors duration-200 cursor-pointer"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-brand-primary fill-brand-primary-container/20 shrink-0" />
          <h1 className="font-sans font-medium text-lg tracking-tight text-brand-text flex items-center">
            <span>Tasks</span>
            {dbStatus && (
              <span
                className={`ml-2 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-mono flex items-center gap-1 font-semibold ${
                  dbStatus.connected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                }`}
                title={dbStatus.connected ? "Real-time sync stream via cloud MongoDB database" : "Real-time sync via Local In-Memory Sandbox"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`}></span>
                {dbStatus.connected ? "MongoDB-Cloud" : "Sandbox"}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-2xl px-6 md:px-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-text-dim group-focus-within:text-brand-primary">
            <Search className="w-4 h-4 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 bg-brand-surface-high border-none rounded-full focus:ring-1 focus:ring-brand-primary focus:bg-brand-surface-highest transition-all duration-200 text-sm text-brand-text placeholder:text-brand-text-dim outline-none"
            placeholder="Search tasks, notes, or subtasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-3">
        {/* Quick add floating style icon on mobile heading */}
        <button
          onClick={onAddTaskClick}
          className="md:hidden p-2 rounded-full bg-brand-primary text-black hover:opacity-90 transition-opacity cursor-pointer shadow"
          title="Add new task"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          className="p-2 rounded-full hover:bg-brand-surface text-brand-text-muted hover:text-brand-text transition-colors duration-200 cursor-pointer hidden md:flex"
          title="Google Apps"
        >
          <Grid className="w-5 h-5" />
        </button>

        {/* User avatar portrait */}
        <div className="w-9 h-9 rounded-full bg-brand-primary-container/30 flex items-center justify-center text-white overflow-hidden border border-brand-outline shrink-0">
          <img
            className="w-full h-full object-cover"
            alt="User profile"
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKBWg47EC_FZPRRRAMcpYU21KfYNqOw-ArzuIVax2UDGuOzwqjnhRur75ZQgpvLckBXB-n-g7XjAo4_CUrxF0OnOzYbK5gFDMrHd_14RXgbLtSz8MiKgHHth6eMIvke0zjeqjVLmUYAPf5ybhYmC2bCs0sc-MzOePvsvE10HmPOBikuvPtQbDAOSuyw3bHQbutMqJ8-nVgYCsU_NbkFqa65N7YEdpqkJEFAU7iPuqpBxDeOQ2bNp2hBIfn9uXA0zGiYi4E7fEP2egn"
          />
        </div>
      </div>
    </header>
  );
}
