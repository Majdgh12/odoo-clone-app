"use client";

import React from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import type { Employee } from '../../lib/types';

interface ResumeTabProps {
  employee: Employee;
}

const ResumeTab: React.FC<ResumeTabProps> = ({ employee }) => {
  const { general_resume } = employee.user;
  const { resume, skills } = general_resume;

  const getSkillColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-purple-600';
    if (percentage >= 70) return 'bg-purple-500';
    if (percentage >= 50) return 'bg-purple-400';
    return 'bg-purple-300';
  };

  const formatDate = (dateString: string) => {
    if (dateString.toLowerCase() === 'present') return 'Current';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Left Side - Resume Content */}
      <div className="lg:col-span-2 space-y-8">

        {/* Experience Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">RESUME</h3>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Experience</h4>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-medium">
                ADD
              </button>
            </div>

            <div className="space-y-4">
              {resume.experience?.map((exp, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    {index < resume.experience.length - 1 && (
                      <div className="w-px h-16 bg-gray-300 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
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
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Education</h4>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-medium">
                ADD
              </button>
            </div>

            <div className="space-y-4">
              {resume.education?.map((edu, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    {index < resume.education.length - 1 && (
                      <div className="w-px h-16 bg-gray-300 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Skills */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">SKILLS</h3>
          <div className="flex items-center text-teal-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">TIMELINE</span>
          </div>
        </div>

        {/* Marketing Skills */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800">Marketing</h4>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-medium">
              ADD
            </button>
          </div>

          <div className="space-y-4">
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Communication</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{skills.marketing.communication.level}</span>
                  <span className="text-sm font-medium">{skills.marketing.communication.percentage}%</span>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getSkillColor(skills.marketing.communication.percentage)}`}
                  style={{ width: `${skills.marketing.communication.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Public Speaking</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{skills.marketing.public_speaking.level}</span>
                  <span className="text-sm font-medium">{skills.marketing.public_speaking.percentage}%</span>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getSkillColor(skills.marketing.public_speaking.percentage)}`}
                  style={{ width: `${skills.marketing.public_speaking.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Programming Languages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800">Programming Languages</h4>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-medium">
              ADD
            </button>
          </div>

          <div className="space-y-4">
            {skills.programming_languages?.map((skill, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{skill.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{skill.level}</span>
                    <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{skill.percentage}%</span>
                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getSkillColor(skill.percentage)}`}
                    style={{ width: `${skill.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        {skills.language && skills.language.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Languages</h4>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-medium">
                ADD
              </button>
            </div>

            <div className="space-y-4">
              {skills.language.map((lang, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">{lang.language_name}</span>
                    <div className="flex items-center space-x-2">
                      {/* Language Level Badges */}
                      <div className="flex items-center space-x-1">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                          {lang.skill_level.level === 'Fluent' ? 'C2' :
                            lang.skill_level.level === 'Advanced' ? 'C1' :
                              lang.skill_level.level === 'Intermediate' ? 'B2' :
                                lang.skill_level.level === 'Beginner' ? 'A1' : 'C1'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{lang.skill_level.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getSkillColor(lang.skill_level.percentage)}`}
                      style={{ width: `${lang.skill_level.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeTab;