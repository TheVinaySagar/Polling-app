import { teacherService, studentService, chatService, pollService } from '../services/index.js';
import { formatChatMessageForClient, formatStudentForClient, formatPollForClient } from '../utils/helpers.js';

export const handleTeacherEvents = (socket, io) => {
  socket.on('join_as_teacher', async () => {
    try {
      const teacher = await teacherService.addTeacher(socket.id);
      
      socket.emit('teacher_joined', {
        id: teacher.id,
        joinTime: teacher.joinTime
      });

      const students = await studentService.getAllStudents();
      socket.emit('students_list', students);

      const chatHistory = await chatService.getChatHistory();
      const formattedMessages = chatHistory.map(msg => formatChatMessageForClient(msg));
      socket.emit('chat_history', formattedMessages);
      
      io.emit('teacher_connected', { 
        message: 'Teacher has joined the session',
        timestamp: teacher.joinTime 
      });
      
      console.log(`Teacher joined: ${teacher.id}`);
    } catch (error) {
      console.error('Error adding teacher:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('kick_out_student', async (studentId) => {
    try {
      const teacher = await teacherService.getTeacherBySocketId(socket.id);
      if (!teacher) {
        socket.emit('error', { message: 'Only teachers can remove students' });
        return;
      }

      const student = await studentService.getStudentById(studentId);
      if (!student) {
        socket.emit('error', { message: 'Student not found' });
        return;
      }

      const removed = await studentService.removeStudent(studentId);
      if (removed) {
        io.to(student.socketId).emit('student_removed', { 
          message: 'You have been removed from the session by the teacher' 
        });
        
        io.emit('student_left', studentId);
        
        const allStudents = await studentService.getAllStudents();
        const formattedStudents = allStudents.map(s => formatStudentForClient(s));
        io.emit('students_list', formattedStudents);
        
        console.log(`Student kicked out by teacher: ${student.name}`);
      }
    } catch (error) {
      console.error('Error kicking out student:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('teacher_send_message', async (message) => {
    try {
      const teacher = await teacherService.getTeacherBySocketId(socket.id);
      if (!teacher) {
        socket.emit('error', { message: 'Only teachers can send messages with this event' });
        return;
      }

      if (!message || typeof message !== 'string' || message.trim() === '') {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      const chatMessage = await chatService.sendMessage('Teacher', message.trim(), true);
      
      io.emit('chat_message', formatChatMessageForClient(chatMessage));
      
      console.log(`Teacher chat message: ${message.trim()}`);
    } catch (error) {
      console.error('Error sending teacher message:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('teacher_clear_chat', async () => {
    try {
      const teacher = await teacherService.getTeacherBySocketId(socket.id);
      if (!teacher) {
        socket.emit('error', { message: 'Only teachers can clear chat' });
        return;
      }

      const deletedCount = await chatService.clearChatHistory();
      
      io.emit('chat_cleared', { 
        message: 'Chat history has been cleared by teacher',
        deletedCount 
      });
      
      console.log(`Chat history cleared by teacher: ${deletedCount} messages deleted`);
    } catch (error) {
      console.error('Error clearing chat:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', async () => {
    try {
      const teacher = await teacherService.disconnectTeacher(socket.id);
      if (teacher) {
        // Clear chat history when teacher disconnects (session ends)
        try {
          const deletedCount = await chatService.clearChatHistory();
          console.log(`Chat history cleared on teacher disconnect: ${deletedCount} messages deleted`);
          
          // Notify all clients that chat was cleared
          io.emit('chat_cleared', { 
            message: 'Session ended - chat history cleared',
            deletedCount 
          });
        } catch (chatError) {
          console.error('Error clearing chat on teacher disconnect:', chatError);
        }

        // End any active polls when teacher leaves
        try {
          const activePoll = await pollService.getCurrentActivePoll();
          if (activePoll) {
            const endedPoll = await pollService.endPoll();
            io.emit('poll_ended', formatPollForClient(endedPoll));
            console.log(`Poll ended due to teacher disconnect: ${endedPoll.question}`);
          }
        } catch (pollError) {
          console.error('Error ending poll on teacher disconnect:', pollError);
        }

        io.emit('teacher_disconnected', { 
          message: 'Teacher has left the session',
          timestamp: new Date()
        });
        
        console.log(`Teacher disconnected: ${teacher.id}`);
      }
    } catch (error) {
      console.error('Error handling teacher disconnect:', error);
    }
  });

  socket.on('verify_teacher', async () => {
    try {
      const teacher = await teacherService.getTeacherBySocketId(socket.id);
      socket.emit('teacher_verified', { isTeacher: !!teacher });
    } catch (error) {
      console.error('Error verifying teacher:', error);
      socket.emit('teacher_verified', { isTeacher: false });
    }
  });
};
