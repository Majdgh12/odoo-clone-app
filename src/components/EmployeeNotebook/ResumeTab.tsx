"use client";

import React, { useState } from "react";
import { Trash2, TrendingUp, Edit2, X } from "lucide-react";
import type { Employee } from "../../lib/types";

interface ResumeTabProps {
  employee: Employee;
  isAdmin?: boolean;
  canEdit?: boolean;
}

interface Skill {
  skill_name?: string;
  name?: string;
  percentage: number;
}

const ResumeTab: React.FC<ResumeTabProps> = ({ employee, isAdmin = false }) => {
  // ------------------ Modal state and editable form state ------------------
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    experiences: employee.user?.general_resume?.resume?.experience ?? [],
    education: employee.user?.general_resume?.resume?.education ?? [],
    programming: employee.user?.general_resume?.skills?.programming_languages ?? [],
    languages: employee.user?.general_resume?.skills?.language ?? [],
    otherSkills: employee.user?.general_resume?.skills?.other_skills ?? [],
  });

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
    if (dateString.toLowerCase() === "present") return "Current";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });
  };

  const handleInputChange = (
    index: number,
    field: string,
    value: string | number,
    type: "experiences" | "education" | "programming" | "languages" | "otherSkills"
  ) => {
    const updatedArray = [...formData[type]];
    updatedArray[index][field] = value;
    setFormData({ ...formData, [type]: updatedArray });
  };

 const handleSave = async () => {
  try {
    // Transform the data structure to match API expectations
    const requestBody = {
      education: formData.education,
      experience: formData.experiences,        // Note: experiences -> experience
      languageSkills: formData.languages,     // Note: languages -> languageSkills
      otherSkills: formData.otherSkills,
      programmingSkills: formData.programming  // Note: programming -> programmingSkills
    };

   

    const response = await fetch(
      `http://localhost:5000/api/resume/employee/${employee._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("🔍 Response status:", response.status);
    console.log("🔍 Response status text:", response.statusText);

    // Get response text regardless of status
    const responseText = await response.text();
    console.log("🔍 Response body:", responseText);

    if (!response.ok) {
      // Try to parse as JSON for error details
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += `\nServer error: ${JSON.stringify(errorData, null, 2)}`;
      } catch {
        errorMessage += `\nServer response: ${responseText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    const updated = JSON.parse(responseText);
    console.log("✅ Resume updated:", updated);

    setIsEditing(false);
    
  } catch (error) {
    
    // Show user-friendly error message
    alert(`Failed to update resume: ${error.message}`);
  }
};

  const renderSkillGroup = (
    title: string,
    skillArray: Skill[],
    type?: "programming" | "languages" | "otherSkills"
  ) => (
    <div className="mb-4">
      <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
      {skillArray.length > 0 ? (
        skillArray.map((skill, index) => {
          const name = skill.skill_name ?? skill.name ?? "-";
          const percentage = skill.percentage ?? 0;
          const derivedLevel = getDerivedLevel(percentage);

          return (
            <div key={index} className="flex flex-col mb-3">
              <div className="flex items-center justify-between mb-1">
                {type ? (
                  <>
                    <input
                      type="text"
                      className="border p-1 text-sm flex-1 mr-2"
                      value={name}
                      onChange={(e) =>
                        handleInputChange(index, "skill_name", e.target.value, type)
                      }
                    />
                    <input
                      type="number"
                      className="border p-1 text-sm w-16"
                      value={percentage}
                      onChange={(e) =>
                        handleInputChange(index, "percentage", Number(e.target.value), type)
                      }
                    />
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-700">{name}</span>
                    <span className="text-sm text-gray-600">{derivedLevel}</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getSkillColor(percentage)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-sm">No {title.toLowerCase()} listed.</p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ------------------ Display Resume Info ------------------ */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>RESUME</span>
            {isAdmin && (
              <button
                className="ml-4 p-2 rounded transition flex items-center justify-center"
                style={{ backgroundColor: "#65435C" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#54344c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#65435C")}
                title="Edit Employee"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-5 h-5 text-white" />
              </button>
            )}
          </h3>
        </div>

        {/* Experiences Display */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-800 mb-4">Experience</h4>
          <div className="space-y-4">
            {employee.user?.general_resume?.resume?.experience?.map((exp, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  {index < employee.user.general_resume.resume.experience.length - 1 && (
                    <div className="w-px h-16 bg-gray-300 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {formatDate(exp.date_from)} - {formatDate(exp.date_to)}
                    </span>
                  </div>
                  <h5 className="font-semibold text-gray-900 mt-1">{exp.title}</h5>
                  <p className="text-gray-600 text-sm mt-1">{exp.job_description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Display */}
        <div>
          <h4 className="font-medium text-gray-800 mb-4">Education</h4>
          <div className="space-y-4">
            {employee.user?.general_resume?.resume?.education?.map((edu, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  {index < employee.user.general_resume.resume.education.length - 1 && (
                    <div className="w-px h-16 bg-gray-300 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {formatDate(edu.from_date)} - {formatDate(edu.to_date)}
                    </span>
                  </div>
                  <h5 className="font-semibold text-gray-900 mt-1">{edu.title}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Display */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">SKILLS</h3>
          <div className="flex items-center text-teal-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">TIMELINE</span>
          </div>
        </div>

        {renderSkillGroup(
          "Programming Languages",
          employee.user?.general_resume?.skills?.programming_languages ?? []
        )}
        {renderSkillGroup("Languages", employee.user?.general_resume?.skills?.language ?? [])}
        {renderSkillGroup("Other Skills", employee.user?.general_resume?.skills?.other_skills ?? [])}
      </div>

      {/* ------------------ Modal for Editing ------------------ */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl w-11/12 max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Edit Resume</h3>

            {/* Experiences Section */}
            <div className="mb-6 p-4 rounded-lg bg-gray-50 shadow-sm">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                Experiences
              </h4>
              {formData.experiences.map((exp, index) => (
                <div key={index} className="flex flex-col space-y-2 mb-4">
                  <input
                    type="text"
                    className="border border-gray-300 p-2 w-full rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    value={exp.title}
                    onChange={(e) =>
                      handleInputChange(index, "title", e.target.value, "experiences")
                    }
                    placeholder="Title"
                  />
                  <textarea
                    className="border border-gray-300 p-2 w-full rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none"
                    value={exp.job_description}
                    onChange={(e) =>
                      handleInputChange(index, "job_description", e.target.value, "experiences")
                    }
                    placeholder="Job Description"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="border border-gray-300 p-2 w-full rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      value={exp.date_from}
                      onChange={(e) =>
                        handleInputChange(index, "date_from", e.target.value, "experiences")
                      }
                      placeholder="From Date"
                    />
                    <input
                      type="text"
                      className="border border-gray-300 p-2 w-full rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      value={exp.date_to}
                      onChange={(e) =>
                        handleInputChange(index, "date_to", e.target.value, "experiences")
                      }
                      placeholder="To Date"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="mb-6 p-4 rounded-lg bg-gray-50 shadow-sm">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                Education
              </h4>
              {formData.education.map((edu, index) => (
                <div key={index} className="flex flex-col space-y-2 mb-4">
                  <input
                    type="text"
                    className="border border-gray-300 p-2 w-full rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    value={edu.title}
                    onChange={(e) =>
                      handleInputChange(index, "title", e.target.value, "education")
                    }
                    placeholder="Title"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="border border-gray-300 p-2 w-full rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      value={edu.from_date}
                      onChange={(e) =>
                        handleInputChange(index, "from_date", e.target.value, "education")
                      }
                      placeholder="From Date"
                    />
                    <input
                      type="text"
                      className="border border-gray-300 p-2 w-full rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      value={edu.to_date}
                      onChange={(e) =>
                        handleInputChange(index, "to_date", e.target.value, "education")
                      }
                      placeholder="To Date"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div className="mb-6 p-4 rounded-lg bg-gray-50 shadow-sm">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Skills</h4>
              {["programming", "languages", "otherSkills"].map((type) => (
                <div key={type} className="mb-4">
                  <h5 className="font-medium text-gray-700 capitalize mb-2">
                    {type.replace(/([A-Z])/g, " $1")}
                  </h5>
                  {(formData as any)[type].map((skill: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        value={skill.name ?? skill.skill_name ?? ""}
                        onChange={(e) =>
                          handleInputChange(index, "name", e.target.value, type as any)
                        }
                        placeholder="Skill Name"
                      />
                      <input
                        type="number"
                        className="border border-gray-300 p-2 w-20 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        value={skill.percentage ?? 0}
                        onChange={(e) =>
                          handleInputChange(index, "percentage", e.target.value, type as any)
                        }
                        placeholder="%"
                      />
                      <button className="text-red-500 hover:text-red-700 transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <button
              className="mt-4 px-5 py-2 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: "#65435C" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#54344c")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#65435C")}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeTab;
