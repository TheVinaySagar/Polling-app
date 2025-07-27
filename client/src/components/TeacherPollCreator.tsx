import React, { useState, useEffect } from 'react';
import { FloatingBubble } from './FloatingBubble';
import { PollInterface } from './PollInterface';
import { Student, ChatMessage, Poll } from '@/types/poll';
import { useSocket } from '@/contexts/SocketContext';

interface TeacherPollCreatorProps {
  students?: Student[];
  chatMessages?: ChatMessage[];
  currentPoll?: Poll | null;
  pollHistory?: Poll[];
  onSendMessage?: (message: string) => void;
  onRemoveStudent?: (studentId: string) => void;
  onCreatePoll?: (pollData: any) => void;
}

interface Option {
  id: number;
  text: string;
}

interface PollData {
  question: string;
  timeLimit: string;
  options: Option[];
  correctAnswer: Record<number, string>;
}

export const TeacherPollCreator: React.FC<TeacherPollCreatorProps> = ({
  students = [],
  chatMessages = [],
  currentPoll = null,
  pollHistory = [],
  onSendMessage = () => {},
  onRemoveStudent,
  onCreatePoll
}) => {
  const [currentView, setCurrentView] = useState<'creator' | 'interface'>('creator');
  const { socket } = useSocket();
  
  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState("60 seconds");
  const [options, setOptions] = useState<Option[]>(
    [ { id: 1, text: "" }, { id: 2, text: "" } ]
  );
  const [correctAnswer, setCorrectAnswer] = useState<Record<number, string>>({ 1: "no", 2: "no" });

  // Request poll history when component mounts
  useEffect(() => {
    if (socket) {
      // Request poll history from server
      socket.emit('get_poll_history');
    }
  }, [socket]);

  const timeOptions = [
    "30 seconds",
    "60 seconds",
    "90 seconds",
    "2 minutes",
    "5 minutes"
  ];

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  const handleOptionChange = (id: number, value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text: value } : option
    ));
  };

  const handleCorrectAnswerChange = (optionId: number, value: string) => {
    setCorrectAnswer(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const addMoreOption = () => {
    const newId = Math.max(...options.map(o => o.id)) + 1;
    setOptions([...options, { id: newId, text: "" }]);
    setCorrectAnswer(prev => ({ ...prev, [newId]: "no" }));
  };

  const handleAskQuestion = () => {
    if (!question.trim() || options.some(opt => !opt.text.trim())) {
      alert("Please fill in the question and all options");
      return;
    }

    const pollData: PollData = {
      question,
      timeLimit,
      options,
      correctAnswer
    };
    
    if (onCreatePoll) {
      onCreatePoll(pollData);
    }
    
    // Navigate to poll interface - it will use the real-time currentPoll from Socket.io
    setCurrentView('interface');
  };

  const handleCreateNewQuestion = () => {
    // Reset form
    setQuestion("");
    setOptions([{ id: 1, text: "" }, { id: 2, text: "" }]);
    setCorrectAnswer({ 1: "no", 2: "no" });
    setCurrentView('creator');
  };

  if (currentView === 'interface') {
    return (
      <PollInterface
        currentPoll={currentPoll}
        pollHistory={pollHistory}
        students={students}
        chatMessages={chatMessages}
        onSendMessage={onSendMessage}
        onRemoveStudent={onRemoveStudent}
        onCreateNewQuestion={handleCreateNewQuestion}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Badge */}
        <div className="mb-8">
          <div className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2">
            <span className="text-lg">✨</span>
            Interview Poll
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's Get Started
          </h1>
          <p className="text-gray-600 text-lg">
            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>
        </div>

        {/* Question Input Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <label className="text-lg font-semibold text-gray-900">
              Enter your question
            </label>
            <div className="relative">
              <select 
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="appearance-none bg-gray-100 text-gray-900 px-4 py-2 pr-8 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={question}
              onChange={handleQuestionChange}
              className="w-full h-32 p-4 bg-gray-100 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              placeholder="Enter your question here..."
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-500">
              {question.length}/100
            </div>
          </div>
        </div>

        {/* Options and Correct Answer Section */}
        <div className="flex gap-8 mb-8">
          {/* Edit Options */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Options</h3>
            <div className="space-y-3">
              {options.map((option) => (
                <div key={option.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {option.id}
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="flex-1 p-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder={`Option ${option.id}`}
                  />
                </div>
              ))}
              
              <button
                onClick={addMoreOption}
                className="mt-4 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                + Add More option
              </button>
            </div>
          </div>

          {/* Is it Correct? */}
          <div className="w-64">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Is it Correct?</h3>
            <div className="space-y-6">
              {options.map((option) => (
                <div key={option.id} className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`correct-${option.id}`}
                      value="yes"
                      checked={correctAnswer[option.id] === "yes"}
                      onChange={(e) => handleCorrectAnswerChange(option.id, e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      correctAnswer[option.id] === "yes" 
                        ? "border-purple-600 bg-purple-600" 
                        : "border-gray-300"
                    }`}>
                      {correctAnswer[option.id] === "yes" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-900">Yes</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`correct-${option.id}`}
                      value="no"
                      checked={correctAnswer[option.id] === "no"}
                      onChange={(e) => handleCorrectAnswerChange(option.id, e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      correctAnswer[option.id] === "no" 
                        ? "border-purple-600 bg-purple-600" 
                        : "border-gray-300"
                    }`}>
                      {correctAnswer[option.id] === "no" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-900">No</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ask Question Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAskQuestion}
            className="px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Ask Question
          </button>
        </div>
      </div>

      {/* Floating Bubble */}
      <FloatingBubble
        students={students}
        chatMessages={chatMessages}
        onSendMessage={onSendMessage}
        onRemoveStudent={onRemoveStudent}
        isTeacher={true}
      />
    </div>
  );
};
