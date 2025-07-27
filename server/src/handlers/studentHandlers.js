import { studentService, teacherService } from '../services/index.js';
import { formatStudentForClient } from '../utils/helpers.js';

export const handleStudentEvents = (socket, io) => {
  socket.on('join_as_student', async (name) => {
    try {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        socket.emit('error', { message: 'Valid student name is required' });
        return;
      }

      const student = await studentService.addStudent(name.trim(), socket.id);
      
      socket.emit('student_joined', formatStudentForClient(student));
      
      io.emit('student_joined', formatStudentForClient(student));
      
      const allStudents = await studentService.getAllStudents();
      const formattedStudents = allStudents.map(s => formatStudentForClient(s));
      io.emit('students_list', formattedStudents);
      
      console.log(`Student joined: ${student.name}`);
    } catch (error) {
      console.error('Error adding student:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('remove_student', async (studentId) => {
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
        
        console.log(`Student removed: ${student.name}`);
      }
    } catch (error) {
      console.error('Error removing student:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('get_students', async () => {
    try {
      const students = await studentService.getAllStudents();
      const formattedStudents = students.map(s => formatStudentForClient(s));
      socket.emit('students_list', formattedStudents);
    } catch (error) {
      console.error('Error getting students:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', async () => {
    try {
      const student = await studentService.disconnectStudent(socket.id);
      if (student) {
        io.emit('student_left', student.id);
        
        const allStudents = await studentService.getAllStudents();
        const formattedStudents = allStudents.map(s => formatStudentForClient(s));
        io.emit('students_list', formattedStudents);
        
        console.log(`Student disconnected: ${student.name}`);
      }
    } catch (error) {
      console.error('Error handling student disconnect:', error);
    }
  });
};
