import React, { useState, useEffect } from 'react';
import { Eye, Plus } from 'lucide-react';
import { FloatingBubble } from './FloatingBubble';
import { Student, ChatMessage, Poll } from '@/types/poll';

interface PollInterfaceProps {
  currentPoll: Poll | null;
  pollHistory: Poll[];
  students?: Student[];
  chatMessages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  onRemoveStudent?: (studentId: string) => void;
  onCreateNewQuestion?: () => void;
}

export const PollInterface: React.FC<PollInterfaceProps> = ({
  currentPoll,
  pollHistory,
  students = [],
  chatMessages = [],
  onSendMessage = () => {},
  onRemoveStudent,
  onCreateNewQuestion
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'history'>('main');
  const [isLoading, setIsLoading] = useState(false);

  const calculateResults = () => {
    if (!currentPoll) return [];

    return currentPoll.options.map(option => ({
      ...option,
      count: option.votes || 0,
      percentage: currentPoll.totalVotes > 0 ? Math.round(((option.votes || 0) / currentPoll.totalVotes) * 100) : 0,
      responses: []
    }));
  };

  
const renderPollQuestion = (poll: Poll, questionNumber?: number) => {
  const results = calculateResults();
  const totalResponses = poll.totalVotes || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 max-w-2xl mx-auto shadow">
      {questionNumber && (
        <div className="text-xl font-semibold px-4 pt-4 text-gray-800">
          Question {questionNumber}
        </div>
      )}

      <div className="bg-gray-600 text-white p-4 rounded-t-xl text-base font-semibold">
        {poll.question}
      </div>

      <div className="p-4 space-y-3">
        {results.map((option, index) => {
          const percentage = option.percentage;
          const barWidth = Math.max(percentage);
          const showOverlay = barWidth >= 85;

          return (
            <div key={option.id} className="relative bg-gray-100 rounded-md overflow-hidden border border-gray-200">
              {/* Filled Bar */}
              <div
                className="absolute top-0 left-0 h-full bg-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${barWidth}%` }}
              ></div>

              {/* Option Content */}
              <div className="relative z-10 flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm font-semibold flex items-center justify-center border border-gray-300">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{option.text}</span>
                </div>

                {showOverlay ? (
                  <span className="text-sm font-semibold text-white">
                    {percentage}%
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-gray-800">
                    {percentage}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalResponses === 0 && (
        <div className="p-4 text-center text-sm text-gray-500 border-t">
          No responses yet. Waiting for students to answer...
        </div>
      )}
    </div>
  );
};



  const MainView = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-end mb-8">
          <button 
            onClick={() => setCurrentView('history')}
            className="bg-purple-600 text-white px-6 py-3 rounded-full flex items-center gap-2 font-medium transition-colors"
          >
            <Eye size={20} />
            View Poll history
          </button>
        </div>

        {/* Question Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Live Poll Results</h1>
          {currentPoll ? (
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${currentPoll.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${currentPoll.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {currentPoll.isActive ? 'Poll is Live' : 'Poll Ended'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-500 font-medium">No Active Poll</span>
            </div>
          )}
        </div>

        {/* Current Poll Question */}
        {currentPoll ? (
          renderPollQuestion(currentPoll)
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 max-w-2xl mx-auto p-8 text-center">
            <div className="text-gray-500">
              <h3 className="text-xl font-semibold mb-2">No Active Poll</h3>
              <p>Create a new question to start polling your students.</p>
            </div>
          </div>
        )}

        {/* Add Question Button */}
        <div className="flex justify-center mt-8">
          <button 
            onClick={onCreateNewQuestion}
            className="bg-purple-600  text-white px-6 py-3 rounded-full flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={20} />
            Ask a new question
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

  const HistoryView = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setCurrentView('main')}
            className="bg-purple-600 text-white font-medium"
          >
            ← Back to Current Poll
          </button>
          <h1 className="text-3xl font-bold text-gray-800">View Poll History</h1>
          <div></div>
        </div>

        {/* Poll History */}
        {pollHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">
            <p className="text-lg">No poll history available</p>
            <p className="text-sm">Create your first poll to see it here</p>
          </div>
        ) : (
          <div className="space-y-12">
            {pollHistory.map((poll, index) => (
              <div key={index} className="mb-12">
                {renderPollQuestion(poll, index + 1)}
              </div>
            ))}
          </div>
        )}
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

  return currentView === 'main' ? <MainView /> : <HistoryView />;
};