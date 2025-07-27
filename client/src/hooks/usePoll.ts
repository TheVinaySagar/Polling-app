import { useState, useCallback, useEffect } from 'react';
import { Poll, PollOption, Student, ChatMessage, PollState } from '@/types/poll';
import { useSocket } from '@/contexts/SocketContext';

export const usePoll = () => {
  const [state, setState] = useState<PollState>({
    currentPoll: null,
    students: [],
    chatMessages: [],
    pollHistory: []
  });
  
  const { socket, isConnected } = useSocket();

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Poll events
    socket.on('poll_created', (poll: Poll) => {
      setState(prev => ({
        ...prev,
        currentPoll: poll
      }));
    });

    socket.on('poll_started', (poll: Poll) => {
      setState(prev => ({
        ...prev,
        currentPoll: poll
      }));
    });

    socket.on('poll_ended', (poll: Poll) => {
      setState(prev => ({
        ...prev,
        currentPoll: poll
      }));
      
      // Refresh poll history when a poll ends
      setTimeout(() => {
        socket.emit('get_poll_history');
      }, 500);
    });

    socket.on('poll_results_updated', (poll: Poll) => {
      setState(prev => ({
        ...prev,
        currentPoll: poll
      }));
    });

    socket.on('poll_history', (polls: Poll[]) => {
      setState(prev => ({
        ...prev,
        pollHistory: polls
      }));
    });

    // Student events
    socket.on('student_joined', (student: Student) => {
      setState(prev => ({
        ...prev,
        students: [...prev.students.filter(s => s.id !== student.id), student]
      }));
    });

    socket.on('student_left', (studentId: string) => {
      setState(prev => ({
        ...prev,
        students: prev.students.filter(s => s.id !== studentId)
      }));
    });

    socket.on('student_removed', (studentId: string) => {
      setState(prev => ({
        ...prev,
        students: prev.students.filter(s => s.id !== studentId)
      }));
    });

    socket.on('students_list', (students: Student[]) => {
      setState(prev => ({
        ...prev,
        students
      }));
    });

    socket.on('student_answered', (student: Student) => {
      setState(prev => ({
        ...prev,
        students: prev.students.map(s => s.id === student.id ? student : s)
      }));
    });

    // Handle student being removed by teacher
    socket.on('student_removed', (data: { message: string }) => {
      // This is handled at the component level for students
      // Teachers don't need special handling as they see the updated students list
      console.log('Student removed event received:', data);
    });

    // Chat events
    socket.on('chat_message', (message: ChatMessage) => {
      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, message]
      }));
    });

    socket.on('chat_history', (messages: ChatMessage[]) => {
      setState(prev => ({
        ...prev,
        chatMessages: messages
      }));
    });

    socket.on('chat_cleared', (data: { message: string; deletedCount: number }) => {
      setState(prev => ({
        ...prev,
        chatMessages: []
      }));
      console.log('Chat cleared:', data);
    });

    // Connection events
    socket.on('connection_established', (data: { role: 'teacher' | 'student', id: string }) => {
      console.log('Connection established:', data);
    });

    socket.on('error', (error: { message: string; code?: string }) => {
      console.error('Socket error:', error);
      // You could show a toast notification here
    });

    // Cleanup listeners
    return () => {
      socket.off('poll_created');
      socket.off('poll_started');
      socket.off('poll_ended');
      socket.off('poll_results_updated');
      socket.off('poll_history');
      socket.off('student_joined');
      socket.off('student_left');
      socket.off('student_removed');
      socket.off('students_list');
      socket.off('student_answered');
      socket.off('chat_message');
      socket.off('chat_history');
      socket.off('connection_established');
      socket.off('error');
    };
  }, [socket]);

  const createPoll = useCallback((question: string, options: string[], timeLimit: number = 60) => {
    if (!socket) return null;

    socket.emit('create_poll', {
      question,
      options,
      timeLimit
    });

    // Return a temporary poll object for immediate UI feedback
    const poll: Poll = {
      id: `poll_${Date.now()}`,
      question,
      options: options.map((text, index) => ({
        id: `option_${index}`,
        text,
        votes: 0
      })),
      isActive: false,
      timeLimit,
      totalVotes: 0
    };

    return poll;
  }, [socket]);

  const startPoll = useCallback((pollId: string) => {
    if (!socket) return;
    socket.emit('start_poll', pollId);
  }, [socket]);

  const endPoll = useCallback(() => {
    if (!socket) return;
    socket.emit('end_poll');
  }, [socket]);

  const submitAnswer = useCallback((studentId: string, optionId: string) => {
    if (!socket || !state.currentPoll) return;
    
    socket.emit('submit_answer', {
      pollId: state.currentPoll.id,
      optionId
    });
  }, [socket, state.currentPoll]);

  const addStudent = useCallback((name: string) => {
    if (!socket) return null;

    socket.emit('join_as_student', name);

    // Return a temporary student object for immediate UI feedback
    const student: Student = {
      id: `student_${Date.now()}_${Math.random()}`,
      name,
      hasAnswered: false,
      joinTime: new Date()
    };

    return student;
  }, [socket]);

  const removeStudent = useCallback((studentId: string) => {
    if (!socket) return;
    socket.emit('remove_student', studentId);
  }, [socket]);

  const sendMessage = useCallback((sender: string, message: string, isTeacher: boolean = false) => {
    if (!socket) return;
    socket.emit('send_message', message);
  }, [socket]);

  // Teacher-specific functions
  const joinAsTeacher = useCallback(() => {
    if (!socket) return;
    socket.emit('join_as_teacher');
  }, [socket]);

  const getPollHistory = useCallback(() => {
    if (!socket) return;
    socket.emit('get_poll_history');
  }, [socket]);

  return {
    state,
    isConnected,
    createPoll,
    startPoll,
    endPoll,
    submitAnswer,
    addStudent,
    removeStudent,
    sendMessage,
    joinAsTeacher,
    getPollHistory
  };
};