import { Teacher } from '../models/index.js';
import { generateId, getCurrentTimestamp } from '../utils/helpers.js';

class TeacherService {
  async addTeacher(socketId) {
    try {
      await Teacher.deleteMany({});

      const teacherId = generateId();
      const teacher = new Teacher({
        id: teacherId,
        socketId: socketId,
        joinTime: getCurrentTimestamp(),
        isConnected: true
      });

      await teacher.save();
      return teacher;
    } catch (error) {
      throw new Error(`Failed to add teacher: ${error.message}`);
    }
  }

  async disconnectTeacher(socketId) {
    try {
      const teacher = await Teacher.findOne({ socketId });
      if (teacher) {
        await Teacher.deleteOne({ socketId });
        return teacher;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to disconnect teacher: ${error.message}`);
    }
  }

  async getCurrentTeacher() {
    try {
      const teacher = await Teacher.findOne({ isConnected: true });
      return teacher;
    } catch (error) {
      throw new Error(`Failed to get current teacher: ${error.message}`);
    }
  }

  async getTeacherBySocketId(socketId) {
    try {
      const teacher = await Teacher.findOne({ socketId });
      return teacher;
    } catch (error) {
      throw new Error(`Failed to get teacher by socket: ${error.message}`);
    }
  }

  async isTeacherConnected() {
    try {
      const teacher = await Teacher.findOne({ isConnected: true });
      return !!teacher;
    } catch (error) {
      return false;
    }
  }

  async cleanupDisconnectedTeachers() {
    try {
      const result = await Teacher.deleteMany({ isConnected: false });
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up disconnected teachers:', error);
      return 0;
    }
  }
}

export const teacherService = new TeacherService();
