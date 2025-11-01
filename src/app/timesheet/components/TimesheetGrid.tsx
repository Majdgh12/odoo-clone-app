"use client";
import React from "react";
import { Play, Square, Plus } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
    endOfWeek,
  addDays,
  format,
  isSameDay,
  isSaturday,
  isSunday,
} from "date-fns";


interface Timesheet {
  _id?: string;
  project?: string;
  project_name?:string;
  task?: string;
  project_id?: { _id: string; name: string } | string;
  task_title?:string;
  task_id?: { _id: string; title?: string; name?: string } | string;
  entries: { [day: string]: number };
  total: number;
}

interface Props {
  timesheets: Timesheet[];
  view: string;
  currentDate: Date;
  onAddLine: () => void;
  onStartTimer: (sheet: Timesheet) => void;
  runningSheetId?: string | null;
  isRunning?: boolean;
  activeSheet?: any;
}

const getId = (val: any) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && "_id" in val) return val._id;
  return null;
};

export default function TimesheetGrid({
  timesheets,
  view,
  currentDate,
  onAddLine,
  onStartTimer,
  runningSheetId,
  isRunning,
  activeSheet,
}: Props) {
  const weekStartsOn = 1;
  const days: { key: string; label: string; dateObj: Date }[] = [];


if (view === "week") {
  const start = startOfWeek(currentDate, { weekStartsOn });
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    if (!isSaturday(d) && !isSunday(d)) {
      days.push({
        key: format(d, "EEE-yyyy-MM-dd"),
        label: format(d, "EEE, MMM dd"),
        dateObj: d,
      });
    }
  }
} else if (view === "month") {
  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn });

  let d = start;
  while (d <= end) {
    if (!isSaturday(d) && !isSunday(d)) {
      days.push({
        key: format(d, "EEE-yyyy-MM-dd"),
        label: format(d, "EEE, MMM dd"),
        dateObj: d,
      });
    }
    d = addDays(d, 1);
  }
} else {
  days.push({
    key: format(currentDate, "EEE-yyyy-MM-dd"),
    label: format(currentDate, "EEE, MMM dd"),
    dateObj: currentDate,
  });
}
const normalizeKey = (d: string) =>
  view === "month" ? format(new Date(d), "yyyy-MM-dd") : format(new Date(d), "EEE");

  const totals = days.map((d) =>
    timesheets.reduce(
      (sum, t) => sum + (t.entries?.[normalizeKey(d.key)] || 0),
      0
    )
  );
  const grandTotal = timesheets.reduce((a, t) => a + (t.total || 0), 0);

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
      <div className="min-w-[1100px]">
        <table className="w-full text-[13px] text-gray-700 border-collapse">
          {/* Header */}
          <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
            <tr className="text-center font-semibold text-gray-600">
              <th className="p-2.5 text-left bg-white sticky left-0 z-20 shadow-sm">
                Project / Task
              </th>
              {days.map((d) => (
                <th
                  key={d.key}
                  className={`p-2.5 font-medium ${
                    isSameDay(d.dateObj, new Date())
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-50"
                  }`}
                >
                  {d.label}
                </th>
              ))}
              <th className="p-2.5 bg-gray-100 font-medium">Total</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {timesheets.map((t, i) => {
const isActive =
  (runningSheetId && runningSheetId === t._id) ||
  (isRunning &&
    getId(t.project_id) === getId(activeSheet?.project_id) &&
    (getId(t.task_id) || null) === (getId(activeSheet?.task_id) || null));

              const bg = i % 2 === 0 ? "bg-white" : "bg-gray-50";

              return (
                <tr
                  key={t._id || i}
                  className={`${bg} hover:bg-gray-100 transition-colors duration-100 ${
                    isActive ? "bg-purple-50" : ""
                  }`}
                >
                  {/* Project / Task column */}
                  <td className="p-2.5 border-b flex items-center gap-2 sticky left-0 z-10 shadow-sm bg-inherit">
                    <button
                      onClick={() => onStartTimer(t)}
                      className={`${
                        isActive && isRunning
                          ? "text-red-500"
                          : "text-[#65435c] hover:text-[#55394e]"
                      }`}
                    >
                      {isActive && isRunning ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                 <span className="font-medium truncate">
  {t.task_title
    ? `${t.project_name || t.project || t.project_id?.name || "Unnamed Project"} | ${t.task_title}`
    : t.project_name || t.project || t.project_id?.name || "Unnamed Project"}
</span>

                  </td>

                  {/* Day columns */}
                  {days.map((d) => (
                    <td
                      key={d.key}
                      className="p-2.5 border-b text-center text-[13px]"
                    >
                  {t.entries?.[normalizeKey(d.key)] ??
 t.entries?.[format(d.dateObj, "EEE")] // fallback for weekday-based entries
  ? `${(t.entries[normalizeKey(d.key)] || t.entries[format(d.dateObj, "EEE")] || 0).toFixed(2)}h`
  : "0.00"}

                    </td>
                  ))}

                  {/* Total column */}
                  <td className="p-2.5 border-b text-center font-semibold bg-gray-50">
                    {t.total?.toFixed(2) || "0.00"}h
                  </td>
                </tr>
              );
            })}

            {/* Add a line */}
            <tr className="border-t">
              <td
                colSpan={days.length + 2}
                className="p-2.5 text-center text-[13px] cursor-pointer text-green-600 hover:text-green-700 hover:underline transition-all duration-150"
                onClick={onAddLine}
              >
                <Plus className="inline w-3.5 h-3.5 mr-1 align-text-bottom" /> Add a
                line
              </td>
            </tr>
          </tbody>

          {/* Footer */}
          <tfoot>
            <tr className="bg-gray-50 font-semibold text-gray-700 border-t">
              <td className="p-2.5 text-right bg-white sticky left-0 z-10">
                Total:
              </td>
              {totals.map((t, i) => (
                <td key={i} className="p-2.5 text-center">
                  {t.toFixed(2)}h
                </td>
              ))}
              <td className="p-2.5 text-center bg-yellow-100 text-gray-900">
                {grandTotal.toFixed(2)}h
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
