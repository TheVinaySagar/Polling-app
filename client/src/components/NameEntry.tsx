import React, { useState } from 'react';

interface NameEntryProps {
  onNameSubmit: (name: string) => void;
}

export const NameEntry: React.FC<NameEntryProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('Rahul Bajaj');

  const handleContinue = () => {
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <span className="text-lg">✨</span>
            Interview Poll
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Let's Get Started
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto">
            If you're a student, you'll be able to <span className="font-semibold text-gray-800">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
          </p>
        </div>

        {/* Name Input Section */}
        <div className="mb-12">
          <label className="block text-gray-900 text-lg font-medium mb-4 text-center">
            Enter your Name
          </label>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 text-lg text-gray-900 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
              placeholder="Enter your name"
            />
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!name.trim()}
            className={`px-12 py-4 rounded-full text-lg font-medium transition-all duration-200 ${
              name.trim()
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