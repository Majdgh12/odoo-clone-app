// src/components/EmployeeNotebook/ResumeTab.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Trash2, TrendingUp, Edit2, X } from "lucide-react";
import type { Employee } from "../../lib/types";
import ResumeEditForm from "./ResumeForm";

interface ResumeTabProps {
  employee: Employee;
  isAdmin?: boolean;
  onUpdated?: (updatedResume: any) => void; // optional callback
}

const ResumeTab: React.FC<ResumeTabProps> = ({ employee, isAdmin = false, onUpdated }) => {
  // Normalize & keep local copy so we can update after save without full refresh
  const initialResume = useMemo(() => {
    const general_resume = employee?.user?.general_resume ?? {};
    const resume = general_resume.resume ?? {};
    const skills = general_resume.skills ?? {};
    return {
      resume,
      skills,
    };
  }, [employee]);

  const [local, setLocal] = useState(() => initialResume);
  const [isEditing, setIsEditing] = useState(false);

  // Helpers (same as your old code)
  const getSkillColor = (percentage: number) => {
    if (percentage >= 90) return "bg-purple-600";
    if (percentage >= 70) return "bg-purple-500";
    if (percentage >= 50) return "bg-purple-400";
    return "bg-purple-300";
  };

  const getDerivedLevel = (percentage: number) => {
    if (percentage <= 20) return "Beginner";
    if (percentage <= 40) return "Basic";
    if (percentage <= 60) return "Intermediate";
    if (percentage <= 80) return "Advanced";
    return "Expert";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    if (String(dateString).toLowerCase() === "present") return "Current";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });
  };

  // defensive access
  const experiences = local.resume?.experience ?? [];
  const education = local.resume?.education ?? [];
  const languages = local.skills?.language ?? [];
  const programming = local.skills?.programming_languages ?? [];
  const otherSkills = local.skills?.other_skills ?? [];

  const renderSkillGroup = (
    title: string,
    skillArray: Array<{ skill_name?: string; name?: string; percentage?: number }>
  ) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-800">{title}</h4>
      </div>
      {skillArray.length > 0 ? (
        skillArray.map((skill, index) => {
          const name = skill.skill_name ?? skill.name ?? skill.language_name ?? "-";
          const percentage = skill.percentage ?? 0;
          const derivedLevel = getDerivedLevel(percentage);

          return (
            <div key={index} className="group mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">{name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{derivedLevel}</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getSkillColor(percentage)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-sm">No {title.toLowerCase()} listed.</p>
      )}
    </div>
  );

  const handleSaved = (updated: any) => {
    // backend might return different shape; we try to normalize like the old code expects
    const normalized = {
      resume: updated?.resume ?? updated?.resume ?? updated?.resume ?? updated,
      skills: {
        programming_languages:
          updated?.programmingSkills ?? updated?.skills?.programming_languages ?? updated?.programming_languages ?? programming,
        language: updated?.languageSkills ?? updated?.skills?.language ?? updated?.language ?? languages,
        other_skills: updated?.otherSkills ?? updated?.skills?.other_skills ?? updated?.other_skills ?? otherSkills,
      },
    };

    // Merge with existing to avoid losing sections
    setLocal((prev: any) => ({
      resume: { ...(prev.resume || {}), ...(normalized.resume || {}) },
      skills: { ...(prev.skills || {}), ...(normalized.skills || {}) },
    }));

    if (onUpdated) onUpdated(normalized);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">RESUME</h3>

            {/* Global pencil edit button */}
            <div>
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Resume"
                className="ml-4 p-2 rounded transition flex items-center justify-center"
                style={{ backgroundColor: "#65435C" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#54344c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#65435C")}
              >
                <Edit2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-medium text-gray-800 mb-4">Experience</h4>
            <div className="space-y-4">
              {experiences.length > 0 ? (
                experiences.map((exp: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full" />
                      {index < experiences.length - 1 && <div className="w-px h-16 bg-gray-300 mt-2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {formatDate(exp.date_from)} - {formatDate(exp.date_to)}
                        </span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mt-1">{exp.title ?? "-"}</h5>
                      <p className="text-gray-600 text-sm mt-1">{exp.job_description ?? "-"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No experience added yet.</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-4">Education</h4>
            <div className="space-y-4">
              {education.length > 0 ? (
                education.map((edu: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full" />
                      {index < education.length - 1 && <div className="w-px h-16 bg-gray-300 mt-2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {formatDate(edu.from_date)} - {formatDate(edu.to_date)}
                        </span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mt-1">{edu.title ?? "-"}</h5>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No education added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">SKILLS</h3>
          <div className="flex items-center text-teal-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">TIMELINE</span>
          </div>
        </div>

        {renderSkillGroup("Programming Languages", programming)}
        {renderSkillGroup("Languages", languages)}
        {renderSkillGroup("Other Skills", otherSkills)}
      </div>

      {/* Modal edit form */}
      {isEditing && (
        <ResumeEditForm
          employeeId={employee._id}
          initialData={{ resume: local.resume, skills: local.skills }}
          onClose={() => setIsEditing(false)}
          onSaved={(updated) => handleSaved(updated)}
        />
      )}
    </div>
  );
};

export default ResumeTab;
