import { chatService, teacherService, studentService } from '../services/index.js';
import { formatChatMessageForClient } from '../utils/helpers.js';

export const handleChatEvents = (socket, io) => {
  socket.on('send_message', async (message) => {
    try {
      if (!message || typeof message !== 'string' || message.trim() === '') {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      const teacher = await teacherService.getTeacherBySocketId(socket.id);
      const student = await studentService.getStudentBySocketId(socket.id);
      
      let sender = 'Unknown';
      let isTeacher = false;

      if (teacher) {
        sender = 'Teacher';
        isTeacher = true;
      } else if (student) {
        sender = student.name;
        isTeacher = false;
      } else {
        socket.emit('error', { message: 'You must join as teacher or student to send messages' });
        return;
      }

      const chatMessage = await chatService.sendMessage(sender, message.trim(), isTeacher);
      
      io.emit('chat_message', formatChatMessageForClient(chatMessage));
      
      console.log(`Chat message from ${sender}: ${message.trim()}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('get_chat_history', async () => {
    try {
      const messages = await chatService.getChatHistory();
      const formattedMessages = messages.map(msg => formatChatMessageForClient(msg));
      socket.emit('chat_history', formattedMessages);
    } catch (error) {
      console.error('Error getting chat history:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('clear_chat', async () => {
    try {
      const teacher = await teacherService.getTeacherBySocketId(socket.id);
      if (!teacher) {
        socket.emit('error', { message: 'Only teachers can clear chat history' });
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

  socket.on('delete_message', async (messageId) => {
    try {
      const teacher = await teacherService.getTeacherBySocketId(socket.id);
      if (!teacher) {
        socket.emit('error', { message: 'Only teachers can delete messages' });
        return;
      }

      const deleted = await chatService.deleteMessage(messageId);
      if (deleted) {
        io.emit('message_deleted', { messageId });
        console.log(`Message deleted by teacher: ${messageId}`);
      } else {
        socket.emit('error', { message: 'Message not found' });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('error', { message: error.message });
    }
  });
};
