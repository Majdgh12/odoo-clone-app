"use client";

import React from "react";
import { Trash2, TrendingUp } from "lucide-react";
import type { Employee } from "../../lib/types";

interface ResumeTabProps {
  employee: Employee;
}

const ResumeTab: React.FC<ResumeTabProps> = ({ employee }) => {
  const { general_resume } = employee?.user ?? {};
  const { resume = {}, skills = {} } = general_resume ?? {};

  const getSkillColor = (percentage: number) => {
    // sourcery skip: use-braces
    
    if (percentage >= 90) return "bg-purple-600";
    if (percentage >= 70) return "bg-purple-500";
    if (percentage >= 50) return "bg-purple-400";
    return "bg-purple-300";
  };

  // Derive level from percentage
  const getDerivedLevel = (percentage: number) => {
     // sourcery skip: use-braces
    if (percentage <= 20) return "Beginner";
    if (percentage <= 40) return "Basic";
    if (percentage <= 60) return "Intermediate";
    if (percentage <= 80) return "Advanced";
    return "Expert";
  };

  const formatDate = (dateString: string) => {
     // sourcery skip: use-braces
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
  //
  // Extract relevant information

  const experiences = resume.experience ?? [];
  const education = resume.education ?? [];
  const languages = skills?.language ?? [];
  const programming = skills?.programming_languages ?? [];
  const otherSkills = skills?.other_skills ?? [];

  const renderSkillGroup = (
    title: string,
    skillArray: Array<{ skill_name?: string; name?: string; percentage: number }>
  ) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-800">{title}</h4>
      </div>
      {skillArray.length > 0 ? (
        skillArray.map((skill, index) => {
          const name = skill.skill_name ?? skill.name ?? "-";
          const percentage = skill.percentage ?? 0;
          const derivedLevel = getDerivedLevel(percentage);

          return (
            <div key={index} className="group mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">{name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{derivedLevel}</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
      <div className="lg:col-span-2 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">RESUME</h3>
          </div>

          <div className="mb-8">
            <h4 className="font-medium text-gray-800 mb-4">Experience</h4>
            <div className="space-y-4">
              {experiences.length > 0 ? (
                experiences.map((exp, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      {index < experiences.length - 1 && (
                        <div className="w-px h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {formatDate(exp.date_from)} - {formatDate(exp.date_to)}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h5 className="font-semibold text-gray-900 mt-1">{exp.title}</h5>
                      <p className="text-gray-600 text-sm mt-1">{exp.job_description}</p>
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
                education.map((edu, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      {index < education.length - 1 && (
                        <div className="w-px h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {formatDate(edu.from_date)} - {formatDate(edu.to_date)}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h5 className="font-semibold text-gray-900 mt-1">{edu.title}</h5>
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
    </div>
  );
};

export default ResumeTab;
