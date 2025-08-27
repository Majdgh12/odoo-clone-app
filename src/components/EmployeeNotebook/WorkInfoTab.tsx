"use client";

import React from 'react';
import type { Employee } from '../../lib/types';

interface WorkInfoTabProps {
  employee: Employee;
}

const WorkInfoTab: React.FC<WorkInfoTabProps> = ({ employee }) => {
  const { work_info } = employee.user;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Left Side - Location, Approvers, Schedule, Planning */}
      <div className="space-y-8">
        
        {/* Location Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">LOCATION</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-start">
                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                  Work Address <span className="text-blue-500">?</span>
                </span>
                <div className="ml-4">
                  <p className="text-sm text-gray-900 whitespace-pre-line">{work_info.work_address}</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-start">
                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                  Work Location <span className="text-blue-500">?</span>
                </span>
                <div className="ml-4 flex items-center">
                  <span className="text-sm text-gray-900">{work_info.work_location}</span>
                  <div className="ml-2 flex space-x-1">
                    <span className="text-gray-400">⇄</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approvers Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">APPROVERS</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-start">
                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                  Time Off <span className="text-blue-500">?</span>
                </span>
                <span className="text-sm text-gray-900 ml-4">{work_info.approvers.time_off}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-start">
                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                  Timesheet <span className="text-blue-500">?</span>
                </span>
                <span className="text-sm text-gray-900 ml-4">{work_info.approvers.timesheet}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SCHEDULE</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-start">
                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                  Working Hours <span className="text-blue-500">?</span>
                </span>
                <span className="text-sm text-gray-900 ml-4">{work_info.schedule.working_hours}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-start">
                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                  Timezone <span className="text-blue-500">?</span>
                </span>
                <span className="text-sm text-gray-900 ml-4">{work_info.schedule.timezone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Planning Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PLANNING</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-start">
                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                  Roles <span className="text-blue-500">?</span>
                </span>
                <div className="ml-4 flex flex-wrap gap-1">
                  {work_info.planning.roles.map((role, index) => (
                    <span key={index} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-medium relative">
                      {role}
                      <button className="ml-2 text-pink-600 hover:text-pink-800">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-start">
                <span className="text-sm text-gray-500 w-32 flex-shrink-0 mt-1">
                  Default Role <span className="text-blue-500">?</span>
                </span>
                <span className="text-sm text-gray-900 ml-4">
                  {work_info.planning.default_roles.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Organization Chart */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">ORGANIZATION CHART</h3>
        </div>
        
        <div className="space-y-4">
          {/* Sample org chart entries - you can customize these based on your data */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <img 
                src="https://via.placeholder.com/40x40.png?text=MA" 
                alt="Mitchell Admin"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-blue-600 text-sm">Mitchell Admin</p>
                <p className="text-xs text-gray-500">Chief Executive Officer</p>
              </div>
            </div>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">25</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <img 
                src="https://via.placeholder.com/40x40.png?text=MD" 
                alt="Marc Demo"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-blue-600 text-sm">Marc Demo</p>
                <p className="text-xs text-gray-500">Experienced Developer</p>
              </div>
            </div>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">12</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <img 
                src="https://via.placeholder.com/40x40.png?text=PW" 
                alt="Paul Williams"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-blue-600 text-sm">Paul Williams</p>
                <p className="text-xs text-gray-500">Experienced Developer</p>
              </div>
            </div>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">2</span>
          </div>

          <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center">
              <img 
                src="https://via.placeholder.com/40x40.png?text=BE" 
                alt="Beth Evans"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">Beth Evans</p>
                <p className="text-xs text-gray-500">Experienced Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkInfoTab;