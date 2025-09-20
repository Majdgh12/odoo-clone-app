// src/components/ManagerSidebar.tsx
import { FC } from "react";
import { Users, UserCog, LayoutDashboard } from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  return (
    <aside className="w-64 h-screen bg-white text-gray-900 flex flex-col border-r border-gray-200 mt-16 fixed">
      {/* Logo / Dashboard */}
      <div className="p-4 text-lg font-bold border-b border-gray-300">
        Manager Dashboard
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => handleViewChange("Overview")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left ${
            activeView === "Overview"
              ? "bg-purple-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => handleViewChange("Team Lead")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left ${
            activeView === "Team Lead"
              ? "bg-purple-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <UserCog className="w-5 h-5" />
          <span>Team Leaders</span>
        </button>

        {/* <button
          onClick={() => handleViewChange("Employee")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left ${
            activeView === "Employee"
              ? "bg-purple-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Employees</span>
        </button> */}
      </nav>
    </aside>
  );
};

export default Sidebar;