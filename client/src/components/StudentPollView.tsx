import React, { useState, useEffect } from 'react';
import { FloatingBubble } from './FloatingBubble';
import { Student, ChatMessage, Poll } from '@/types/poll';
import { useSocket } from '@/contexts/SocketContext';

interface StudentPollViewProps {
  studentName: string;
  students?: Student[];
  chatMessages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

export const StudentPollView: React.FC<StudentPollViewProps> = ({
  studentName,
  students = [],
  chatMessages = [],
  onSendMessage = () => {}
}) => {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isKickedOut, setIsKickedOut] = useState(false);
  const { socket, isConnected } = useSocket();

  // Join as student when component mounts and socket is connected
  useEffect(() => {
    if (socket && isConnected && studentName) {
      console.log('Joining as student:', studentName);
      socket.emit('join_as_student', studentName);
    }
  }, [socket, isConnected, studentName]);

  // Socket.io event listeners for real-time poll updates
  useEffect(() => {
    if (!socket) return;

    // Listen for new polls
    socket.on('poll_created', (poll: Poll) => {
      setCurrentPoll(poll);
      setSelectedOption(null);
      setHasSubmitted(false);
      setTimeLeft(poll.timeLimit);
    });

    // Listen for poll start
    socket.on('poll_started', (poll: Poll) => {
      setCurrentPoll(poll);
      if (poll.startTime) {
        const startTime = new Date(poll.startTime).getTime();
        const endTime = startTime + (poll.timeLimit * 1000);
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
      }
    });

    // Listen for poll end
    socket.on('poll_ended', (poll: Poll) => {
      setCurrentPoll(poll);
      setTimeLeft(0);
    });

    // Listen for poll results updates
    socket.on('poll_results_updated', (poll: Poll) => {
      setCurrentPoll(poll);
    });

    // Listen for being removed by teacher
    socket.on('student_removed', (data: { message: string }) => {
      console.log('Student removed:', data.message);
      setIsKickedOut(true);
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('studentName');
    });

    return () => {
      socket.off('poll_created');
      socket.off('poll_started'); 
      socket.off('poll_ended');
      socket.off('poll_results_updated');
      socket.off('student_removed');
    };
  }, [socket]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !hasSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentPoll && !hasSubmitted) {
      // Auto-submit when time runs out
      handleAutoSubmit();
    }
  }, [timeLeft, hasSubmitted, currentPoll]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentPoll || hasSubmitted || !socket) return;

    setIsLoading(true);
    try {
      // Use Socket.io to submit answer
      socket.emit('submit_answer', {
        pollId: currentPoll.id,
        optionId: selectedOption
      });

      setHasSubmitted(true);
      console.log('Answer submitted successfully');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert(`Failed to submit answer: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (selectedOption && currentPoll && !hasSubmitted) {
      await handleSubmitAnswer();
    }
  };

  // Kicked out view
  const KickedOutView = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        {/* Intervue Poll Button */}
        <div className="mb-8">
          <div className="bg-purple-500 text-white px-6 py-3 rounded-full flex items-center gap-2 font-medium mx-auto w-fit">
            <span className="text-lg">✨</span>
            Intervue Poll
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          You've been Kicked out !
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Looks like the teacher had removed you from the poll system. Please<br />
          try again sometime.
        </p>

        {/* Try Again Button */}
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors hover:bg-purple-700 shadow-lg hover:shadow-xl"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Show kicked out view if student was removed
  if (isKickedOut) {
    return <KickedOutView />;
  }

  // Show connection status if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Connecting to server...</h2>
          <p className="text-gray-500 mt-2">Please wait while we establish connection...</p>
        </div>
      </div>
    );
  }

  if (!currentPoll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-purple-200 rounded-full mx-auto mb-4"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Poll</h2>
          <p className="text-gray-600">Your teacher will start a poll soon...</p>
        </div>
        
        <FloatingBubble
          students={students}
          chatMessages={chatMessages}
          onSendMessage={onSendMessage}
          isTeacher={false}
          currentStudentId={studentName}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 mb-4">
            <span className="text-lg">✨</span>
            Interview Poll
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Live Poll</h1>
          <p className="text-gray-600">Hello {studentName}! Please answer the question below.</p>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-center">
            <div className={`text-4xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-purple-600'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <p className="text-center text-gray-600 mt-2">Time remaining</p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="bg-gray-600 text-white p-4 rounded-t-lg">
            <h2 className="text-lg font-medium">{currentPoll.question}</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {currentPoll.options.map((option, index) => (
                <label
                  key={option.id}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  } ${hasSubmitted ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => !hasSubmitted && setSelectedOption(option.id)}
                    className="sr-only"
                    disabled={hasSubmitted}
                  />
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedOption === option.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedOption === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`font-medium mr-3 ${selectedOption === option.id ? 'text-purple-700' : 'text-gray-700'}`}>
                      {index + 1}.
                    </span>
                    <span className={selectedOption === option.id ? 'text-purple-700' : 'text-gray-700'}>
                      {option.text}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          {hasSubmitted ? (
            <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Answer Submitted!
            </div>
          ) : (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || isLoading || timeLeft === 0}
              className={`px-8 py-3 rounded-full text-lg font-medium transition-colors ${
                selectedOption && !isLoading && timeLeft > 0
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit Answer'}
            </button>
          )}
        </div>
      </div>

      <FloatingBubble
        students={students}
        chatMessages={chatMessages}
        onSendMessage={onSendMessage}
        isTeacher={false}
        currentStudentId={studentName}
      />
    </div>
  );
};
