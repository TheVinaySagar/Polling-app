import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';
import { Clock } from 'lucide-react';

interface LiveResultsProps {
  poll: Poll;
  showPercentages?: boolean;
  timeRemaining?: number;
}

export const LiveResults: React.FC<LiveResultsProps> = ({ 
  poll, 
  showPercentages = true,
  timeRemaining 
}) => {
  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const getBarWidth = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return (votes / poll.totalVotes) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPollQuestion = (questionNumber = null) => (
    <div className="bg-white rounded-lg border border-gray-200 max-w-2xl mx-auto">
      {questionNumber && (
        <div className="text-xl font-semibold mb-4 text-gray-800">
          Question {questionNumber}
        </div>
      )}
      
      <div className="bg-gray-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <span className="text-lg font-medium">{poll.question}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap">
            {poll.totalVotes} response{poll.totalVotes !== 1 ? 's' : ''}
          </span>
          {poll.isActive && (
            <span className="text-sm bg-green-500 px-3 py-1 rounded-full animate-pulse whitespace-nowrap">
              LIVE
            </span>
          )}
        </div>
      </div>
      
      <div className="p-0">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option.votes);
          
          return (
            <div key={option.id} className="flex items-center border-b border-gray-200 last:border-b-0">
              <div 
                className="flex items-center bg-blue-500 text-white px-4 py-3 relative transition-all duration-500 ease-out"
                style={{ width: `${Math.max(percentage, 0)}%` }}
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-500 font-semibold text-sm mr-3 flex-shrink-0">
                  {index + 1}
                </div>
                <span className="font-medium text-sm truncate">{option.text}</span>
              </div>
              <div className="flex-1 bg-gray-100 px-4 py-3 flex items-center justify-between">
                <span className="text-gray-700 text-sm flex-1 mr-4">{option.text}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-semibold text-gray-700">{percentage}%</span>
                  <span className="text-xs text-gray-500">
                    ({option.votes} vote{option.votes !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {poll.totalVotes === 0 && (
        <div className="p-4 text-center text-gray-500 border-t">
          <p className="text-sm">No responses yet. Waiting for students to answer...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Live Poll Results</h2>
        {timeRemaining !== undefined && timeRemaining > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <Clock className="w-5 h-5" />
            <span className="font-mono text-lg font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {renderPollQuestion()}

      {!poll.isActive && (
        <div className="text-center py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-lg text-red-700 font-medium">
              Poll has ended. Results are final.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
