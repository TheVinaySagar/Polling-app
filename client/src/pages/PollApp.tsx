import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '@/types/poll';
import { RoleSelection } from '@/components/RoleSelection';
import { NameEntry } from '@/components/NameEntry';
import { TeacherPollCreator } from '@/components/TeacherPollCreator';
import { StudentPollView } from '@/components/StudentPollView';
import { usePoll } from '@/hooks/usePoll';
import { SocketProvider } from '@/contexts/SocketContext';

const PollApp: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const hasJoinedRef = useRef(false);
  
  const { 
    state, 
    isConnected,
    createPoll, 
    startPoll, 
    endPoll, 
    addStudent, 
    removeStudent, 
    sendMessage, 
    submitAnswer,
    joinAsTeacher 
  } = usePoll();

  useEffect(() => {
    const storedRole = sessionStorage.getItem('userRole') as UserRole | null;
    const storedName = sessionStorage.getItem('studentName');
    
    if (storedRole) {
      setUserRole(storedRole);
      if (storedRole === 'student' && storedName) {
        setStudentName(storedName);
      }
    }
  }, []);

  // Auto-connect when role is set
  useEffect(() => {
    if (userRole && isConnected && !hasJoinedRef.current) {
      if (userRole === 'teacher') {
        joinAsTeacher();
        hasJoinedRef.current = true;
      } else if (userRole === 'student' && studentName) {
        
        hasJoinedRef.current = true;
      }
    }
  }, [userRole, studentName, isConnected, joinAsTeacher]); 

 
  useEffect(() => {
    if (userRole === 'student' && studentName) {
      const student = state.students.find(s => s.name === studentName);
      if (student) {
        setCurrentStudent(student);
      }
    }
  }, [state.students, userRole, studentName]);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    sessionStorage.setItem('userRole', role);
    hasJoinedRef.current = false; // Reset the join flag when role changes
  };

  const handleNameSubmit = (name: string) => {
    setStudentName(name);
    sessionStorage.setItem('studentName', name);
    hasJoinedRef.current = false; // Reset the join flag when name changes
  };

  const handleTeacherCreatePoll = (question: string, options: string[], timeLimit: number) => {
    createPoll(question, options, timeLimit);
  };

  const handleTeacherSendMessage = (message: string) => {
    sendMessage('Teacher', message, true);
  };

  const handleStudentSendMessage = (message: string) => {
    sendMessage(studentName, message, false);
  };

  const handleRemoveStudent = (studentId: string) => {
    removeStudent(studentId);
  };

  // Show connection status if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Connecting to server...</h2>
          <p className="text-gray-500 mt-2">Please make sure the backend server is running on port 3001</p>
        </div>
      </div>
    );
  }

  // Role selection phase
  if (!userRole) {
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  // Student name entry phase
  if (userRole === 'student' && !studentName) {
    return <NameEntry onNameSubmit={handleNameSubmit} />;
  }

  // Main app interface
  if (userRole === 'teacher') {
    return (
      <TeacherPollCreator
        students={state.students}
        chatMessages={state.chatMessages}
        currentPoll={state.currentPoll}
        pollHistory={state.pollHistory}
        onSendMessage={handleTeacherSendMessage}
        onRemoveStudent={handleRemoveStudent}
        onCreatePoll={(pollData) => {
          const { question, options, timeLimit } = pollData;
          const optionTexts = options.map(opt => opt.text);
          const timeLimitSeconds = parseInt(timeLimit.replace(/\D/g, ''));
          handleTeacherCreatePoll(question, optionTexts, timeLimitSeconds);
        }}
      />
    );
  }

  if (userRole === 'student' && studentName) {
    return (
      <StudentPollView
        studentName={studentName}
        chatMessages={state.chatMessages}
        students={state.students}
        onSendMessage={handleStudentSendMessage}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Setting up your session...</h2>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SocketProvider>
      <PollApp />
    </SocketProvider>
  );
};

export default App;