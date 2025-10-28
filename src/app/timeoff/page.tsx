"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/NavbarTimeOff";
import { CalendarDays, Clock, Plus, Check, X } from "lucide-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TimeOffBalance {
  paid: number;
  compensatory: number;
}

interface TimeOffRequest {
  _id: string;
  type: string;
  startDate: string | Date;
  endDate: string | Date;
  status: "Pending" | "Approved" | "Rejected";
  numberOfDays: number;
  employeeName?: string;
  approvedBy?: string;
  employeeId?: string;
  duration?: string;
  scope?: "own" | "department"; // 👈 for managers
}

export default function TimeOffPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role; // "admin" | "manager" | "employee"
  const employeeId = (session?.user as any)?.employeeId;

  const [balance, setBalance] = useState<TimeOffBalance>({ paid: 0, compensatory: 0 });
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("Full Day");

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [type, setType] = useState("Paid");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Load balance + requests
  useEffect(() => {
    if (employeeId) {
      fetchBalance();
      fetchRequests();
    }
  }, [employeeId, role]);

  // Fetch balance (not for admins)
  const fetchBalance = async () => {
    if (role === "admin") return;
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/timeoff/balance/${employeeId}`
      );
      setBalance({
        paid: data.paid || 0,
        compensatory: data.compensatory || 0,
      });
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      let data: TimeOffRequest[] = [];

      if (role === "admin") {
        const res = await axios.get(
          "http://localhost:5000/api/timeoff/requests?role=manager"
        );
        data = res.data;
      } else if (role === "manager") {
        // manager: fetch both own + department
        const [ownRes, deptRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/timeoff/requests/employee/${employeeId}`),
          axios.get(`http://localhost:5000/api/timeoff/requests/department/${employeeId}`)
        ]);

        data = [
          ...ownRes.data.map((r: any) => ({ ...r, scope: "own" })),
          ...deptRes.data.map((r: any) => ({ ...r, scope: "department" }))
        ];
      } else {
        const res = await axios.get(
          `http://localhost:5000/api/timeoff/requests/employee/${employeeId}`
        );
        data = res.data;
      }

      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
    }
  };

  // Submit request
  const handleSubmitRequest = async () => {
    if (!startDate || !endDate) return alert("Please select both start and end dates.");
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/timeoff/requests", {
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        type,
        duration,
      });
      setShowRequestModal(false);
      setStartDate(null);
      setEndDate(null);
      setType("Paid");
      fetchRequests();
      fetchBalance();
    } catch (err) {
      console.error("Error submitting request:", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve/Reject
  const handleApproveReject = async (requestId: string, action: "approve" | "reject") => {
    try {
      await axios.put(
        `http://localhost:5000/api/timeoff/requests/${requestId}/${action}`,
        { approver_id: employeeId }
      );
      fetchRequests();
    } catch (err) {
      console.error(`Error ${action} request:`, err);
    }
  };

  // format helper
  const formatDate = (date: string | Date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return String(date);
    }
  };

  return (
    <>
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
        {/* Balance */}
        {role !== "admin" && (
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

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow p-4 border">
          <h2 className="text-xl font-bold mb-4">Calendar</h2>

          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => {
              setStartDate(update[0]);
              setEndDate(update[1]);
              if (update[0] && update[1]) setShowRequestModal(true);
            }}
            inline
            monthsShown={12}                                // show 12 months at once
            minDate={new Date(Date.now() + 48 * 60 * 60 * 1000)} // no past days
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            calendarClassName="grid grid-cols-3 gap-8"       // 👈 arrange 3 columns × 4 rows
            openToDate={new Date()}                          // start from current month
          />

          {startDate && endDate && (
            <div className="text-sm text-gray-600 mt-2">
              Selected: {formatDate(startDate)} → {formatDate(endDate)}
            </div>
          )}
        </div>




        {/* Requests table */}
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">
              {role === "admin"
                ? "Managers Time Off Requests"
                : role === "manager"
                  ? "My & Department Requests"
                  : "My Time Off Requests"}
            </h2>
            {role !== "admin" && (
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
                  <th className="p-2">Duration</th>
                  {(role === "admin" || role === "manager") && <th className="p-2">Employee</th>}
                  <th className="p-2">Status</th>
                  <th className="p-2">Approved By</th>
                  {(role === "admin" || role === "manager") && <th className="p-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} className="border-b hover:bg-gray-50">
                    {/* Request Type */}
                    <td className="p-2">{req.type}</td>

                    {/* Dates */}
                    <td className="p-2">
                      {req.startDate ? new Date(req.startDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-2">
                      {req.endDate ? new Date(req.endDate).toLocaleDateString() : "—"}
                    </td>

                    {/* Number of Days */}
                    <td className="p-2">{req.numberOfDays ?? "—"}</td>
                    <td className="p-2">{req.duration || "Full Day"}</td>
                    {/* Employee Name */}
                    {(role === "admin" || role === "manager") && (
                      <td className="p-2">{req.employeeName || "Unknown"}</td>
                    )}

                    {/* Status */}
                    <td className="p-2">
                      {req.status === "Pending" && (
                        <span className="text-yellow-600">Pending</span>
                      )}
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

                    {/* Approver info */}
                    <td className="p-2">{req.approvedBy || "Not processed yet"}</td>

                    {/* Actions */}
                    {(role === "admin" ||
                      (role === "manager" && req.scope === "department")) &&
                      req.status === "Pending" && (
                        <td className="p-2 flex gap-2">
                          <button
                            onClick={() => handleApproveReject(req._id, "approve")}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveReject(req._id, "reject")}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </td>
                      )}
                  </tr>
                ))}
              </tbody>


            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showRequestModal && role !== "admin" && (
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
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {duration === "Half Day" ? "Date" : "Start & End Date"}
              </label>

              {duration === "Full Day" ? (
                <DatePicker
                  key="full-day"
                  selectsRange   // ✅ literal true, no TS error
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(value: [Date | null, Date | null]) => {
                    const [s, e] = value;
                    setStartDate(s);
                    setEndDate(e);
                  }}
                  className="w-full border p-2 rounded"
                  placeholderText="Select date range"
                  minDate={new Date(Date.now() + 48 * 60 * 60 * 1000)}
                />
              ) : (
                <DatePicker
                  key="half-day"
                  selected={startDate}
                  onChange={(date: Date | null) => {
                    setStartDate(date);
                    setEndDate(date); // both same for half day
                  }}
                  className="w-full border p-2 rounded"
                  placeholderText="Select a date"
                  minDate={new Date(Date.now() + 48 * 60 * 60 * 1000)}
                />
              )}
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
