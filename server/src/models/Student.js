import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  socketId: {
    type: String,
    required: true
  },
  hasAnswered: {
    type: Boolean,
    default: false
  },
  answer: {
    type: String,
    default: null
  },
  joinTime: {
    type: Date,
    default: Date.now
  },
  isConnected: {
    type: Boolean,
    default: true
  },
  pollId: {
    type: String,
    default: null
  }
});

export const Student = mongoose.model('Student', studentSchema);
