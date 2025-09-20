"use client";
// src/components/ManagerLayout.tsx

import { FC, ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import TopBar from "./topbar";
import Overview from "../dashboard/overview/overview";
import TeamLeaders from "../dashboard/team-leaders/TeamLeaders";
// import Employee from "./Employee";

interface ManagerLayoutProps {
  children: ReactNode;
}

const ManagerLayout: FC<ManagerLayoutProps> = ({ children }) => {
  const [activeView, setActiveView] = useState("Overview");
  const [submittedEmployees, setSubmittedEmployees] = useState<string[]>([]);

  console.log("Current submitted employees:", submittedEmployees); // Debug log

  const removeSubmittedEmployee = (employeeName: string) => {
    setSubmittedEmployees((prev) => prev.filter((name) => name !== employeeName));
  };

  const renderView = () => {
    switch (activeView) {
      case "Overview":
        return <Overview submittedEmployees={submittedEmployees} setSubmittedEmployees={setSubmittedEmployees} />;
      case "Team Lead":
        return <TeamLeaders employees={submittedEmployees} removeEmployee={removeSubmittedEmployee} />;
  
      default:
        return <Overview submittedEmployees={submittedEmployees} setSubmittedEmployees={setSubmittedEmployees} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 ml-64 mt-16 p-6 overflow-auto">
          {renderView()}
          {children}
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;