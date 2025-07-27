import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  joinTime: {
    type: Date,
    default: Date.now
  },
  isConnected: {
    type: Boolean,
    default: true
  }
});

export const Teacher = mongoose.model('Teacher', teacherSchema);
