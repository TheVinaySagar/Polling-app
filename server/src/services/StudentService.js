import { Student } from '../models/index.js';
import { generateId, getCurrentTimestamp, validateRequired, sanitizeString } from '../utils/helpers.js';

class StudentService {
  async addStudent(name, socketId) {
    try {
      validateRequired(['name', 'socketId'], { name, socketId });

      const existingStudent = await Student.findOne({ 
        name: sanitizeString(name),
        isConnected: true 
      });

      if (existingStudent) {
        existingStudent.socketId = socketId;
        existingStudent.isConnected = true;
        await existingStudent.save();
        return existingStudent;
      }

      const studentId = generateId();
      const student = new Student({
        id: studentId,
        name: sanitizeString(name),
        socketId: socketId,
        hasAnswered: false,
        joinTime: getCurrentTimestamp(),
        isConnected: true
      });

      await student.save();
      return student;
    } catch (error) {
      throw new Error(`Failed to add student: ${error.message}`);
    }
  }

  async removeStudent(studentId) {
    try {
      const result = await Student.deleteOne({ id: studentId });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to remove student: ${error.message}`);
    }
  }

  async disconnectStudent(socketId) {
    try {
      const student = await Student.findOne({ socketId });
      if (student) {
        student.isConnected = false;
        await student.save();
        return student;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to disconnect student: ${error.message}`);
    }
  }

  async updateStudentAnswer(studentId, optionId, pollId) {
    try {
      const student = await Student.findOne({ id: studentId });
      if (!student) {
        throw new Error('Student not found');
      }

      student.hasAnswered = true;
      student.answer = optionId;
      student.pollId = pollId;

      await student.save();
      return student;
    } catch (error) {
      throw new Error(`Failed to update student answer: ${error.message}`);
    }
  }

  async resetStudentAnswers() {
    try {
      await Student.updateMany({}, {
        hasAnswered: false,
        answer: null,
        pollId: null
      });
    } catch (error) {
      throw new Error(`Failed to reset student answers: ${error.message}`);
    }
  }

  async getAllStudents() {
    try {
      const students = await Student.find({ isConnected: true })
        .sort({ joinTime: 1 });
      return students;
    } catch (error) {
      throw new Error(`Failed to get students: ${error.message}`);
    }
  }

  async getStudentById(studentId) {
    try {
      const student = await Student.findOne({ id: studentId });
      return student;
    } catch (error) {
      throw new Error(`Failed to get student: ${error.message}`);
    }
  }

  async getStudentBySocketId(socketId) {
    try {
      const student = await Student.findOne({ socketId });
      return student;
    } catch (error) {
      throw new Error(`Failed to get student by socket: ${error.message}`);
    }
  }

  async getStudentByName(name) {
    try {
      const student = await Student.findOne({ 
        name: sanitizeString(name),
        isConnected: true 
      });
      return student;
    } catch (error) {
      throw new Error(`Failed to get student by name: ${error.message}`);
    }
  }

  async getStudentsCount() {
    try {
      const count = await Student.countDocuments({ isConnected: true });
      return count;
    } catch (error) {
      throw new Error(`Failed to get students count: ${error.message}`);
    }
  }

  async cleanupDisconnectedStudents() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const result = await Student.deleteMany({
        isConnected: false,
        updatedAt: { $lt: oneHourAgo }
      });
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up disconnected students:', error);
      return 0;
    }
  }
}

export const studentService = new StudentService();