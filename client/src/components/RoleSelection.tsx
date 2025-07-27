import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/poll';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole as UserRole);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <span className="text-lg">✨</span>
            Interview Poll
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to the <span className="text-black">Live Polling System</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="flex flex-row gap-6 mb-12 max-w-4xl mx-auto">
          {/* Student Card */}
          <div
            onClick={() => handleRoleSelect("student")}
            className={`flex-1 p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
              selectedRole === "student"
                ? "border-purple-500 bg-purple-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
            }`}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-3">I'm a Student</h3>
            <p className="text-gray-600 leading-relaxed">
              Submit answers and view live poll results in real-time. Participate in interactive learning sessions.
            </p>
          </div>

          {/* Teacher Card */}
          <div
            onClick={() => handleRoleSelect("teacher")}
            className={`flex-1 p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
              selectedRole === "teacher"
                ? "border-purple-500 bg-purple-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
            }`}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-3">I'm a Teacher</h3>
            <p className="text-gray-600 leading-relaxed">
              Create and manage polls, ask questions, and monitor your students' responses in real-time.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`px-12 py-4 rounded-full text-lg font-medium transition-all duration-200 ${
              selectedRole
                ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};