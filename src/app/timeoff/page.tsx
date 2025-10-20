"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/NavbarTimeOff";
import { CalendarDays, Clock, Plus, Check, X, CloudCog } from "lucide-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { log } from "console";

interface TimeOffBalance {
  paid: number;
  compensatory: number;
}

interface TimeOffRequest {
  _id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  numberOfDays: number;
  employeeName?: string; // optional if you want to display who requested it
  approvedBy?: string;
}

export default function TimeOffPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role; // "Admin" | "Manager" | "Employee"
  const employeeId = (session?.user as any)?.employeeId;

  const [balance, setBalance] = useState<TimeOffBalance>({ paid: 0, compensatory: 0 });
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [type, setType] = useState("Paid");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 🧭 Load balance + requests
  useEffect(() => {
    if (employeeId) {
      fetchBalance();
      fetchRequests();
    }
  }, [employeeId, role]);
  console.log("Role in TimeOffPage:", role);
  console.log("Employee ID in TimeOffPage:", employeeId);
  // Fetch balance (admins don’t need balance)
  const fetchBalance = async () => {
    if (role === "Admin") return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/timeoff/balance/${employeeId}`);
      setBalance({
        paid: data.paid || 0,
        compensatory: data.compensatory || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch requests based on role
  const fetchRequests = async () => {
    try {
      let url = "";
      if (role === "Admin") {
        // Admin sees only requests from managers
        url = "http://localhost:5000/api/timeoff/requests?role=Manager";
      } else {
        // Employees and Managers see their own requests
        url = `http://localhost:5000/api/timeoff/requests/employee/${employeeId}`;
      }

      const { data } = await axios.get(url);
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit new time off request
  const handleSubmitRequest = async () => {
    if (!startDate || !endDate) return alert("Please select both start and end dates.");
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/timeoff/requests", {
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        type: type
      });
      setShowRequestModal(false);
      setStartDate(null);
      setEndDate(null);
      setType("Paid");
      fetchRequests();
      fetchBalance();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Top Navbar */}
      <Navbar
        totalEmployees={0}
        currentPage={1}
        totalPages={1}
        itemsPerPage={10}
        onSearch={() => { }}
        onFilterChange={() => { }}
        onGroupByChange={() => { }}
        onViewTypeChange={() => { }}
        onPageChange={() => { }}
        onExport={() => { }}
      />

      <div className="pt-24 px-6 max-w-6xl mx-auto space-y-6">
        {/* 💼 BALANCE SECTION */}
        {role !== "Admin" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border">
              <CalendarDays className="w-6 h-6 mb-2 text-[#65435c]" />
              <p className="text-lg font-semibold">Paid Time Off</p>
              <p className="text-2xl font-bold text-[#65435c]">{balance.paid} days</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border">
              <Clock className="w-6 h-6 mb-2 text-[#65435c]" />
              <p className="text-lg font-semibold">Compensatory Days</p>
              <p className="text-2xl font-bold text-[#65435c]">{balance.compensatory} days</p>
            </div>
          </div>
        )}

        {/* 🗓️ REAL CALENDAR SECTION */}
        <div className="bg-white rounded-lg shadow p-4 border">
          <h2 className="text-xl font-bold mb-4">Calendar</h2>
          <p className="text-gray-500 text-sm mb-4">
            Pick a date range to preview or request time off.
          </p>
          <div className="flex flex-col items-center gap-4">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => {
                setStartDate(update[0]);
                setEndDate(update[1]);
              }}
              inline
            />
            {startDate && endDate && (
              <div className="text-sm text-gray-600">
                Selected: {startDate.toLocaleDateString()} → {endDate.toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* 📝 REQUEST LIST */}
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">
              {role === "Admin" ? "Managers Time Off Requests" : "My Time Off Requests"}
            </h2>
            {/* 🔹 Only show button if NOT admin */}
            {role !== "Admin" && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-[#65435c] text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            )}
          </div>

          {requests.length === 0 ? (
            <p className="text-gray-500">No requests found.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="p-2">Type</th>
                  <th className="p-2">Start</th>
                  <th className="p-2">End</th>
                  <th className="p-2">Days</th>
                  {role === "Admin" && <th className="p-2">Employee</th>}
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{req.type}</td>
                    <td className="p-2">{new Date(req.startDate).toLocaleDateString()}</td>
                    <td className="p-2">{new Date(req.endDate).toLocaleDateString()}</td>
                    <td className="p-2">{req.numberOfDays}</td>
                    {role === "Admin" && <td className="p-2">{req.employeeName || "N/A"}</td>}
                    <td className="p-2">
                      {req.status === "Pending" && <span className="text-yellow-600">Pending</span>}
                      {req.status === "Approved" && (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Approved
                        </span>
                      )}
                      {req.status === "Rejected" && (
                        <span className="text-red-600 flex items-center gap-1">
                          <X className="w-4 h-4" /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 🔹 NEW REQUEST MODAL */}
      {showRequestModal && role !== "Admin" && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">New Time Off Request</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="Paid">Paid</option>
                <option value="Compensatory">Compensatory</option>
                <option value="Sick">Sick</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Start & End Date</label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update: [Date | null, Date | null]) => {
                  setStartDate(update[0]);
                  setEndDate(update[1]);
                }}
                className="w-full border p-2 rounded"
                placeholderText="Select date range"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleSubmitRequest}
                className="px-4 py-2 bg-[#65435c] text-white rounded hover:bg-[#55394e]"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
