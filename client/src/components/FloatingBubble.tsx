import React, { useState } from 'react';
import { ChatMessage, Student } from '@/types/poll';
import { TabsContent } from '@radix-ui/react-tabs';

interface FloatingBubbleProps {
  students: Student[];
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onRemoveStudent?: (studentId: string) => void;
  isTeacher?: boolean;
  currentStudentId?: string;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  students,
  chatMessages,
  onSendMessage,
  onRemoveStudent,
  isTeacher = false,
  currentStudentId
}) => {
  const [activeTab, setActiveTab] = useState("participants");
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const connectedStudents = students.filter(s => s.isConnected !== false);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      onSendMessage(chatMessage.trim());
      setChatMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Bubble Popup */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 mb-2">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-gray-600 hover:text-gray-800 bg-gray-50"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "participants"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-gray-600 hover:text-gray-800 bg-gray-50"
              }`}
            >
              Participants
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-80">
            {activeTab === "participants" && (
              <div className="p-4 h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-600">
                  <span>Name</span>
                  <span>Action</span>
                </div>
                <div className="space-y-3">
                  {connectedStudents.map((student) => (
                    <div key={student.id} className="flex justify-between items-center py-1">
                      <span className="text-gray-900 text-sm">{student.name}</span>
                      {isTeacher && onRemoveStudent && (
                        <button 
                          onClick={() => onRemoveStudent(student.id)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          Kick out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="flex flex-col h-full">
                {/* Chat Messages */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id}>
                        {!msg.isTeacher && msg.sender !== currentStudentId ? (
                          <>
                            <div className="text-xs text-blue-600 font-medium mb-1">{msg.sender}</div>
                            <div className="bg-gray-800 text-white px-3 py-2 rounded-2xl rounded-bl-md text-sm max-w-xs">
                              {msg.message}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-blue-600 font-medium mb-1">
                              {msg.isTeacher ? 'Teacher' : msg.sender}
                            </div>
                            <div className="bg-purple-600 text-white px-3 py-2 rounded-2xl rounded-br-md text-sm max-w-xs">
                              {msg.message}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Bubble Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
};
